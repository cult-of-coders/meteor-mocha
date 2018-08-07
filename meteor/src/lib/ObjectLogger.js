/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import loglevel from "./LogFactory";

export class ObjectLogger {

  constructor(className, defaultLevel){
    this.className = className;

    if (defaultLevel == null) { defaultLevel = 'info'; }

    this.defaultLevel = defaultLevel;
    this.log = loglevel.createLogger(this.className, this.defaultLevel);

    this.callStack = [];

    this.log.enter = this.bindMethod(this.enter, 'debug');
    this.log.fineEnter = this.bindMethod(this.enter, 'fine');
    this.log.return = this.bindMethod(this.return, 'debug');
    this.log.fineReturn = this.bindMethod(this.return, 'fine');

    return this.log;
  }

  enter(level, ...args){
    if (args.length === 0) { throw new Error(('ObjectLogger: No method name provided to enter')); }
    const methodName = args.shift();
    this.callStack.unshift(methodName);
    this.log.setPrefix(`${this.className}.${methodName}:`);
    args.unshift('ENTER');
    return this.log[level].apply(this.log, args);
  }

  return(level){
    this.log[level].call(this.log, 'RETURN');
    this.callStack.shift();
    if (this.callStack.length > 0) {
      const methodName = this.callStack[0];
      return this.log.setPrefix(`${this.className}.${methodName}:`);
    }
  }


  bindMethod(method, level) {
    if (typeof method.bind === 'function') {
      return method.bind(this, level);
    } else {
      try {
        return Function.prototype.bind.call(method, this, level);
      } catch (e) {
      // Missing bind shim or IE8 + Modernizr, fallback to wrapping
        return (...args)=> {
          args.unshift(level);
          return Function.prototype.apply.apply(method, [
            this,
            args
          ]);
        };
      }
    }
  }
}

export default ObjectLogger;
