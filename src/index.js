const env = process.env.NODE_ENV || 'development'
if (env === 'development') {
  require('dotenv').config()
}

import express from 'express'
import Airtable from 'airtable'
import redis from 'redis'
import redisCache from 'express-redis-cache'
const redisClient = redis.createClient(process.env.REDIS_URL)
const cache = redisCache({ client: redisClient })

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
  res.status(200).json({ message: 'pong!' })
})

app.get(
  '/',
  cache.route({ expire: { 200: 5, 403: 60, xxx: 0 } }),
  (req, res, next) => {
    operationsBase('Clubs')
      .select()
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

          res.status(200).json(result)
        }
      })
  }
)

const server = app.listen(process.env.PORT || 2346, () =>
  console.log(`Up and listening on ${server.address().port}`)
)
