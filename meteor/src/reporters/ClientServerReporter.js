// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {_}             = require("underscore");
const MochaRunner     = require("./../lib/MochaRunner").default;
const MirrorReporter  = require('./MirrorReporter').default;
const {ObjectLogger}  = require("meteor/practicalmeteor:loglevel");
const {EventEmitter}  = require("events");

const log = new ObjectLogger('ClientServerReporter', 'info');

class ClientServerReporter {


  constructor(clientRunner, options){
    this.runTestsSerially = this.runTestsSerially.bind(this);
    this.clientRunner = clientRunner;
    if (options == null) { options = {}; }
    this.options = options;
    try {
      log.enter('constructor');
      this.serverRunnerProxy = new EventEmitter();

      if (this.options.runOrder === "serial") {
        this.clientRunner = new EventEmitter();
        this.runTestsSerially(this.clientRunner, this.serverRunnerProxy);
      }

      if (!MochaRunner.reporter) {
        log.info("Missing reporter to run tests. Use MochaRunner.setReporter(reporter) to set one.");
        return;
      }

      this.reporter = new MochaRunner.reporter(this.clientRunner, this.serverRunnerProxy, this.options);

      // Exposes global states of tests
      this.clientRunner.on("start", () => window.mochaIsRunning = true);

      this.clientRunner.on("end", () => {
        window.mochaIsRunning = false;
        window.mochaIsDone = true;

        MochaRunner.emit("end client");
        this.clientTestsEnded = true;
        if (this.serverTestsEnded) {
          return MochaRunner.emit("end all");
        }
      });

      this.serverRunnerProxy.on('end', () => {
        this.serverTestsEnded = true;
        MochaRunner.emit("end server");
        if (this.clientTestsEnded) {
          return MochaRunner.emit("end all");
        }
      });

      MochaRunner.serverRunEvents.find().observe({
        added: _.bind(this.onServerRunnerEvent, this)
      });

    } finally {
      log.return();
    }
  }


  runTestsSerially(clientRunner, serverRunnerProxy){
    try {
      log.enter("runTestsSerially");
      return serverRunnerProxy.on("end", () => {
        mocha.reporter(MirrorReporter, {
          clientRunner
        });
        return mocha.run(function() {});
      });

    } finally {
      log.return();
    }
  }


  onServerRunnerEvent(doc){
    try {
      log.enter('onServerRunnerEvent');
      expect(doc).to.be.an('object');
      expect(doc.event).to.be.a('string');
      if (doc.event === "run mocha") {
        return;
      }
      expect(doc.data).to.be.an('object');

      // Required by the standard mocha reporters
      doc.data.fullTitle = () => doc.data._fullTitle;
      doc.data.slow = () => doc.data._slow;
      if (doc.data.err != null) {
        doc.data.err.toString = function() { return `Error: ${this.message}`; };
      }

      if (doc.data.parent) {
        doc.data.parent.fullTitle = () => doc.data.parent._fullTitle;
        doc.data.parent.slow = () => doc.data.parent._slow;
      }


      if (doc.event === 'start') {
        this.serverRunnerProxy.stats = doc.data;
        this.serverRunnerProxy.total = doc.data.total;
      }

      return this.serverRunnerProxy.emit(doc.event, doc.data, doc.data.err);

    } catch (ex) {
      return log.error(ex);
    }
    finally {
      log.return();
    }
  }
}


module.exports = ClientServerReporter;
