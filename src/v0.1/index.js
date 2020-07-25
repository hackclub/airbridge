import { airtableCreate, airtableLookup } from "./utils.js"
import apicache from "apicache"
import express from "express"
const router = express.Router()
const cache = apicache.middleware

router.use((req, res, next) => {
  res.locals.start = Date.now()
  res.locals.showMeta = req.query.meta
  res.locals.response = {}
  res.locals.meta = {
    params: { ...req.params },
    query: { ...req.query },
    cache: { 
      index: apicache.getIndex(),
      performance: apicache.getPerformance()
    }
  }

  if (req.query.authKey) {
    res.locals.authKey = req.query.authKey
    res.locals.meta.query.authKey = "[redacted]"
  }

  next()
})

function respond(err, req, res, next) {
  res.locals.meta.duration = Date.now() - res.locals.start
  res.locals.meta.params = {
    ...res.locals.meta.params,
    ...req.params,
    version: 0.1,
  }

  if (err) {
    const statusCode = err.statusCode || 500
    res.status(statusCode).send({
      error: { ...err, message: err.message, statusCode },
      meta: res.locals.meta,
    })
  } else {
    if (res.locals.showMeta) {
      if (Array.isArray(res.locals.response)) {
        res.locals.meta.resultCount = res.locals.response.length
      } else {
        res.locals.meta.resultCount = 1
      }
      res.json({
        response: res.locals.response,
        meta: res.locals.meta,
      })
    } else {
      res.json(res.locals.response)
    }
  }

  next()
}

router.post("/:base/:tableName", async (req, res, next) => {
  const options = {
    base: req.params.base,
    tableName: req.params.tableName,
    fields: req.body,
  }
  try {
    class NotImplementedError extends Error {
      constructor(message) {
        super(message)
        this.name = "NotImplementedError"
        this.statusCode = 501
      }
    }
    throw new NotImplementedError("Posting is not yet implemented")

    // const record = await airtableCreate(options, res.locals.authKey)

    // console.log(record)
    // res.locals.response = record

    // respond(null, req, res, next)
  } catch (err) {
    respond(err, req, res, next)
  }
})

const cacheConditions = (req, res) => (
  res.statusCode === 200 && req.query.cache
)
router.get("/:base/:tableName", cache('10 seconds', cacheConditions), async (req, res, next) => {
  const options = {
    base: req.params.base,
    tableName: req.params.tableName,
  }
  if (req.query.select) {
    try {
      options.select = JSON.parse(req.query.select)
    } catch (err) {
      respond(err, req, res, next)
    }
  }
  try {
    const result = await airtableLookup(options, res.locals.authKey)
    res.locals.response = result

    respond(null, req, res, next)
  } catch (err) {
    respond(err, req, res, next)
  }
})

// // add route to display cache performance (courtesy of @killdash9)
// router.get('/meta/cache/performance', (req, res) => {
//   res.json(apicache.getPerformance())
// })

// // add route to display cache index
// router.get('/meta/cache/index', (req, res) => {
//   res.json(apicache.getIndex())
// })

export default router
