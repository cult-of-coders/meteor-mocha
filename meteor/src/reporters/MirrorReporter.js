// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {ObjectLogger}  = require("meteor/practicalmeteor:loglevel");
const log = new ObjectLogger('MirrorReporter', 'info');

class MirrorReporter {

  constructor(mochaReporter, options){

    this.mochaReporter = mochaReporter;
    const clientRunner = options.reporterOptions != null ? options.reporterOptions.clientRunner : undefined;
    expect(clientRunner, "clientRunner").to.be.ok;

    // The in order to calculate the progress
    clientRunner.total = this.mochaReporter.total;

    this.mochaReporter.on('start', function() {
      try {
        log.enter('onStart', arguments);
        return clientRunner.emit.call(clientRunner, 'start');
      } finally {
        log.return();
      }
    }.bind(this));

    this.mochaReporter.on('suite', function(suite){
      try {
        log.enter('onSuite', arguments);
        return clientRunner.emit.call(clientRunner, 'suite',suite);
      } finally {
        log.return();
      }
    }.bind(this));

    this.mochaReporter.on('suite end', function(suite){
      try {
        log.enter('onSuiteEnd', arguments);
        return clientRunner.emit.call(clientRunner, 'suite end',suite);
      } finally {
        log.return();
      }
    }.bind(this));

    this.mochaReporter.on('test end', function(test){
      try {
        log.enter('onTestEnd', arguments);
        return clientRunner.emit.call(clientRunner, 'test end', test);
      } finally {
        log.return();
      }
    }.bind(this));

    this.mochaReporter.on('pass', function(test){
      try {
        log.enter('onPass', arguments);
        return clientRunner.emit.call(clientRunner, 'pass', test);
      } finally {
        log.return();
      }
    }.bind(this));

    this.mochaReporter.on('fail', function(test, error){
      try {
        log.enter('onFail', arguments);
        return clientRunner.emit.call(clientRunner, 'fail', test, error);
      } finally {
        log.return();
      }
    }.bind(this));

    this.mochaReporter.on('end', function() {
      try {
        log.enter('onEnd', arguments);
        return clientRunner.emit.call(clientRunner, 'end');
      } finally {
        log.return();
      }
    }.bind(this));

    this.mochaReporter.on('pending', function(test){
      try {
        log.enter('onPending', arguments);
        return clientRunner.emit.call(clientRunner, 'pending', test);

      } finally {
        log.return();
      }
    }.bind(this));
  }
}


module.exports = MirrorReporter;
