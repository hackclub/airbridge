const request = require("supertest")
const app = require("../../src/index").server

describe("GET /v0.1/Cake/Badges (invalid base)", () => {
  it("responds with Not Found", async () => {
    const res = await request(app).get("/v0.1/Cake/Badges")
    expect(res.statusCode).toEqual(404)
  })
  it("responds with json error", async () => {
    const res = await request(app).get("/v0.1/Cake/Badges")
    expect(res.body).toBeDefined()
    expect(res.body.error).toBeDefined()
    expect(res.body.error.message).toMatch("Not found")
  })
})

describe("GET /v0.1/Operations/Cake (invalid table)", () => {
  it("responds with Not Found", async () => {
    const res = await request(app).get("/v0.1/Operations/Cake")
    expect(res.statusCode).toEqual(404)
  })
  it("responds with json error", async () => {
    const res = await request(app).get("/v0.1/Operations/Cake")
    expect(res.body).toBeDefined()
    expect(res.body.error).toBeDefined()
    expect(res.body.error.message).toMatch("Not found")
  })
})

describe("GET /v0.1/Operations/Badges", () => {
  it("responds with successful status code", async () => {
    const res = await request(app).get("/v0.1/Operations/Badges")
    expect(res.statusCode).toEqual(200)
  })
  it("responds with an array of airtable records", async () => {
    const res = await request(app).get("/v0.1/Operations/Badges")
    expect(res.body).toBeDefined()
    expect(Array.isArray(res.body)).toEqual(true)
  })
})

describe("POST /v0.1/Operations/Badges (without auth)", () => {
  it("responds with Unauthorized", async () => {
    const res = await request(app).post("/v0.1/Operations/Badges")
    expect(res.statusCode).toEqual(401)
  })
})

describe("POST /v0.1/Operations/Badges (invalid auth)", () => {
  it("responds with Unauthorized", async () => {
    const res = await request(app).post(
      "/v0.1/Operations/Badges?authKey=123456"
    )
    expect(res.statusCode).toEqual(401)
  })
})
