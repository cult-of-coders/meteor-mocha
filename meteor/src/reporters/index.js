import ConsoleReporter from "./ConsoleReporter";
import XunitReporter from "./XunitReporter";
import HtmlReporter from "./HtmlReporter";

export const HTML_REPORTER = "html";
export const CONSOLE_REPORTER = "console";
export const XUNIT_REPORTER = "xunit";
export const REPORTERS = [HTML_REPORTER, CONSOLE_REPORTER, XUNIT_REPORTER];
let reporters = {};
reporters[HTML_REPORTER] = HtmlReporter;
reporters[CONSOLE_REPORTER] = ConsoleReporter;
reporters[XUNIT_REPORTER] = XunitReporter;
export { reporters };
