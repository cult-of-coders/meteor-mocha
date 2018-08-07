// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import BaseReporter from "./BaseReporter";

class JsonStreamReporter extends BaseReporter {

  constructor(runner, options){
    super(runner, options);

    this.runner.on('start', total=> {
      return console.log(JSON.stringify(['start', { total: this.stats.total }]));
    });

    this.runner.on('pass', test=> {
      return console.log(JSON.stringify(['pass', this.clean(test)]));
    });

    this.runner.on('fail', (test, err)=> {
      test = this.clean(test);
      test.err = err.message;
      return console.log(JSON.stringify(['fail', test]));
    });

    this.runner.on('end', () => {
      return console.log(JSON.stringify(['end', this.stats]));
    });
  }

  ///**
  // * Return a plain-object representation of `test`
  // * free of cyclic properties etc.
  // *
  // * @param {Object} test
  // * @return {Object}
  // * @api private
  // */

  clean(test){
    return {
      title: test.title,
      fullTitle: test.fullTitle(),
      duration: test.duration
    };
  }
}

export default JsonStreamReporter;
