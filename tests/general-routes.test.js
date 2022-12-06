const request = require('supertest')
let app

beforeAll(() => {
  app = require("../src/index").server
  return app
})

describe('GET / (basic)', () => {
  it('responds with a redirect', async () => {
    const res = await request(app).get('/')
    expect(res.statusCode).toEqual(302)
  })
})

describe('GET /ping (basic)', () => {
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

describe('GET /Operations/Badges (missing version number) (basic)', () => {
  it('responds with Not Found', async () => {
    const res = await request(app).get('/Operations/Badges')
    expect(res.statusCode).toEqual(404)
  })
})

describe('GET /v9999/Operations/Badges (invalid version number) (basic)', () => {
  it('responds with Not Found', async () => {
    const res = await request(app).get('/v9999/Operations/Badges')
    expect(res.statusCode).toEqual(404)
  })
})

afterAll(() => app?.close())