import "./setup";
import MochaRunner from "./lib/MochaRunner";
import BaseReporter from "./reporters/BaseReporter";
import ClientServerBaseReporter from "./reporters/ClientServerBaseReporter";
import HtmlReporter from "./reporters/HtmlReporter";
import ConsoleReporter from "./reporters/ConsoleReporter";
import { hideOtherCSS, hideApp } from "meteor/tmeasday:test-reporter-helpers";

export const runTests = () => {
  hideApp(".mocha-wrapper");
  hideOtherCSS();
  MochaRunner.runEverywhere();
};

let {
  before,
  after,
  beforeEach,
  afterEach,
  describe,
  xdescribe,
  it,
  xit,
  specify,
  xspecify,
  xcontext,
  context
} = global;

export { MochaRunner };
export {
  BaseReporter,
  ClientServerBaseReporter,
  HtmlReporter,
  ConsoleReporter
};
export {
  before,
  after,
  beforeEach,
  afterEach,
  describe,
  xdescribe,
  it,
  xit,
  specify,
  xspecify,
  xcontext,
  context
};
