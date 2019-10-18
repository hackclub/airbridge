import express from 'express'

const app = express()

app.get('/', (req, res) => {
  res.status(200).json({ message: 'hello!' })
})

const server = app.listen(process.env.PORT || 2345, () =>
  console.log(`Up and listening on ${server.address().port}`)
)
