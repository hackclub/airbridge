const request = require("supertest")
let app

beforeAll(() => {
  app = require("../../src/index").server
  return app
})

describe("GET /v0/Cake/Badges (invalid base) (production)", () => {
  it("responds with Not Found", async () => {
    const res = await request(app).get("/v0/Cake/Badges")
    expect(res.statusCode).toEqual(404)
  })
  it("responds with json error", async () => {
    const res = await request(app).get("/v0/Cake/Badges")
    expect(res.body).toBeDefined()
    expect(res.body.error).toBeDefined()
    expect(res.body.error.message).toMatch("Not found")
  })
})

describe("GET /v0/Operations/Cake (invalid table) (production)", () => {
  it("responds with Not Found", async () => {
    const res = await request(app).get("/v0/Operations/Cake")
    expect(res.statusCode).toEqual(404)
  })
  it("responds with json error", async () => {
    const res = await request(app).get("/v0/Operations/Cake")
    expect(res.body).toBeDefined()
    expect(res.body.error).toBeDefined()
    expect(res.body.error.message).toMatch("Not found")
  })
})

describe("GET /v0/Operations/Badges (production)", () => {
  it("responds with successful status code", async () => {
    const res = await request(app).get("/v0/Operations/Badges")
    expect(res.statusCode).toEqual(200)
  })
  it("responds with an array of airtable records", async () => {
    const res = await request(app).get("/v0/Operations/Badges")
    expect(res.body).toBeDefined()
    expect(Array.isArray(res.body)).toEqual(true)
  })
})

afterAll(() => app.close())
