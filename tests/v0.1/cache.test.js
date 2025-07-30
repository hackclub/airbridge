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

describe("GET request with cache enabled (production)", () => {
  const route = "/v0.1/Operations/Badges?cache=true&meta=true"

  test("increments the cache hit", async () => {
    const port = server.address().port
    await fetch(`http://localhost:${port}${route}`)
    const res = await fetch(`http://localhost:${port}${route}`)
    const body = await res.json()
    expect(body.meta.cache.keys).toBeGreaterThan(0)
  })
  test("indicates the data was pulled from cache", async () => {
    const port = server.address().port
    await fetch(`http://localhost:${port}${route}`)
    const res = await fetch(`http://localhost:${port}${route}`)
    const body = await res.json()
    expect(body.meta.cache.pulledFrom).toEqual(true)
  })
  test("runs faster than without cache", async () => {
    const port = server.address().port
    const routeNoCache = "/v0.1/Operations/Badges?meta=true"
    const resNoCache = await fetch(`http://localhost:${port}${routeNoCache}`)
    const bodyNoCache = await resNoCache.json()
    const res = await fetch(`http://localhost:${port}${route}`)
    const body = await res.json()
    expect(bodyNoCache.meta.duration).toBeGreaterThan(
      body.meta.duration
    )
  })
})

// Server is managed in test runner
