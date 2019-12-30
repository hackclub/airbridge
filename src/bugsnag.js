import bugsnag from '@bugsnag/js'
import bugsnagExpress from '@bugsnag/plugin-express'

if (process.env.BUGSNAG_API_KEY) {
  const bugsnagClient = bugsnag({
    apiKey: process.env.BUGSNAG_API_KEY,
    notifyReleaseStages: [ 'production' ]
  })
  bugsnagClient.use(bugsnagExpress)
  var bugsnagMiddleware = bugsnagClient.getPlugin('express')
} else {
  console.log('No bugsnag api key provided, skipping configuration')

  // This stubs out bugsnag's methods so we can still load the bugsnag middleware
  var bugsnagMiddleware = {
    requestHandler: (req, res, next) => next(),
    errorHandler: (req, res, next) => next()
  }
}

export const bugsnagRequestHandler = bugsnagMiddleware.requestHandler || (() => true)
export const bugsnagErrorHandler = bugsnagMiddleware.errorHandler || (() => true)