const yaml = require("js-yaml")
const fs = require("fs")
const path = require("path")

const whitelistPath = "../../src/v0.1/airtable-info.yml"

describe("load whitelist info", () => {
  it("is in a file", () => {
    const file = fs.readFileSync(path.resolve(__dirname, whitelistPath), "utf8")
    expect(file).toBeDefined()
  })

  it("is a parsable yaml file", () => {
    const data = yaml.safeLoad(
      fs.readFileSync(path.resolve(__dirname, whitelistPath), "utf8")
    )

    expect(data["YOUR_AIRTABLE_NAME"]).toBeDefined()
    expect(data["YOUR_AIRTABLE_NAME"]["baseID"]).toMatch(
      "YOUR_AIRTABLE_BASE_ID"
    )
  })
})
