import { test, describe, beforeAll, afterAll, expect } from "bun:test"
import { app } from "../../src/index.js"

let server
const TEST_AUTH_KEY = "recx3vr3ziWHPc3K0161186195268u9j3l4z9e"

beforeAll(async () => {
  server = app.listen(0)
  await new Promise((resolve) => server.on("listening", resolve))
})

afterAll(async () => {
  if (server) {
    server.close()
  }
})

describe("GET unsafe formula v0.2", () => {
  test("responds with error status code for unsafe formula without hitting Airtable", async () => {
    const port = server.address().port
    const select = {
      filterByFormula: "SUBSTITUTE",
    }
    const queryString = new URLSearchParams({
      select: JSON.stringify(select),
      authKey: TEST_AUTH_KEY,
    }).toString()

    const res = await fetch(
      `http://localhost:${port}/v0.2/Airbridge/Test - All Fields?${queryString}`
    )
    expect(res.status).toEqual(400)
  })
})
