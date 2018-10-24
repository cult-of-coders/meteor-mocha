import { _ } from "underscore";
import Test from "mocha/lib/test";
import Suite from "mocha/lib/suite";
import utils from "mocha/lib/utils";
import { Mongo } from "meteor/mongo";
import { Mocha } from "meteor/practicalmeteor:mocha-core";
import { EventEmitter } from "events";
import ObjectLogger from "./ObjectLogger";
import MeteorPublishReporter from "./../reporters/MeteorPublishReporter";
import ClientServerReporter from "./../reporters/ClientServerReporter";
import { REPORTERS, reporters } from "../reporters";
import RunCollection from "./RunCollection";

const log = new ObjectLogger("MochaRunner", "info");

// Recursive function that starts with global suites and adds all sub suites within each global suite
function addTestsToMochaRunner(fromSuite, toSuite) {
  try {
    log.enter("_addTestToMochaRunner");

    const addHooks = hookName => {
      for (let hook of Array.from(fromSuite[`_${hookName}`])) {
        toSuite[hookName](hook.title, hook.fn);
      }
      return log.debug(
        `Hook ${hookName} for '${fromSuite.fullTitle()}' added.`
      );
    };

    addHooks("beforeAll");
    addHooks("afterAll");
    addHooks("beforeEach");
    addHooks("afterEach");

    for (let test of Array.from(fromSuite.tests)) {
      test = new Test(test.title, test.fn);
      toSuite.addTest(test);
      log.debug(`Tests for '${fromSuite.fullTitle()}' added.`);
    }

    const result = [];
    for (let suite of Array.from(fromSuite.suites)) {
      const newSuite = Suite.create(toSuite, suite.title);
      newSuite.timeout(suite.timeout());
      log.debug(
        `Suite ${newSuite.fullTitle()}  added to '${fromSuite.fullTitle()}'.`
      );
      result.push(addTestsToMochaRunner(suite, newSuite));
    }

    return result;
  } finally {
    log.return();
  }
}

function escapeGrep(grep) {
  if (grep == null) {
    grep = "";
  }
  try {
    log.enter("escapeGrep", grep);
    const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
    grep.replace(matchOperatorsRe, "\\$&");

    return new RegExp(grep);
  } finally {
    log.return();
  }
}

class MochaRunner extends EventEmitter {
  constructor() {
    super();

    this.VERSION = "3.0.0";
    this.serverRunEvents = null;
    this.publishers = {};
    this.utils = utils;
    this.runId = Random.id();
  }

  runServerTests = (runId, grep) => {
    try {
      log.enter("runServerTests", runId);
      check(runId, String);
      check(grep, Match.Optional(Match.OneOf(null, String)));
      const mochaRunner = new Mocha();
      addTestsToMochaRunner(mocha.suite, mochaRunner.suite);

      mochaRunner.reporter(MeteorPublishReporter, {
        grep: escapeGrep(grep),
        publisher: this.publishers[runId]
      });

      log.info(`Starting server side tests with run id ${runId}`);
      return mochaRunner.run(failures => log.warn("failures:", failures));
    } finally {
      log.return();
    }
  }

  runEverywhere() {
    Meteor.subscribe("mochaServerRunEvents", this.runId, {
      onReady: _.bind(this.onServerRunSubscriptionReady, this),
      onError: _.bind(this.onServerRunSubscriptionError, this)
    });
  }

  setReporter(reporter) {
    this.reporter = reporter;
  }

  onServerRunSubscriptionReady = () => {
    log.enter("onServerRunSubscriptionReady");

    const query = utils.parseQuery(location.search || "");

    Meteor.call("mocha/runServerTests", this.runId, query.grep, function(
      err
    ) {
      log.debug("tests started");
      if (err) {
        return log.error(err);
      }
    });

    return Tracker.autorun(() => {
      const event = RunCollection.findOne({ event: "run mocha" });
      const reporter =
        event && event.data.reporter && reporters[event.data.reporter];
      const runOrder = event && event.data.runOrder;

      if (reporter) {
        this.setReporter(reporter);
      }

      if (event && event.data.runOrder === "serial") {
        return new ClientServerReporter(null, {
          runOrder: "serial"
        });
      } else if (runOrder === "parallel") {
        mocha.reporter(ClientServerReporter);
        return mocha.run(function() {});
      }
    });
  }

  onServerRunSubscriptionError(meteorError) {
    try {
      log.enter("onServerRunSubscriptionError");
      return log.error(meteorError);
    } finally {
      log.return();
    }
  }
}

const instance = new MochaRunner();

if (Meteor.isServer) {
  Meteor.methods({
    "mocha/runServerTests"(...args) {
      instance.runServerTests(...args);
    }
  });

  Meteor.publish("mochaServerRunEvents", function(runId) {
    check(runId, String);

    if (instance.publishers[runId] == null) {
      instance.publishers[runId] = this;
    }

    this.ready();

    // You can't return any other value but a Cursor, otherwise it will throw an exception
    return undefined;
  });
}

export default instance;
