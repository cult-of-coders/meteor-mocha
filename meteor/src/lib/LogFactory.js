import Loglevel from "./loglevel";

if (this.practical == null) {
  this.practical = {};
}

(function() {
  let instance = undefined;
  const Cls = (practical.LoggerFactory = class LoggerFactory {
    static initClass() {
      instance = null;
    }

    static get() {
      return instance != null
        ? instance
        : (instance = new practical.LoggerFactory());
    }

    // The 'global' namespace is checked first, in order to allow people to enforce
    // a loglevel across the board.
    _getSettingsLoglevel(namespace, defaultLevel) {
      let level;
      if (namespace == null) {
        namespace = "";
      }
      if (defaultLevel == null) {
        defaultLevel = "info";
      }
      const globalLevel = this._getNamespaceLoglevel("global");
      if (globalLevel != null) {
        return globalLevel;
      }
      if (namespace.length > 0) {
        level = this._getNamespaceLoglevel(namespace);
      }
      if (level == null) {
        level = this._getNamespaceLoglevel("default");
      }
      return level != null ? level : (level = defaultLevel);
    }

    // @returns Meteor.settings.loglevel.namespace server side
    // or if called client side or it doesn't exist server side,
    // Meteor.settings.public.loglevel.namespace.
    // This allows to set only public loglevel for both client and server side.
    _getNamespaceLoglevel(namespace) {
      let level = __guard__(
        __guard__(
          Meteor.settings != null ? Meteor.settings.public : undefined,
          x1 => x1.loglevel
        ),
        x => x[namespace]
      );
      if (Meteor.isServer) {
        const serverLevel = __guard__(
          Meteor.settings != null ? Meteor.settings.loglevel : undefined,
          x2 => x2[namespace]
        );
        if (serverLevel != null) {
          level = serverLevel;
        }
      }
      return level;
    }

    createLogger(namespace, defaultLevel) {
      if (namespace == null) {
        namespace = "";
      }
      if (defaultLevel == null) {
        defaultLevel = "info";
      }

      const options = {};
      if (namespace.length > 0) {
        options.prefix = namespace + ":";
      }
      options.level = this._getSettingsLoglevel(namespace, defaultLevel);
      const log = Loglevel(options);

      return log;
    }

    createPackageLogger(packageName, defaultLevel) {
      if (defaultLevel == null) {
        defaultLevel = "info";
      }
      return this.createLogger(packageName, defaultLevel);
    }

    createAppLogger(appName, defaultLevel) {
      if (appName == null) {
        appName = "app";
      }
      if (defaultLevel == null) {
        defaultLevel = "info";
      }
      return this.createLogger(appName, defaultLevel);
    }
  });
  Cls.initClass();
  return Cls;
})();

export default practical.LoggerFactory.get();

function __guard__(value, transform) {
  return typeof value !== "undefined" && value !== null
    ? transform(value)
    : undefined;
}
