const env = process.env.NODE_ENV || 'development'
if (env === 'development' || env === 'test') {
  require('dotenv').config()
}
if (!process.env.AIRTABLE_API_KEY) {
  throw new Error('Missing AIRTABLE_API_KEY from environmental variables')
}

import { airtableLookup } from './utils'
import express from 'express'
import redis from 'redis'
import apicache from 'apicache'

let cacheWithRedis
if (process.env.REDIS_URL) {
  const redisClient = redis.createClient(process.env.REDIS_URL)
  cacheWithRedis = apicache.options({
    redisClient,
    statusCodes: { include: [200, 304] },
    headers: {
      'cache-control': 'no-cache',
    },
  }).middleware
} else {
  console.log('No REDIS_URL env variable found, skipping caching!')
}

const app = express()

app.get('/', (req, res) => {
  res.redirect(302, 'https://github.com/hackclub/api2')
})

app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'pong!' })
})

app.get('/v0/:base/:tableName?/:recordID?', async(req, res, next) => {
  /*
    version: api version to use. Before version 1.0 this isn't being checked– go ahead and put a 0 there
    base: Either base ID ("apptEEFG5HTfGQE7h") or base name ("Operations")
    tableName: Required if no recordID is provided. ex "Clubs"
    recordID: Required if no tableName is provided. ex "rec02xw3TpmHOj7CA"
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
    const result = await airtableLookup(req.params, req.query, providedAuth)

    meta.duration = Date.now() - startTime
    res.json({result, meta})
  } catch (err) {
    console.error(err.message)

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

export const server = app.listen(process.env.PORT || 5000, () =>
  console.log(`Up and listening on ${server.address().port}`)
)