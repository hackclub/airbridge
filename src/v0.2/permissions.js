import Airtable from "airtable"
import fs from "fs"
import path from "path"
import yaml from "js-yaml"

const AIRBRIDGE_BASE_ID = "appP3uDe6tFt7cA5r"

export async function getPermissions(authId) {
  const sanitizedAuthId = String(authId).replace(/'/g, "\\'")

  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    AIRBRIDGE_BASE_ID
  )
  const records = await base("Authtokens")
    .select({
      maxRecords: 1,
      filterByFormula: `Authtoken='${sanitizedAuthId}'`,
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
