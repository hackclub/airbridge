import Airtable from "airtable"
import friendlyWords from "friendly-words"
import fetch from "isomorphic-unfetch"
import yaml from "js-yaml"
import path from "path"
import fs from "fs"

const whitelist = (() => {
  try {
    const doc = yaml.safeLoad(
      fs.readFileSync(path.resolve(__dirname, "./airtable-info.yml"), "utf8")
    )
    return doc
  } catch (e) {
    console.error(e)
  }
})()

function lookupBaseID(name) {
  return whitelist[name]?.baseID || name
}

function lookupBase(id) {
  return Object.values(whitelist).find(e => e.baseID == id) || {}
}

function whitelistBaseTable(baseID, tableName) {
  const baseInWhitelist = lookupBase(baseID)
  if (!baseInWhitelist) {
    const err = new Error(
      "Not found: base either doesn't exist or isn't publicly accessible"
    )
    err.statusCode = 404
    throw err
  } else {
    console.log("Publicly accessing base", baseID)
  }

  const tableInWhitelist = baseInWhitelist[tableName]
  if (!tableInWhitelist) {
    const err = new Error(
      "Not found: table either doesn't exist or isn't publicly accessible"
    )
    err.statusCode = 404
    throw err
  } else {
    console.log("Publicly accessing table", tableName)
  }
  return tableInWhitelist
}

function whitelistedRecords(records, whitelistedFields) {
  if (Array.isArray(records)) {
    return records.map(r => whitelistedRecords(r, whitelistedFields))
  } else {
    const record = records
    const result = {
      id: record.id,
      fields: {},
    }

    whitelistedFields.forEach(
      (field) => (result.fields[field] = record.fields[field])
    )
    return result
  }
}

export async function airtableLookup(options, auth) {
  const { base, tableName, select } = options
  const baseID = lookupBaseID(base)

  if (auth) {
    const airinst = new Airtable({ apiKey: auth }).base(baseID)(tableName)
    const rawResults = await airinst.select(select).all()
    return rawResults.map((result) => ({
      id: result.id,
      fields: result.fields,
    }))
  } else {
    const whitelistedFields = whitelistBaseTable(baseID, tableName, auth)

    let resultFields = []
    if (select && Array.isArray(select.fields)) {
      resultFields = whitelistedFields.filter((f) => select.fields.includes(f))
    } else {
      resultFields = whitelistedFields
    }

    const airinst = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
      baseID
    )(tableName)

    const rawResults = await airinst
      .select({ ...select, fields: resultFields })
      .all()

    return whitelistedRecords(rawResults, resultFields)
  }
}

export async function airtableCreate(options, auth) {
  const { base, tableName, fields } = options
  const baseID = lookupBaseID(base)

  return new Promise((resolve, reject) => {
    const airinst = new Airtable({ apiKey: auth }).base(baseID)(tableName)
    airinst.create(fields, (err, records) => {
      if (err) {
        console.error(err)
        reject(err)
      }
      resolve(records)
    })
  })
}

function randomName() {
  const { predicates, objects } = friendlyWords
  const predicate = predicates[predicates.length * Math.random() - 1]
  const object = objects[objects.length * Math.random() - 1]

  return `${predicate}-${object}`
}

export async function fileToTempURL(blob, name = randomName()) {
  const formData = new FormData()
  formData.append("input_file", blob, name)
  formData.append("max_views", 0)
  formData.append("max_minutes", 1)
  formData.append("upl", "Upload")

  const response = await fetch(
    "https://cors-anywhere.herokuapp.com/https://tmpfiles.org/?upload",
    {
      method: "POST",
      mode: "cors",
      body: formData,
    }
  )

  if (response.headers) {
    return res.headers.get("X-Final-Url").replace("download", "dl")
  } else {
    throw "Unable to create file"
  }
}
