import fs from "fs"
import path from "path"
import yaml from "js-yaml"
import Airtable from "airtable"
import { sanitizeFormula } from "../shared/formula.js"

const AIRBRIDGE_BASE_ID = "appP3uDe6tFt7cA5r"
const AUTHTOKENS_TABLE = "Authtokens"
let authtokensTable

function getAuthtokensTable() {
  if (!authtokensTable) {
    authtokensTable = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(AIRBRIDGE_BASE_ID)(AUTHTOKENS_TABLE)
  }

  return authtokensTable
}

export async function getPermissions(authId) {
  const authKey = String(authId)
  const filterByFormula = sanitizeFormula(
    `Authtoken=${JSON.stringify(authKey)}`,
    ["Authtoken"]
  )
  const records = await getAuthtokensTable()
    .select({
      maxRecords: 1,
      filterByFormula,
    })
    .all()
  const record = records[0]
  if (!record) {
    return null
  }
  const filename = record.fields["List File Name"]
  const file = fs.readFileSync(
    path.resolve(__dirname, `./auth/${filename}`),
    "utf8"
  )
  const doc = yaml.load(file)
  return doc
}
