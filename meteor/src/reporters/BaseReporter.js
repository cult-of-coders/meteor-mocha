/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
///**
// * Initialize a new `Base` reporter.
// *
// * All other reporters generally
// * inherit from this reporter, providing
// * stats such as test duration, number
// * of tests passed / failed etc.
//*
//* @param {Runner} runner
//* @api public
//*/

class BaseReporter {

  constructor(runner, options){
    this.runner = runner;
    this.options = options;
    expect(this.runner).to.be.an('object');
    expect(this.options).to.be.an('object');
    this.stats = { total: this.runner.total, suites: 0, tests: 0, passes: 0, pending: 0, failures: 0 };
    this.failures = [];

    this.runner.stats = this.stats;

    this.runner.on('start', () => {
      return this.stats.start = new Date;
    });

    this.runner.on('suite', suite=> {
      if (!suite.root) { return this.stats.suites++; }
    });

    this.runner.on('test end', test=> {
      return this.stats.tests++;
    });

    this.runner.on('pass', test=> {
      const medium = test.slow() / 2;
      if (test.duration > test.slow()) {
        test.speed = 'slow';
      } else if (test.duration > medium) {
        test.speed = 'medium';
      } else {
        test.speed = 'fast';
      }
      return this.stats.passes++;
    });

    this.runner.on('fail', (test, err)=> {
      this.stats.failures++;
      test.err = err;
      return this.failures.push(test);
    });

    this.runner.on('end', () => {
      this.stats.end = new Date;
      return this.stats.duration = this.stats.end - this.stats.start;
    });

    this.runner.on('pending', () => {
      return this.stats.pending++;
    });
  }
}


module.exports = BaseReporter;
