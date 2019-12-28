const request = require('supertest')
const app = require('../src/index').server

describe('GET /', () => {
  it('responds with a redirect', async () => {
    const res = await request(app).get('/')
    expect(res.statusCode).toEqual(302)
  })
})

describe('GET /ping', () => {
  it('responds with a success', async () => {
    const res = await request(app).get('/ping')
    expect(res.statusCode).toEqual(200)
  })
  it('responds with a json response', async () => {
    const res = await request(app).get('/ping')
    expect(res.body).toBeDefined()
    expect(res.body.message).toEqual('pong!')
  })
})