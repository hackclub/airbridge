const request = require("supertest")
let app

beforeAll(() => {
  app = require("../../src/index").server
  return app
})

describe("GET /v0.1/Cake/Badges (invalid base) (production)", () => {
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

describe("GET /v0.1/Operations/Cake (invalid table) (production)", () => {
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

describe("GET /v0.1/Operations/Badges (production)", () => {
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

describe("POST /v0.1/Operations/Badges (without auth) (production)", () => {
  it("responds with Unauthorized", async () => {
    const res = await request(app).post("/v0.1/Operations/Badges")
    expect(res.statusCode).toEqual(401)
  })
})

describe("POST /v0.1/Operations/Badges (invalid auth) (production)", () => {
  it("responds with Unauthorized", async () => {
    const res = await request(app).post(
      "/v0.1/Operations/Badges?authKey=123456"
    )
    expect(res.statusCode).toEqual(401)
  })
})

describe("PATCH /v0.1/Operations/Badges (without auth) (production)", () => {
  it("responds with Unauthorized", async () => {
    const res = await request(app).patch("/v0.1/Operations/Badges")
    expect(res.statusCode).toEqual(401)
  })
})

describe("PATCH /v0.1/Operations/Badges (without body) (production)", () => {
  it("responds with Unprocessable", async () => {
    const res = await request(app).patch(
      "/v0.1/Operations/Badges?authKey=123456"
    )
    expect(res.statusCode).toEqual(422)
  })
})

afterAll(() => app.close())
