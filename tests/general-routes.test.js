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

describe('GET /Operations/Badges (missing version number)', () => {
  it('responds with Not Found', async () => {
    const res = await request(app).get('/Operations/Badges')
    expect(res.statusCode).toEqual(404)
  })
})

describe('GET /v9999/Operations/Badges (invalid version number)', () => {
  it('responds with Not Found', async () => {
    const res = await request(app).get('/v9999/Operations/Badges')
    expect(res.statusCode).toEqual(404)
  })
})