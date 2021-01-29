const request = require("supertest")
const app = require("../../src/index").server

describe("GET /v0.2/test", () => {
  it("responds with successful status code", async () => {
    const res = await request(app).get("/v0.2/test")
    expect(res.statusCode).toEqual(200)
  })
})
