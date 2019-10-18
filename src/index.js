const env = process.env.NODE_ENV || 'development'
if (env === 'development') {
  require('dotenv').config()
}

import express from 'express'
import Airtable from 'airtable'
import redis from 'redis'
import apicache from 'apicache'

const redisClient = redis.createClient(process.env.REDIS_URL)
const cacheWithRedis = apicache.options({
  redisClient,
  statusCodes: { include: [200, 304] },
  headers: {
    'cache-control': 'no-cache',
  },
}).middleware

const filterClubData = input => {
  const allowed = ['Name', 'Slack Channel ID', 'Leader Slack IDs']
  const result = {}
  allowed.forEach(key => {
    result[key] = input.fields[key]
  })
  return result
}

const operationsBase = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_OPERATIONS_TABLE)

const app = express()

app.get('/ping', (req, res) => {
  setTimeout(() => {
    res.status(200).json({ message: 'pong!' })
  }, 1000)
})

app.get('/', cacheWithRedis('30 seconds'), (req, res, next) => {
  const timestamp = Date.now()
  console.log('Getting request for club list')
  operationsBase('Clubs')
    .select({ filterByFormula: '!{Dummy}' })
    .all((err, records) => {
      if (err) {
        console.error(err)
        res
          .status(500)
          .send(
            `Received error code '${err.statusCode}' from Airtable: '${err.message}'`
          )
      } else {
        const result = records.map(filterClubData)
        console.log(
          `Responded to club list request in ${Date.now() - timestamp}ms`
        )

        res.status(200).json(result)
      }
    })
})

const server = app.listen(process.env.PORT || 5000, () =>
  console.log(`Up and listening on ${server.address().port}`)
)
