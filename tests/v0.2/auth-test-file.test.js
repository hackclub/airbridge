const yaml = require("js-yaml")
const fs = require("fs")
const path = require("path")
const request = require("supertest")
const app = require("../../src/index").server

const authDirectory = "../../src/v0.2/auth/"
const testFile = "test.yml"
const TEST_AUTHKEY = 'recx3vr3ziWHPc3K0161186195268u9j3l4z9e'

describe("test auth file", () => {
  it("is in a file", () => {
    const file = fs.readFileSync(path.resolve(__dirname, authDirectory, testFile), "utf8")
    expect(file).toBeDefined()
  })

  it("is a parsable yaml file", () => {
    const data = yaml.safeLoad(
      fs.readFileSync(path.resolve(__dirname, authDirectory, testFile), "utf8")
    )

    expect(data["Airbridge"]).toBeDefined()
    expect(data["Airbridge"]["baseID"]).toBeDefined()
    expect(data["Airbridge"]["baseID"]).toMatch("appP3uDe6tFt7cA5r")
  })
})

// describe("unauthenticated GET v0.2/Airbridge/Tests", () => {
//   it("returns not found", async () => {
//     const res = await request(app).get("/v0.2/Airbridge/Tests")
//     expect(res.statusCode).toEqual(404)
//   })
// })

describe("GET v0.2/Airbridge/Test - All Fields", () => {
  it("provides access to all fields", async () => {
    const res = await request(app).get("/v0.2/Airbridge/Test - All Fields?authKey="+TEST_AUTHKEY)
    expect(res.statusCode).toEqual(200)
    expect(res.body).toBeDefined()
    expect(Array.isArray(res.body)).toEqual(true)
    expect(res.body[0].fields['Name']).toBeDefined()
    expect(res.body[0].fields['Notes']).toBeDefined()
    expect(res.body[0].fields['Attachments']).toBeDefined()
  })
})

describe("GET v0.2/Airbridge/Test - Record ID Only", () => {
  it("provides access to some fields", async () => {
    const res = await request(app).get("/v0.2/Airbridge/Test - Record ID Only?authKey="+TEST_AUTHKEY)
    expect(res.statusCode).toEqual(200)
    expect(res.body).toBeDefined()
    expect(Array.isArray(res.body)).toEqual(true)
    expect(res.body[0].id).toBeDefined()
    expect(res.body[0].fields['This field should not be visible']).not.toBeDefined()
  })
})

describe("GET v0.2/Airbridge/Test - Some Fields", () => {
  it("provides access to RECORD IDs", async () => {
    const res = await request(app).get("/v0.2/Airbridge/Test - Some Fields?authKey="+TEST_AUTHKEY)
    expect(res.statusCode).toEqual(200)
    expect(res.body).toBeDefined()
    expect(Array.isArray(res.body)).toEqual(true)
    expect(res.body[0].id).toBeDefined()
    expect(res.body[0].fields['You should have access to this field']).toBeDefined()
    expect(res.body[0].fields['You should not have access to this field']).not.toBeDefined()
  })
})