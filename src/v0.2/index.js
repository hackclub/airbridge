const PUBLIC_AUTH_KEY = "recsxFPWtS57ipww81611873047g41m8dw1t8p" // publicly available authkey to use if user doesn't provide their own. This is intended to be publicly viewable

import Airtable from "airtable"
import express from "express"
import { getPermissions } from "./permissions"
const router = express.Router()
const env = process.env.NODE_ENV || "development"

router.use(async (req, res, next) => {
  // preprocess all requests
  res.locals.response = {}
  res.locals.authKey = req.query.authKey || PUBLIC_AUTH_KEY
  res.locals.meta = {
    version: 0.2,
    params: { ...req.params },
    query: { ...req.query },
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
  if (!Object.keys(res.locals.permissions).includes(req.params.base)) {
    const error = new Error("Base not found or permissions insufficient")
    error.statusCode = 404
    return next(error)
  }
  if (
    !Object.keys(res.locals.permissions[req.params.base]).includes(
      req.params.tableName
    )
  ) {
    const error = new Error("Table not found or permissions insufficient")
    error.statusCode = 404
    return next(error)
  }
  // we have permission to use the table, pull the info & leave
  const ab = res.locals.permissions[req.params.base].baseID
  const at = req.params.tableName
  const airinst = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    ab
  )(at)
  const rawResults = await airinst
    .select()
    .all()
    .catch((err) => console.log(err))

  const permissions =
    res.locals.permissions[req.params.base][req.params.tableName]
  let results
  if (permissions?.readAllFields) {
    results = rawResults.map((result) => ({
      id: result.id,
      fields: result.fields,
    }))
  } else if (permissions?.fields) {
    results = rawResults.map((rawResult) => {
      const filteredResult = { id: rawResult.id, fields: {} }
      permissions.fields.forEach((field) => {
        filteredResult.fields[field] = rawResult.fields[field]
      })
      return filteredResult
    })
  } else {
    results = rawResults.map((result) => ({ id: result.id, fields: [] }))
  }

  res.json(results)

  next()
})

router.post("/:base/:tableName", async (req, res, next) => {})

router.patch("/:base/:tableName", async (req, res, next) => {})

router.get("/test", async (req, res, next) => {
  res.json({ ping: "pong" })
  next()
})

router.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({ error: error.toString() })
})

export default router
