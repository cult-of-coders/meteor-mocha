/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {_}            = require("underscore");
const BaseReporter   = require("./BaseReporter").default;
const {ObjectLogger} = require("meteor/practicalmeteor:loglevel");

const log = new ObjectLogger('MeteorPublishReporter', 'info');

class MeteorPublishReporter extends BaseReporter {
  static initClass() {
  
    this.publisher = null; 
  }

  constructor(runner, options){
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.slice(thisFn.indexOf('return') + 6 + 1, thisFn.indexOf(';')).trim();
      eval(`${thisName} = this;`);
    }
    this.added = this.added.bind(this);
    this.errorJSON = this.errorJSON.bind(this);
    try {
      log.enter('constructor', arguments);
      expect(options.reporterOptions, 'options.reporterOptions').to.be.an('object');

      // Update runner tests
      runner.grep(options.reporterOptions.grep);

      super(runner, options);

//      @publisher = practical.mocha.MeteorPublishReporter.publisher
      this.publisher = options.reporterOptions.publisher;
      expect(this.publisher, '@publisher').to.be.an('object');
      expect(this.publisher.ready, '@publisher.ready').to.be.a('function');
      expect(this.publisher.added, '@publisher.added').to.be.a('function');
      expect(this.publisher.onStop, '@publisher.onStop').to.be.a('function');


      this.publisher.onStop(() => {
        return this.stopped = true;
      });
      this.stopped = false;
      this.sequence = 0;

      // Make sure we always run within a Fiber
      this.added = Meteor.bindEnvironment(this.added, null, this);

      const {REPORTERS, HTML_REPORTER} = require("./index");
      let mochaReporter = process.env.MOCHA_REPORTER || HTML_REPORTER;
      if (mochaReporter && !_.contains(REPORTERS, mochaReporter)) {
        log.info(`Can't find '${mochaReporter}' reporter. Using '${HTML_REPORTER}' instead.`);
        mochaReporter = HTML_REPORTER;
      }
// 
//      # Specify how to run tests 'serial' or 'parallel'
//      # Running in 'serial' will start server tests first and then client tests
      this.added('run mocha', { reporter: mochaReporter,   runOrder: process.env.MOCHA_RUN_ORDER || 'parallel' });

      this.runner.on('start', function() {
        try {
          log.enter('onStart', arguments);
//          @added 'start', {total: @stats.total}
          return this.added('start', this.stats);
        } finally {
          log.return();
        }
      }.bind(this));

      this.runner.on('suite', function(suite){
        try {
          log.enter('onSuite', arguments);
//          log.info "suite:", suite.title
//          @added 'suite', {title: suite.title, _fullTitle: suite.fullTitle(), root: suite.root}

          return this.added('suite', this.cleanSuite(suite));
        } finally {
          log.return();
        }
      }.bind(this));

      this.runner.on('suite end', function(suite){
        try {
          log.enter('onSuiteEnd', arguments);
          return this.added('suite end', this.cleanSuite(suite));
        } finally {
          log.return();
        }
      }.bind(this));

      this.runner.on('test end', function(test){
        try {
          log.enter('onTestEnd', arguments);
          return this.added('test end', this.cleanTest(test));
        } finally {
          log.return();
        }
      }.bind(this));

      this.runner.on('pass', function(test){
        try {
          log.enter('onPass', arguments);
          return this.added('pass', this.cleanTest(test));
        } finally {
          log.return();
        }
      }.bind(this));

      this.runner.on('fail', function(test, error){
        try {
          log.enter('onFail', arguments);
          return this.added('fail', this.cleanTest(test));
        } finally {
          log.return();
        }
      }.bind(this));

      this.runner.on('end', function() {
        try {
          log.enter('onEnd', arguments);
          return this.added('end', this.stats);
        } finally {
          log.return();
        }
      }.bind(this));

      this.runner.on('pending', function(test){
        try {
          log.enter('onPending', arguments);
          log.debug("test", test);
          return this.added('pending', this.cleanTest(test));
        } finally {
          log.return();
        }
      }.bind(this));
    } finally {
      log.return();
    }
  }


  added(event, data){
    let doc;
    try {
      log.enter('added', arguments);
//      log.info event, data
      if (this.stopped === true) { return; }
      this.sequence++;
      doc = {
        _id: `${this.sequence}`,
        event,
        data
      };
      return this.publisher.added('mochaServerRunEvents', doc._id, doc);
    } catch (ex) {
      log.error("Can't send report data to client.");
      log.error("Error:", (ex.stack || ex.message));
      return log.error("Document:", doc);
    }
    finally {
      log.return();
    }
  }


  /**
   * Return a plain-object representation of `test`
   * free of cyclic properties etc.
   *
   * @param {Object} test
   * @return {Object}
   * @api private
   */
  cleanTest(test){
    try {
      log.enter("cleanTest", arguments);

      const properties = ["title", "type", "state","speed", "pending",
        "duration", "async", "sync", "_timeout", "_slow", "body"];
      return  _.extend(_.pick(test, properties),{
        _fullTitle: test.fullTitle(),
        parent: this.cleanSuite(test.parent),
        // So we can show the server side test code in the reporter. This property is null ff the test or suite is pending
        fn: (test.fn != null ? test.fn.toString() : undefined),
        err: this.errorJSON(test.err),
        isServer: true
      });
    } catch (ex) {
      return log.error(ex);
    }

    finally {
      log.return();
    }
  }


  cleanSuite(suite){
    try {
      log.enter("cleanSuite", arguments);
      return _.extend(_.pick(suite, ["title", "root", "pending"]),{
        _fullTitle: suite.fullTitle(),
        isServer: true
      });
    } catch (ex) {
      return log.error(ex);
    }
    finally {
      log.return();
    }
  }

  /**
   * Transform `error` into a JSON object.
   * @param {Error} err
   * @return {Object}
   */

  errorJSON(err) {
    if (!err) { return; }
    /*
      Only picking the defaults properties define by ECMAScript to avoid problems
      with custom error that may have properties that can't be stringify such as functions.
      See https://goo.gl/bsZh3B and https://goo.gl/AFp6KB
    */
    return _.pick(err, ["name", "message", "stack"]);
  }
}
MeteorPublishReporter.initClass();



module.exports = MeteorPublishReporter;
