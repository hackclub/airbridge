import { test, describe, beforeAll, afterAll, expect } from "bun:test"
import { app } from "../../src/index.js"

let server

beforeAll(async () => {
  // Start server for testing on a random port
  server = app.listen(0)
  await new Promise(resolve => server.on('listening', resolve))
})

afterAll(async () => {
  if (server) {
    server.close()
  }
})

describe("GET /v0.1/Cake/Badges (invalid base) (production)", () => {
  test("responds with Not Found", async () => {
    const port = server.address().port
    const res = await fetch(`http://localhost:${port}/v0.1/Cake/Badges`)
    expect(res.status).toEqual(404)
  })
  test("responds with json error", async () => {
    const port = server.address().port
    const res = await fetch(`http://localhost:${port}/v0.1/Cake/Badges`)
    const body = await res.json()
    expect(body).toBeDefined()
    expect(body.error).toBeDefined()
    expect(body.error.message).toMatch("Not found")
  })
})

describe("GET /v0.1/Operations/Cake (invalid table) (production)", () => {
  test("responds with Not Found", async () => {
    const port = server.address().port
    const res = await fetch(`http://localhost:${port}/v0.1/Operations/Cake`)
    expect(res.status).toEqual(404)
  })
  test("responds with json error", async () => {
    const port = server.address().port
    const res = await fetch(`http://localhost:${port}/v0.1/Operations/Cake`)
    const body = await res.json()
    expect(body).toBeDefined()
    expect(body.error).toBeDefined()
    expect(body.error.message).toMatch("Not found")
  })
})

describe("GET /v0.1/Operations/Badges (production)", () => {
  test("responds with successful status code", async () => {
    const port = server.address().port
    const res = await fetch(`http://localhost:${port}/v0.1/Operations/Badges`)
    expect(res.status).toEqual(200)
  })
  test("responds with an array of airtable records", async () => {
    const port = server.address().port
    const res = await fetch(`http://localhost:${port}/v0.1/Operations/Badges`)
    const body = await res.json()
    expect(body).toBeDefined()
    expect(Array.isArray(body)).toEqual(true)
  })
})

describe("POST /v0.1/Operations/Badges (without auth) (production)", () => {
  test("responds with Unauthorized", async () => {
    const port = server.address().port
    const res = await fetch(`http://localhost:${port}/v0.1/Operations/Badges`, {
      method: 'POST'
    })
    expect(res.status).toEqual(401)
  })
})

describe("POST /v0.1/Operations/Badges (invalid auth) (production)", () => {
  test("responds with Unauthorized", async () => {
    const port = server.address().port
    const res = await fetch(`http://localhost:${port}/v0.1/Operations/Badges?authKey=123456`, {
      method: 'POST'
    })
    expect(res.status).toEqual(401)
  })
})

describe("PATCH /v0.1/Operations/Badges (without auth) (production)", () => {
  test("responds with Unauthorized", async () => {
    const port = server.address().port
    const res = await fetch(`http://localhost:${port}/v0.1/Operations/Badges`, {
      method: 'PATCH'
    })
    expect(res.status).toEqual(401)
  })
})

describe("PATCH /v0.1/Operations/Badges (without body) (production)", () => {
  test("responds with Unprocessable", async () => {
    const port = server.address().port
    const res = await fetch(`http://localhost:${port}/v0.1/Operations/Badges?authKey=123456`, {
      method: 'PATCH'
    })
    expect(res.status).toEqual(422)
  })
})

// Server is managed in test runner
