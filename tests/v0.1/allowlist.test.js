import { test, describe, beforeAll, afterAll, expect } from "bun:test"
import yaml from "js-yaml"
import fs from "fs"
import path from "path"
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

const allowlistPath = "../../src/v0.1/airtable-info.yml"

describe("load allowlist info (basic)", () => {
  test("is in a file", () => {
    const file = fs.readFileSync(path.resolve(import.meta.dir, allowlistPath), "utf8")
    expect(file).toBeDefined()
  })

  test("is a parsable yaml file", () => {
    const data = yaml.load(
      fs.readFileSync(path.resolve(import.meta.dir, allowlistPath), "utf8")
    )

    expect(data["YOUR_AIRTABLE_NAME"]).toBeDefined()
    expect(data["YOUR_AIRTABLE_NAME"]["baseID"]).toMatch(
      "YOUR_AIRTABLE_BASE_ID"
    )
  })
})

describe("GET allowlisted routes (production)", () => {
  const routes = []
  const tables = yaml.load(
    fs.readFileSync(path.resolve(import.meta.dir, allowlistPath), "utf8")
  )
  Object.keys(tables).forEach((tableN) => {
    const bases = tables[tableN]
    Object.keys(bases).forEach((baseN) => {
      if (tableN != "YOUR_AIRTABLE_NAME" && baseN != "baseID") {
        routes.push({ base: baseN, table: tableN })
      }
    })
  })

  routes.forEach((route) => {
    const endpointBase = `/v0.1/${route.table}/${route.base}`
    const options = { maxRecords: 1 }
    const endpoint = `${endpointBase}?meta=true&select=${JSON.stringify(
      options
    )}`
    test(`loads ${endpointBase} with successful status code`, async () => {
      const port = server.address().port
      const res = await fetch(`http://localhost:${port}${endpoint}`)
      expect(res.status).toEqual(200)
    }, 30000) // 30 second timeout for these production tests
  })
})

// Server is managed in test runner
