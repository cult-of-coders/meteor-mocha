// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import MochaRunner               from "../lib/MochaRunner";
import { ObjectLogger }          from "../lib/ObjectLogger";
import ClientServerBaseReporter  from "./ClientServerBaseReporter";

const log = new ObjectLogger('ConsoleReporter', 'info');


class ConsoleReporter extends  ClientServerBaseReporter {


  constructor(clientRunner, serverRunner, options){
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.slice(thisFn.indexOf('return') + 6 + 1, thisFn.indexOf(';')).trim();
      eval(`${thisName} = this;`);
    }
    this.printReporterHeader = this.printReporterHeader.bind(this);
    this.finishAndPrintTestsSummary = this.finishAndPrintTestsSummary.bind(this);
    this.clientRunner = clientRunner;
    this.serverRunner = serverRunner;
    this.options = options;
    try {
      log.enter('constructor');
      super(this.clientRunner, this.serverRunner, this.options);
      MochaRunner.on("end all", () => this.finishAndPrintTestsSummary());

    } finally {
      log.return();
    }
  }

  /*
    Overwriting from ClientServerBaseReporter
  */
  registerRunnerEvents(where){
    try {
      log.enter("registerRunnerEvents");
      // Call super.registerRunnerEvents to register events from ClientServerBaseReporter first
      super.registerRunnerEvents(where);

      this[`${where}Runner`].on("start", () => this.printReporterHeader(where));
      this[`${where}Runner`].on('test end', test=> this.printTest(test, where));

      // Log for errors with hooks
      return this[`${where}Runner`].on("fail", hook=> { if (hook.type === 'hook') { return this.printTest(hook, where); } });

    } finally {
      log.return();
    }
  }


  printReporterHeader(where){
    try {
      log.enter("printReporterHeader", where);
      if (this.options.runOrder !== 'serial') { return; }
      // i.e client = Client
      where = where[0].toUpperCase() + where.substr(1);
      console.log("\n--------------------------------------------------");
      console.log(`------------------ ${where} tests ------------------`);
      return console.log("--------------------------------------------------\n");
    } finally {
      log.return();
    }
  }


  printTest(test, where){
    try {
      log.enter("prinTest", test);
      const state = test.state || (test.pending ? "pending" : undefined);

      // Since the test are running in parallel we don't need
      // to specify where they are client or   server tests.
      if (this.options.runOrder === 'serial') {
        where = "";
      } else {
        // Get first chart 's' or 'c' for client/server
        where = where[0].toUpperCase() + ": ";
      }

      console.log(`${where}${test.fullTitle()} : ${state}`);

      if (test.state === "failed") {
        console.log(`  ${test.err.stack || test.err}`);
      }

      return console.log("");
    } finally {
      log.return();
    }
  }


  finishAndPrintTestsSummary(){
    try {
      log.enter("finishAndPrintTestsSummary");
      if (((this.clientStats != null ? this.clientStats.total : undefined) == null) || ((this.serverStats != null ? this.serverStats.total : undefined) == null)) { return; }

      console.log("\n--------------------------------------------------");
      console.log("---------------------RESULTS----------------------");
      console.log("PASSED:", this.stats.passes);
      console.log("FAILED:", this.stats.failures);
      console.log("SKIPPED:", this.stats.pending);
      console.log("TOTAL:", this.stats.total);
      console.log("--------------------------------------------------");
      return console.log("--------------------------------------------------\n");
    } finally {
      log.return();
    }
  }
}


export default ConsoleReporter;

