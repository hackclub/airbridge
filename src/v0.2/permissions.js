import fs from "fs"
import path from "path"
import yaml from "js-yaml"

export async function getPermissions(authId) {
  const sanitizedAuthId = String(authId).replace(/'/g, "\\'")
  const opts = {
    maxRecords: 1,
    filterByFormula: `Authtoken='${sanitizedAuthId}'`,
  }

  const records = await (
    await fetch(
      "https://airbridge.hackclub.com/v0.1/Airbridge/Authtokens?select=" +
        JSON.stringify(opts)
    )
  ).json()
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
