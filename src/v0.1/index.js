import { airtableCreate, airtableLookup, airtableUpdate } from "./utils.js"
import NodeCache from "node-cache"
import express from "express"
const router = express.Router()
const cache = new NodeCache()

router.use((req, res, next) => {
  res.locals.start = Date.now()
  res.locals.showMeta = req.query.meta
  res.locals.response = {}
  res.locals.meta = {
    params: { ...req.params },
    query: { ...req.query },
    body: { ...res.body },
    cache: {
      key: cacheKey(req),
      ...cache.getStats(),
    },
  }

  if (req.query.authKey) {
    res.locals.authKey = req.query.authKey
    res.locals.meta.query.authKey = "[redacted]"
  }

  next()
})

function cacheKey(req) {
  const { meta, cache, ...filteredQuery } = req.query
  return req.baseUrl + req._parsedUrl.pathname + JSON.stringify(filteredQuery)
}

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

  if (!res.locals.meta.cache.pulledFrom && res.statusCode == 200) {
    const key = cacheKey(req)
    console.log("Saving result to my cache with key", key)
    cache.set(key, res.locals.response)
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
    res.locals.response = await airtableCreate(options, req.query.authKey)
    respond(null, req, res, next)
  } catch (err) {
    respond(err, req, res, next)
  }
})

router.patch("/:base/:tableName", async (req, res, next) => {
  const options = {
    base: req.params.base,
    tableName: req.params.tableName,
    record: req.body,
  }
  try {
    res.locals.response = await airtableUpdate(options, req.query.authKey)
    respond(null, req, res, next)
  } catch (err) {
    respond(err, req, res, next)
  }
})

router.get("/:base/:tableName", async (req, res, next) => {
  const options = {
    base: req.params.base,
    tableName: req.params.tableName,
  }
  if (req.query.recordId) {
    options.recordId = req.query.recordId
  }
  if (req.query.select) {
    try {
      options.select = JSON.parse(req.query.select)
    } catch (err) {
      respond(err, req, res, next)
    }
  }
  if (req.query.cache) {
    console.log("Cache flag enabled", cacheKey(req))
    const cacheResult = cache.get(cacheKey(req))
    if (cacheResult) {
      console.log("Found results in cache!")
      res.locals.meta.cache.pulledFrom = true
      res.locals.response = cacheResult
      respond(null, req, res, next)
    } else {
      console.log("Nothing found in cache!")
      try {
        res.locals.response = await airtableLookup(options, res.locals.authKey)
        respond(null, req, res, next)
      } catch (err) {
        respond(err, req, res, next)
      }
    }
  } else {
    try {
      res.locals.response = await airtableLookup(options, res.locals.authKey)
      respond(null, req, res, next)
    } catch (err) {
      respond(err, req, res, next)
    }
  }
})

export default router
