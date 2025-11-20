import { test, describe, beforeAll, afterAll, expect } from "bun:test"
import { app } from "../../src/index.js"

let server

beforeAll(async () => {
  server = app.listen(0)
  await new Promise((resolve) => server.on("listening", resolve))
})

afterAll(async () => {
  if (server) {
    server.close()
  }
})

describe("GET unsafe formula", () => {
  test("responds with error status code", async () => {
    const port = server.address().port
    const select = {
      filterByFormula: "SUBSTITUTE",
    }
    const res = await fetch(
      `http://localhost:${port}/v0.1/Operations/Badges?${new URLSearchParams({
        select: JSON.stringify(select),
      })}`
    )
    expect(res.status).toEqual(400)
  })
})
