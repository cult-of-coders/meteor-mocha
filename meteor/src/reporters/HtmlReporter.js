// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import ObjectLogger from "../lib/ObjectLogger";
import MochaHtmlReporter from "./html";
import ClientServerBaseReporter from "./ClientServerBaseReporter";
import MochaRunner from "../lib/MochaRunner";

const log = new ObjectLogger("HtmlReporter", "info");

class HtmlReporter extends ClientServerBaseReporter {
  constructor(clientRunner, serverRunner, options) {
    super(clientRunner, serverRunner, options);

    this.addReporterHtml = this.addReporterHtml.bind(this);
    this.clientRunner = clientRunner;
    this.serverRunner = serverRunner;

    if (options == null) {
      options = {};
    }

    this.options = options;

    try {
      log.enter("constructor");
      this.addReporterHtml();

      this.reporter = new MochaHtmlReporter(this.clientRunner);
      this.serverReporter = new MochaHtmlReporter(this.serverRunner, {
        elementIdPrefix: "server-"
      });
    } finally {
      log.return();
    }
  }

  /*
    Adds the html required by the mocha HTML reporter to the body of the html
    document. We modified the mocha HTML reporter to be able to display 2 reporters
    at the same time, one for client tests and one for server tests.
    TODO: Create a single meteor reactive reporter.
  */
  addReporterHtml() {
    try {
      log.enter("addReporterHtml");
      const div = document.createElement("div");
      div.className = "mocha-wrapper";

      div.innerHTML = `<div class="content"> \
<div class="test-wrapper"> \
<h1 class="title">Client tests</h1> \
\
<div id="mocha" class="mocha"></div> \
</div> \
\
<div class="divider"></div> \
\
<div class="test-wrapper"> \
<h1 class="title">Server tests</h1> \
\
<div id="server-mocha" class="mocha"></div> \
</div> \
</div>`;

      return document.body.appendChild(div);
    } finally {
      log.return();
    }
  }
}

export default HtmlReporter;
