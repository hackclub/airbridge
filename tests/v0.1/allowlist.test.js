const yaml = require("js-yaml")
const fs = require("fs")
const path = require("path")
const request = require("supertest")
const app = require("../../src/index").server

const allowlistPath = "../../src/v0.1/airtable-info.yml"

describe("load allowlist info", () => {
  it("is in a file", () => {
    const file = fs.readFileSync(path.resolve(__dirname, allowlistPath), "utf8")
    expect(file).toBeDefined()
  })

  it("is a parsable yaml file", () => {
    const data = yaml.safeLoad(
      fs.readFileSync(path.resolve(__dirname, allowlistPath), "utf8")
    )

    expect(data["YOUR_AIRTABLE_NAME"]).toBeDefined()
    expect(data["YOUR_AIRTABLE_NAME"]["baseID"]).toMatch(
      "YOUR_AIRTABLE_BASE_ID"
    )
  })
})

describe("GET allowlisted routes", () => {
  jest.setTimeout(30000)

  const routes = []
  const tables = yaml.safeLoad(
    fs.readFileSync(path.resolve(__dirname, allowlistPath), "utf8")
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
    it(`loads ${endpointBase} with successful status code`, async (done) => {
      const res = await request(app).get(endpoint)
      expect(res.statusCode).toEqual(200)
      done()
    })
  })
})
