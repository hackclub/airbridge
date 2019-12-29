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
  // it('responds with json error', async () => {
  //   const res = await request(app).get('/Operations/Badges')
  //   expect(res.body).toBeDefined()
  //   expect(res.body.error).stringContaining('Not found')
  // })
})

describe('GET /v0/Cake/Badges (invalid base)', () => {
  it('responds with Not Found', async () => {
    const res = await request(app).get('/v0/Cake/Badges')
    expect(res.statusCode).toEqual(404)
  })
  it('responds with json error', async () => {
    const res = await request(app).get('/v0/Cake/Badges')
    expect(res.body).toBeDefined()
    expect(res.body.error).toBeDefined()
    expect(res.body.error.message).toMatch('Not found')
  })
})

describe('GET /v0/Operations/Cake (invalid table)', () => {
  it('responds with Not Found', async () => {
    const res = await request(app).get('/v0/Operations/Cake')
    expect(res.statusCode).toEqual(404)
  })
  it('responds with json error', async () => {
    const res = await request(app).get('/v0/Operations/Cake')
    expect(res.body).toBeDefined()
    expect(res.body.error).toBeDefined()
    expect(res.body.error.message).toMatch('Not found')
  })
})

describe('GET /v0/Operations/Badges', () => {
  it('responds with successful status code', async () => {
    const res = await request(app).get('/v0/Operations/Badges')
    expect(res.statusCode).toEqual(200)
  })
  it('responds with an array of airtable records', async () => {
    const res = await request(app).get('/v0/Operations/Badges')
    expect(res.body).toBeDefined()
    expect(Array.isArray(res.body)).toEqual(true)
  })
})

// describe('GET /v0/Operations/Badges', async () => {
//   it('responds with badge data', async () => {
//     const res = request(app).get('/v0/Operations/Badges')
//     console.log(res.body)
//     expect(res.body).toBeDefined()
//   })
// })