const PUBLIC_AUTH_KEY = "recsxFPWtS57ipww81611873047g41m8dw1t8p" // publicly available authkey to use if user doesn't provide their own. This is intended to be publicly viewable

import Airtable from "airtable"
import express from "express"
import { getPermissions } from "./permissions"
const router = express.Router()
const env = process.env.NODE_ENV || "development"

router.use(async (req, res, next) => {
  // preprocess all requests
  res.locals.start = Date.now()
  res.locals.response = {}
  res.locals.authKey = req.query.authKey || PUBLIC_AUTH_KEY
  res.locals.showMeta = req.query.meta
  res.locals.meta = {
    version: 0.2,
    params: { ...req.params },
    query: { ...req.query },
    body: req.body,
  }

  if (req.query.authKey) {
    res.locals.authKey = req.query.authKey
    res.locals.meta.query.authKey = "[redacted]"
  }

  res.locals.permissions = await getPermissions(res.locals.authKey)

  if (!res.locals.permissions) {
    const error = new Error("Invalid authKey provided")
    error.statusCode = 401
    return next(error)
  }

  next()
})

router.get("/:base/:tableName", async (req, res, next) => {
  const basePermission = Object.keys(res.locals.permissions).includes(req.params.base)
  if (!basePermission) {
    const error = new Error("Base not found or permissions insufficient")
    errorMonitor.statusCode = 404
    return next(error)
  }

  const tablePermission = Object.keys(
    res.locals.permissions[req.params.base]
  ).includes(req.params.tableName)
  if (!tablePermission) {
    const error = new Error("Table not found or permissions insufficient")
    error.statusCode = 404
    return next(error)
  }
  const permittedFields = res.locals.permissions[req.params.base][req.params.tableName].get
  const unpermittedFields = Object.keys(req.body).filter(
    (field) =>
      !permittedFields.includes(field)
  )
  const fieldPermission = unpermittedFields.length === 0
  if (!fieldPermission) {
    const error = new Error(
      `Field(s) ${unpermittedFields
        .map((f) => `'${f}'`)
        .join(", ")} doesn't exist or permissions insufficient`
    )
    error.statusCode = 422
    return next(error)
  }

  // we have permission to use the table, pull the info
  const ab = res.locals.permissions[req.params.base].baseID
  const at = req.params.tableName
  const airinst = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    ab
  )(at)
  const select = {}
  if (req.query.select) {
    select = JSON.parse(req.query.select)
  }
  const rawResults = await airinst
    .select(select)
    .all()
    .catch((err) => console.log(err))

  const permissions =
    res.locals.permissions[req.params.base][req.params.tableName]?.get || []
  const results = rawResults.map(rawResult => {
    const filteredResult = { id: rawResult.id, fields: {} }
    permissions.forEach(field => {
      filteredResult.fields[field] = rawResult.fields[field]
    })
    return filteredResult
  })

  res.locals.response = results
  respond(null, req, res, next)
})

router.post("/:base/:tableName", async (req, res, next) => {
  const basePermission = Object.keys(res.locals.permissions).includes(
    req.params.base
  )
  if (!basePermission) {
    const error = new Error("Base not found or permissions insufficient")
    error.statusCode = 404
    return next(error)
  }
  const tablePermission = Object.keys(
    res.locals.permissions[req.params.base]
  ).includes(req.params.tableName)
  if (!tablePermission) {
    const error = new Error("Table not found or permissions insufficient")
    error.statusCode = 404
    return next(error)
  }
  const unpermittedFields = Object.keys(req.body).filter(
    (field) =>
      !res.locals.permissions[req.params.base][
        req.params.tableName
      ].post.includes(field)
  )
  const fieldPermission = unpermittedFields.length === 0
  if (!fieldPermission) {
    const error = new Error(
      `Field(s) ${unpermittedFields
        .map((f) => `'${f}'`)
        .join(", ")} doesn't exist or permissions insufficient`
    )
    error.statusCode = 422
    return next(error)
  }

  // we have permission to use the table, pull the info & leave
  const ab = res.locals.permissions[req.params.base].baseID
  const at = req.params.tableName
  const airinst = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    ab
  )(at)
  const createValues = Array.isArray(req.body)
    ? { fields: req.body }
    : [{ fields: req.body }]
  const rawResults = await airinst
    .create(createValues)
    .catch((err) => console.log(err))

  const rawResultArray = Array.isArray(rawResults) ? rawResults : [rawResults]
  const results = rawResults.map((rec) => {
    const result = { id: rec.id, fields: {} }
    const readPermissions =
      res.locals.permissions[req.params.base][req.params.tableName]?.get || []
    const writePermissions =
      res.locals.permissions[req.params.base][req.params.tableName].post

    const allowedFields = Array.from([
      ...new Set([...readPermissions, ...writePermissions]),
    ])
    allowedFields.forEach((field) => {
      result.fields[field] = rec.fields[field]
    })
    return result
  })
  if (Array.isArray(req.body)) {
    res.locals.response = results
  } else {
    res.locals.response = results[0]
  }

  respond(null, req, res, next)
})

router.patch("/:base/:tableName", async (req, res, next) => {
  res.status(501).send("v0.2 PATCH not implemented yet!")
})

router.get("/test", async (req, res, next) => {
  res.json({ ping: "pong" })
  next()
})

router.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({ error: error.toString() })
})

function respond(err, req, res, next) {
  res.locals.meta.duration = Date.now() - res.locals.start
  res.locals.meta.params = {
    ...res.locals.meta.params,
    ...req.params,
    version: 0.2,
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

export default router
