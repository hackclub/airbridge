const PUBLIC_AUTH_KEY = 'recsxFPWtS57ipww81611873047g41m8dw1t8p' // publicly available authkey to use if user doesn't provide their own. This is intended to be publicly viewable

import Airtable from 'airtable'
import express from 'express'
import { getPermissions } from './permissions'
const router = express.Router()
const env = process.env.NODE_ENV || "development"

router.use(async (req, res, next) => {
  // preprocess all requests
  res.locals.response = {}
  res.locals.authKey = req.query.authKey || PUBLIC_AUTH_KEY
  res.locals.permissions = await getPermissions(res.locals.authKey)

  next()
})

router.get("/:base/:tableName", async (req, res, next) => {
  console.log(res.locals.permissions)
  if (!res.locals.permissions[req.params.base]) {
    console.log('base not allowed')
    res.status(400).send('base not allowed')
    next()
  }
  if (!res.locals.permissions[req.params.base][req.params.tableName]) {
    console.log('table not allowed')
    res.status(400).send('table not allowed')
    next()
  }
  // we have permission to use the table, pull the info & leave
  const ab = res.locals.permissions[req.params.base].baseID
  const at = req.params.tableName
  const airinst = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(ab)(at)
  const rawResults = await airinst.select().all().catch(err => console.log(err))

  const permissions = res.locals.permissions[req.params.base][req.params.tableName]
  let results
  if (permissions.readAllFields) {
    results = rawResults.map(result => ({id: result.id, fields: result.fields}))
  } else if (permissions.fields) {
    results = rawResults.map(result => {
      const filteredResult = {id: result.id}
      permissions.fields.forEach(field => {
        filteredResult.field[field] = result[field]
      })
    })
  } else {
    results = rawResults.map(result => ({id: result.id}))
  }
  
  res.json({results})
  
  next()
})

router.post("/:base/:tableName", async (req, res, next) => {

})

router.patch("/:base/:tableName", async (req, res, next) => {

})

router.get('/test', async (req, res, next) => {
  res.json({ping: 'pong'})
  next()
})

export default router