/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const MochaRunner = require("../lib/MochaRunner").default;

///**
// * All other reporters generally
// * inherit from this reporter, providing
// * stats such as test duration, number
// * of tests passed / failed etc.
//*
//* @param {Runner} clientRunner
//* @param {Runner} serverRunner
//* @api public
//*/

class ClientServerBaseReporter {


  constructor(clientRunner, serverRunner, options){
    this.clientRunner = clientRunner;
    this.serverRunner = serverRunner;
    this.options = options;
    expect(this.clientRunner).to.be.an('object');
    expect(this.serverRunner).to.be.an('object');
    expect(this.options).to.be.an('object');

    this.clientStats = {total: this.clientRunner.total, suites: 0, tests: 0, passes: 0, pending: 0, failures: 0};
    this.serverStats = {total: this.serverRunner.total, suites: 0, tests: 0, passes: 0, pending: 0, failures: 0};
    this.stats = {total: this.serverRunner.total + this.clientRunner.total, suites: 0, tests: 0, passes: 0, pending: 0, failures: 0};
    this.failures = [];

    this.clientRunner.stats = this.clientStats;
    this.serverRunner.stats = this.serverStats;

    this.registerRunnerEvents("server");
    this.registerRunnerEvents("client");

    // Exposes global variables to indicate when tests are done. For example spacejam use this global vars
    MochaRunner.on("end all", () => {
      window.TEST_STATUS = {FAILURES: this.stats.failures, DONE: true};
      window.DONE = true;
      return window.FAILURES = this.stats.failures;
    });
  }

  registerRunnerEvents(where){

    this[`${where}Runner`].on('start', () => {
      const start = new Date();
      this[where+"Stats"].start = start;
      // The start time will be the first of the runners that started running
      if (this.stats.start == null) { this.stats.start = start; }
      /*
        The total and other stats of the server runner are sent with the 'start' event,
        so we need to update the total of the stats.
        Also when running in 'serial' mode (server test first and then client tests),
        clientRunner.total is undefined because client starts running after server tests end.
      */
      this.clientStats.total = this.clientRunner.total;
      this.serverStats.total = this.serverRunner.total;
      return this.stats.total = this.clientStats.total + this.serverStats.total;
    });


    this[`${where}Runner`].on('suite', suite=> {
      if (!suite.root) {
        this.stats.suites++;
        return this[where+"Stats"].suites++;
      }
    });

    this[`${where}Runner`].on('test end', test=> {
      return this.stats.tests++;
    });

    this[`${where}Runner`].on('pass', test=> {
      const medium = test.slow() / 2;

      if (test.duration > test.slow()) {
        test.speed = 'slow';
      } else if (test.duration > medium) {
        test.speed = 'medium';
      } else {
        test.speed = 'fast';
      }

      this[where+"Stats"].passes++;
      return this.stats.passes++;
    });

    this[`${where}Runner`].on('fail', (test, err)=> {
      if (test.err == null) { test.err = err; }
      this.failures.push(test);

      this.stats.failures++;
      return this[where+"Stats"].failures++;
    });


    this[`${where}Runner`].on('end', () => {
      const end = new Date();

      this.stats.end = end;
      this[where+"Stats"].end = end;

      this.stats.duration = this.stats.end - this.stats.start;
      return this[where+"Stats"].duration = this[where+"Stats"].end - this[where+"Stats"].start;
    });

    return this[`${where}Runner`].on('pending', () => {
      this.stats.pending++;
      return this[where+"Stats"].pending++;
    });
  }
}


module.exports = ClientServerBaseReporter;
