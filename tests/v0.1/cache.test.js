const request = require("supertest")
const app = require("../../src/index").server

describe("GET request with cache enabled", () => {
  it("increments the cache hit", async () => {
    const route = "/v0.1/Operations/Badges?cache=true&meta=true"
    const first = await request(app).get(route)
    const second = await request(app).get(route)
    expect(second.body.meta.cache.hits).toBeGreaterThan(
      first.body.meta.cache.hits
    )
  })
})
