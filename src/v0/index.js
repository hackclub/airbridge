import express from "express"
const router = express.Router()
const env = process.env.NODE_ENV || "development"
import { airtableLookup } from './utils'

router.get('/:base/:tableName/:recordID', async(req, res, next) => {
  /*
    version: Required. api version to use. Before version 1.0 this isn't being checked– go ahead and put a 0 there
    base: Required. Either base ID ("routertEEFG5HTfGQE7h") or base name ("Operations")
    tableName: Required. WARNING: this table doesn't get read
    RecordID: Required. ex "Clubs"
  */
  const startTime = Date.now()
  const meta = {
    params: {...req.params, version: 0},
    query: {...req.query},
  }
  if (req.query.authKey) {
    meta.query.authKey = '[redacted]'
  }
  try {
    let providedAuth
    if (req.headers.authorization) {
      // example auth header "Bearer key9uu912ij9e"
      providedAuth = req.headers.authorization.replace('Bearer ', '')
    }
    if (env === 'development' || env === 'test') {
      providedAuth = req.query.authKey
    }
    const options = {
      base: req.params.base,
      tableName: req.params.tableName,
      recordID: req.params.recordID,
      authKey: providedAuth,
    }
    if (req.query.select) {
      options.select = JSON.parse(req.query.select)
    }
    const result = await airtableFind(options, providedAuth)

    meta.duration = Date.now() - startTime

    if (req.query.meta) {
      res.json({result, meta})
    } else {
      res.json(result)
    }
  } catch (err) {
    console.log(err.message)

    const statusCode = err.statusCode || 500
    meta.duration = Date.now() - startTime
    res.status(statusCode).send({
      error: {
        message: err.message,
        statusCode
      },
      meta
    })
  }
})
router.get('/:base/:tableName', async(req, res, next) => {
  /*
    version: Required. api version to use. Before version 1.0 this isn't being checked– go ahead and put a 0 there
    base: Required. Either base ID ("routertEEFG5HTfGQE7h") or base name ("Operations")
    tableName: Required. ex "Clubs"
  */
  const startTime = Date.now()
  const meta = {
    params: {...req.params, version: 0},
    query: {...req.query},
  }
  if (req.query.authKey) {
    meta.query.authKey = '[redacted]'
  }
  try {
    let providedAuth
    if (req.headers.authorization) {
      // example auth header "Bearer key9uu912ij9e"
      providedAuth = req.headers.authorization.replace('Bearer ', '')
    }
    if (env === 'development' || env === 'test') {
      providedAuth = req.query.authKey
    }
    const options = {
      base: req.params.base,
      tableName: req.params.tableName,
      authKey: providedAuth,
    }
    if (req.query.select) {
      options.select = JSON.parse(req.query.select)
    }
    const result = await airtableLookup(options, providedAuth)

    meta.duration = Date.now() - startTime

    if (req.query.meta) {
      res.json({result, meta})
    } else {
      res.json(result)
    }
  } catch (err) {
    console.log(err.message)

    const statusCode = err.statusCode || 500
    meta.duration = Date.now() - startTime
    res.status(statusCode).send({
      error: {
        message: err.message,
        statusCode
      },
      meta
    })
  }
})

export default router