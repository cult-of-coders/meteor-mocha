/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {_}                   = require("underscore");
const Test                  = require("mocha/lib/test");
const Suite                 = require("mocha/lib/suite");
const utils                 = require("mocha/lib/utils");
const {Mongo}               = require("meteor/mongo");
const {Mocha}               = require("meteor/practicalmeteor:mocha-core");
const {EventEmitter}        = require("events");
const {ObjectLogger}        = require("meteor/practicalmeteor:loglevel");
const MeteorPublishReporter = require("./../reporters/MeteorPublishReporter").default;
const log = new ObjectLogger('MochaRunner', 'info');

class MochaRunner extends EventEmitter {
  static initClass() {
  
    this.instance = null;
  
    this.prototype.VERSION = "2.4.5_6";
    this.prototype.serverRunEvents = null;
    this.prototype.publishers = {};
  }

  static get() {
    return MochaRunner.instance != null ? MochaRunner.instance : (MochaRunner.instance = new MochaRunner());
  }


  constructor() {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.slice(thisFn.indexOf('return') + 6 + 1, thisFn.indexOf(';')).trim();
      eval(`${thisName} = this;`);
    }
    this.runServerTests = this.runServerTests.bind(this);
    this.onServerRunSubscriptionReady = this.onServerRunSubscriptionReady.bind(this);
    try {
      log.enter('constructor');
      this.utils = utils;
      this.serverRunEvents = new Mongo.Collection('mochaServerRunEvents');
      if (Meteor.isServer) {
        Meteor.methods({
          "mocha/runServerTests": this.runServerTests.bind(this)
        });
        this.publish();
      }

    } finally {
      log.return();
    }
  }


  publish() {
    try {
      log.enter("publish");
      const self = this;
      return Meteor.publish('mochaServerRunEvents', function(runId){
        try {
          log.enter('publish.mochaServerRunEvents');
          check(runId, String);
          expect(this.ready).to.be.a('function');
          if (self.publishers[runId] == null) { self.publishers[runId] = this; }
          this.ready();
          // You can't return any other value but a Cursor, otherwise it will throw an exception
          return undefined;
        } catch (ex) {
          if (ex.stack != null) { log.error(ex.stack); }
          throw new Meteor.Error('unknown-error', ((ex.message != null) ? ex.message : undefined), ((ex.stack != null) ? ex.stack : undefined));
        }
        finally {
          log.return();
        }
      });
    } finally {
      log.return();
    }
  }


  runServerTests(runId, grep){
    try {
      log.enter("runServerTests", runId);
      check(runId, String);
      check(grep, Match.Optional(Match.OneOf(null, String)));
      expect(runId).to.be.a("string");
      expect(this.publishers[runId], "publisher").to.be.an("object");
      expect(Meteor.isServer).to.be.true;
      const mochaRunner = new Mocha();
      this._addTestsToMochaRunner(mocha.suite, mochaRunner.suite);

      mochaRunner.reporter(MeteorPublishReporter, {
        grep: this.escapeGrep(grep),
        publisher: this.publishers[runId]
      });

      log.info(`Starting server side tests with run id ${runId}`);
      return mochaRunner.run(failures=> log.warn('failures:', failures));

    } finally {
      log.return();
    }
  }


  // Recursive function that starts with global suites and adds all sub suites within each global suite
  _addTestsToMochaRunner(fromSuite, toSuite){
    try {
      log.enter("_addTestToMochaRunner");

      const addHooks = function(hookName){
        for (let hook of Array.from(fromSuite[`_${hookName}`])) {
          toSuite[hookName](hook.title, hook.fn);
        }
        return log.debug(`Hook ${hookName} for '${fromSuite.fullTitle()}' added.`);
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

      return (() => {
        const result = [];
        for (let suite of Array.from(fromSuite.suites)) {
          const newSuite = Suite.create(toSuite, suite.title);
          newSuite.timeout(suite.timeout());
          log.debug(`Suite ${newSuite.fullTitle()}  added to '${fromSuite.fullTitle()}'.`);
          result.push(this._addTestsToMochaRunner(suite, newSuite));
        }
        return result;
      })();

    } finally {
      log.return();
    }
  }


  runEverywhere() {
    try {
      log.enter('runEverywhere');
      expect(Meteor.isClient).to.be.true;

      this.runId = Random.id();
      return this.serverRunSubscriptionHandle = Meteor.subscribe('mochaServerRunEvents', this.runId, {
        onReady: _.bind(this.onServerRunSubscriptionReady, this),
        onError: _.bind(this.onServerRunSubscriptionError, this)
      });

    } finally {
      log.return();
    }
  }


  setReporter(reporter){
    this.reporter = reporter;
  }

  escapeGrep(grep){
    if (grep == null) { grep = ''; }
    try {
      log.enter("escapeGrep", grep);
      const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
      grep.replace(matchOperatorsRe,  '\\$&');
      return new RegExp(grep);
    } finally {
      log.return();
    }
  }


  onServerRunSubscriptionReady() {
    try {
      log.enter('onServerRunSubscriptionReady');
      const ClientServerReporter = require("./../reporters/ClientServerReporter").default;
      const { REPORTERS, reporters} = require("../reporters");
      const query = utils.parseQuery(location.search || '');

      Meteor.call("mocha/runServerTests", this.runId,  query.grep, function(err){
        log.debug("tests started");
        if (err) { return log.error(err); }
      });

      return Tracker.autorun(() => {
        let reporter;
        const event = this.serverRunEvents.findOne({event: "run mocha"});
        if (((event != null ? event.data.reporter : undefined) != null) && _.contains(REPORTERS, event.data.reporter)) {
          reporter = reporters[event.data.reporter];
          this.setReporter(reporter);
        }

        if ((event != null ? event.data.runOrder : undefined) === "serial") {
          return reporter = new ClientServerReporter(null, {runOrder: "serial"});
        } else if ((event != null ? event.data.runOrder : undefined) === "parallel") {
          mocha.reporter(ClientServerReporter);
          return mocha.run(function() {});
        }
      });



    } finally {
      log.return();
    }
  }


  onServerRunSubscriptionError(meteorError){
    try {
      log.enter('onServerRunSubscriptionError');
      return log.error(meteorError);
    } finally {
      log.return();
    }
  }
}
MochaRunner.initClass();


module.exports = MochaRunner.get();
