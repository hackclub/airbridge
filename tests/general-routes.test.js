import { test, describe, beforeAll, afterAll, expect } from "bun:test"
import { app } from "../src/index.js"

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

describe('GET / (basic)', () => {
  test('responds with a redirect', async () => {
    const port = server.address().port
    const res = await fetch(`http://localhost:${port}/`, { redirect: 'manual' })
    expect(res.status).toEqual(302)
  })
})

describe('GET /ping (basic)', () => {
  test('responds with a success', async () => {
    const port = server.address().port
    const res = await fetch(`http://localhost:${port}/ping`)
    expect(res.status).toEqual(200)
  })
  test('responds with a json response', async () => {
    const port = server.address().port
    const res = await fetch(`http://localhost:${port}/ping`)
    const body = await res.json()
    expect(body).toBeDefined()
    expect(body.message).toEqual('pong!')
  })
})

describe('GET /Operations/Badges (missing version number) (basic)', () => {
  test('responds with Not Found', async () => {
    const port = server.address().port
    const res = await fetch(`http://localhost:${port}/Operations/Badges`)
    expect(res.status).toEqual(404)
  })
})

describe('GET /v9999/Operations/Badges (invalid version number) (basic)', () => {
  test('responds with Not Found', async () => {
    const port = server.address().port
    const res = await fetch(`http://localhost:${port}/v9999/Operations/Badges`)
    expect(res.status).toEqual(404)
  })
})