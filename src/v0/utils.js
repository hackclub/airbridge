import Airtable from "airtable"
import { allowlistBaseTable, allowlistRecords, baseInfo } from "./allowlist"
import { ensureFormulaSafe } from "../shared/formula.js"

export function lookupBaseID(baseID) {
  const lookedUpID = baseInfo[baseID]
  return lookedUpID || baseID
}

export async function airtableLookup(options, auth) {
  const { base, tableName, select } = options

  if (select?.filterByFormula) {
    ensureFormulaSafe(select.filterByFormula)
  }

  const baseID = lookupBaseID(base)

  if (auth) {
    const airinst = new Airtable({ apiKey: auth }).base(baseID)(tableName)
    const rawResults = await airinst.select(select).all()
    return rawResults.map((result) => ({
      id: result.id,
      fields: result.fields,
    }))
  } else {
    const allowlistedFields = allowlistBaseTable(baseID, tableName, auth)

    let resultFields = []
    if (select && Array.isArray(select.fields)) {
      resultFields = allowlistedFields.filter((f) => select.fields.includes(f))
    } else {
      resultFields = allowlistedFields
    }

    const airinst = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
      baseID
    )(tableName)

    const rawResults = await airinst
      .select({ ...select, fields: resultFields })
      .all()

    return allowlistRecords(rawResults, resultFields)
  }
}
