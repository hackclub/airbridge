const yaml = require("js-yaml")
const fs = require("fs")
const path = require("path")
const request = require("supertest")
// const app = require("../../src/index").server

// const publicAuthList = "../../src/v0.2/auth/public.yml"
// const testAllowList = "../../src/v0.2/auth/test.yml"

const authDirectory = path.resolve(__dirname, "../../src/v0.2/auth/")

const cases = fs.readdirSync(path.resolve(__dirname, authDirectory))

describe("auth lists load & are valid yml", () => {
  test.each(cases)("%s loads", (fileName) => {
    const file = fs.readFileSync(
      path.resolve(__dirname, authDirectory, fileName),
      "utf-8"
    )
    expect(file).toBeDefined()
  })

  test.each(cases)("%s is valid YAML", (fileName) => {
    const file = fs.readFileSync(
      path.resolve(__dirname, authDirectory, fileName),
      "utf-8"
    )
    expect(() => yaml.safeLoad(file)).not.toThrow()
  })

  test.each(cases)("%s is valid YAML", (fileName) => {
    const file = fs.readFileSync(
      path.resolve(__dirname, authDirectory, fileName),
      "utf-8"
    )
    expect(() => yaml.safeLoad(file)).not.toThrow()
  })
})
