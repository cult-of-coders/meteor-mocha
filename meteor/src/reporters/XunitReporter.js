// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import MochaRunner from "../lib/MochaRunner";
import ConsoleReporter from "./ConsoleReporter";

class XUnitReporter extends ConsoleReporter {
  static initClass() {
    this.VERSION = "0.1.0";
    this.prototype.xUnitPrefix = "##_meteor_magic##xunit: ";
  }

  constructor(clientRunner, serverRunner, options) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) {
        super();
      }
      let thisFn = (() => {
        return this;
      }).toString();
      let thisName = thisFn
        .slice(thisFn.indexOf("return") + 6 + 1, thisFn.indexOf(";"))
        .trim();
      eval(`${thisName} = this;`);
    }
    this.clientRunner = clientRunner;
    this.serverRunner = serverRunner;
    this.options = options;
    this.clientTests = [];
    this.serverTests = [];

    // ConsoleReporter exposes global variables that indicates when the tests has finished,
    // so we register the event to print the test suite before ConsoleReporter register its event
    MochaRunner.on("end all", () => this.printTestSuite());

    super(this.clientRunner, this.serverRunner, this.options);
  }

  /*
    Overwrite from ConsoleReporter
  */
  registerRunnerEvents(where) {
    super.registerRunnerEvents(where);

    this[where + "Runner"].on("pending", test => {
      return this[where + "Tests"].push(test);
    });

    this[where + "Runner"].on("pass", test => {
      return this[where + "Tests"].push(test);
    });

    return this[where + "Runner"].on("fail", test => {
      return this[where + "Tests"].push(test);
    });
  }

  printTestSuite() {
    const testSuite = {
      name: "Mocha Tests",
      tests: this.stats.total,
      failures: this.stats.failures,
      errors: this.stats.failures,
      timestamp: new Date().toUTCString(),
      time: this.stats.duration / 1000 || 0,
      skipped: this.stats.pending
    };

    this.write(this.createTag("testsuite", testSuite, false));

    this.clientTests.forEach(test => {
      return this.printTestCase(test, "Client");
    });

    this.serverTests.forEach(test => {
      return this.printTestCase(test, "Server");
    });

    return this.write("</testsuite>");
  }

  /**
   * HTML tag helper.
   *
   * @param name
   * @param attrs
   * @param close
   * @param content
   * @return {string}
   */
  createTag(name, attrs, close, content) {
    if (attrs == null) {
      attrs = {};
    }
    const end = close ? "/>" : ">";
    const pairs = [];
    let tag = undefined;

    for (let key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) {
        pairs.push(key + '="' + this.escape(attrs[key]) + '"');
      }
    }

    tag = `<${name}${pairs.length ? ` ${pairs.join(" ")}` : ""}${end}`;

    if (content) {
      tag += content + "</" + name + end;
    }

    return tag;
  }

  /**
   * Return cdata escaped CDATA `str`.
   */

  cdata(str) {
    return `<![CDATA[${this.escape(str)}]]>`;
  }

  /**
   * Override done to close the stream (if it's a file).
   *
   * @param failures
   * @param {Function} fn
   */

  done(failures, fn) {
    return fn(failures);
  }

  /**
   * Write out the given line.
   *
   * @param {string} line
   */

  write(line) {
    return console.log(this.xUnitPrefix + line);
  }

  /**
   * Output tag for the given `test.`
   *
   * @param {Test} test
   */

  printTestCase(test, where) {
    const attrs = {
      classname: `${where} ${test.parent.fullTitle()}`,
      name: test.title,
      time: test.duration / 1000 || 0
    };

    if (test.state === "failed") {
      const { err } = test;
      const stack = this.escapeStack(err.stack);
      this.write(
        this.createTag(
          "testcase",
          attrs,
          false,
          this.createTag(
            "failure",
            {},
            false,
            this.cdata(this.escape(err.message) + "\n" + stack)
          )
        )
      );
    } else if (test.pending) {
      this.write(
        this.createTag(
          "testcase",
          attrs,
          false,
          this.createTag("skipped", {}, true)
        )
      );
    } else {
      this.write(this.createTag("testcase", attrs, true));
    }
  }

  /**
   * Escape special characters in the given string of html.
   *
   * @api private
   * @param  {string} html
   * @return {string}
   */

  escape(html) {
    return String(html)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /**
   * For each line add the @xUnitPrefix and escape special characters in the given string of html.
   *
   * @api private
   * @param  {string} stack
   * @return {string}
   */
  escapeStack(stack) {
    if (stack == null) {
      stack = "";
    }
    return stack
      .split("\n")
      .map(s => this.xUnitPrefix + this.escape(s))
      .join("\n");
  }
}
XUnitReporter.initClass();

export default XUnitReporter;
