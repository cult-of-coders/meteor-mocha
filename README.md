# decaffed

Forked from cultofcoders:mocha, as it still pulled in coffeescript through external dependencies.
This package is **stripped of all coffeescript**, and has some stying changes over practicalmeteor:mocha.





## App testing with meteor test

1) Create your mocha tests in files following the `*.test[s].*` naming convention anywhere in your app folder.

2) Create your mocha [full app tests]((http://guide.meteor.com/testing.html#test-modes)), in files following the `*.app-test[s].*` or `*.app-spec[s].*` naming convention anywhere in your app folder.

3) Add hubroedu:mocha to your meteor app, along with for example chai:

```
meteor add hubroedu:mocha
```
```
meteor npm i --save-dev chai
```


4) Run your mocha tests using `meteor test`:

```bash
# This will execute all your `*.test[s].*` files. Changed port to 3200 to allow running your normal app at the same time
meteor test --driver-package=hubroedu:mocha --port 3200
```

Or, for full app tests:

```bash
# This will execute all your *.app-test[s].* and *.app-spec[s].* files.
meteor test --full-app --driver-package=hubroedu:mocha --port 3200
```

5) Goto http://localhost:3200/ (or to your ROOT_URL) in any browser, to view the test results in mocha's html reporter.

See the [testing section](http://guide.meteor.com/testing.html#test-modes) in meteor's official guide for more info.



## Package testing with meteor test-packages

1) Add hubroedu:mocha and your mocha tests to your package.js Package.onTest section:

```javascript
Package.onTest(function (api) {
  api.use('hubroedu:mocha');

  // Add any files with mocha tests.
  api.addFiles('my-mocha-tests.js');
});
```

2) Run your mocha package tests using `meteor test-packages`:

```bash
meteor test-packages --driver-package hubroedu:mocha <package(s)>
```



## Package testing with [spacejam](https://www.npmjs.com/package/spacejam) from the command line

Note: Support for meteor 1.3 app and package testing in spacejam is coming soon.

With spacejam, you'll use our [practicalmeteor:mocha-console-runner](https://atmospherejs.com/practicalmeteor/mocha-console-runner) as the driver-package to print the test results to the console.

```
spacejam test-packages --driver-package=practicalmeteor:mocha-console-runner <package(s)>
```




## Using Console or XUnit reporters

To set other reporter you just need to export MOCHA_REPORTER env var.

For ConsoleReporter: `MOCHA_REPORTER=console`
For XunitReporter: `MOCHA_REPORTER=xunit`

Those reporter are mean to be use in combination with spacejam, for example

`spacejam test --mocha` Spacejam will use the console reporter and you will see the results in your console. 

`spacejam test --mocha --xunit-out path/to/file.xml` Spacejam in addition to print the tests in your console will also create a file using XUnit format.

For more details about this integration go [HERE](https://github.com/practicalmeteor/spacejam)


## License

[mocha](https://github.com/mochajs/mocha) - [MIT](https://github.com/mochajs/mocha/blob/master/LICENSE)

[mike:mocha](https://atmospherejs.com/mike/mocha) - [MIT](https://github.com/mad-eye/meteor-mocha-web/blob/master/LICENSE)

[practicalmeteor:mocha](https://atmospherejs.com/practicalmeteor/mocha) - [MIT](https://github.com/practicalmeteor/meteor-mocha/blob/meteor/meteor/LICENSE.md)
