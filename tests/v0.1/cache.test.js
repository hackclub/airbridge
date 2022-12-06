const request = require("supertest")
let app

beforeAll(() => {
  app = require("../../src/index").server
  return app
})

describe("GET request with cache enabled (production)", () => {
  const route = "/v0.1/Operations/Badges?cache=true&meta=true"

  it("increments the cache hit", async () => {
    await request(app).get(route)
    const res = await request(app).get(route)
    expect(res.body.meta.cache.keys).toBeGreaterThan(0)
  })
  it("indicates the data was pulled from cache", async () => {
    await request(app).get(route)
    const res = await request(app).get(route)
    expect(res.body.meta.cache.pulledFrom).toEqual(true)
  })
  it("runs faster than without cache", async () => {
    const routeNoCache = "/v0.1/Operations/Badges?meta=true"
    const resNoCache = await request(app).get(routeNoCache)
    const res = await request(app).get(route)
    expect(resNoCache.body.meta.duration).toBeGreaterThan(
      res.body.meta.duration
    )
  })
})

afterAll(() => app.close())
