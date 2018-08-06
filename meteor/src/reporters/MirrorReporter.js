{ObjectLogger}  = require("meteor/practicalmeteor:loglevel")
log = new ObjectLogger('MirrorReporter', 'info')

class MirrorReporter

  constructor:(@mochaReporter, options)->

    clientRunner = options.reporterOptions?.clientRunner
    expect(clientRunner, "clientRunner").to.be.ok

    # The in order to calculate the progress
    clientRunner.total = @mochaReporter.total

    @mochaReporter.on 'start', =>
      try
        log.enter 'onStart', arguments
        clientRunner.emit.call(clientRunner, 'start')
      finally
        log.return()

    @mochaReporter.on 'suite', (suite)=>
      try
        log.enter 'onSuite', arguments
        clientRunner.emit.call(clientRunner, 'suite',suite)
      finally
        log.return()

    @mochaReporter.on 'suite end', (suite)=>
      try
        log.enter 'onSuiteEnd', arguments
        clientRunner.emit.call(clientRunner, 'suite end',suite)
      finally
        log.return()

    @mochaReporter.on 'test end', (test)=>
      try
        log.enter 'onTestEnd', arguments
        clientRunner.emit.call(clientRunner, 'test end', test)
      finally
        log.return()

    @mochaReporter.on 'pass', (test)=>
      try
        log.enter 'onPass', arguments
        clientRunner.emit.call(clientRunner, 'pass', test)
      finally
        log.return()

    @mochaReporter.on 'fail', (test, error)=>
      try
        log.enter 'onFail', arguments
        clientRunner.emit.call(clientRunner, 'fail', test, error)
      finally
        log.return()

    @mochaReporter.on 'end', =>
      try
        log.enter 'onEnd', arguments
        clientRunner.emit.call(clientRunner, 'end')
      finally
        log.return()

    @mochaReporter.on 'pending', (test)=>
      try
        log.enter 'onPending', arguments
        clientRunner.emit.call(clientRunner, 'pending', test)

      finally
        log.return()


module.exports = MirrorReporter
