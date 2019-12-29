import Airtable from 'airtable'
import { whitelistBaseTable, whitelistRecords } from './whitelist'

export function lookupBaseID(baseID) {
  const lookedUpID = {
    'Operations': 'apptEEFG5HTfGQE7h'
  }[baseID]
  return lookedUpID || baseID
}

export async function airtableLookup(params, auth) {
  let { base, tableName, select = {} } = params
  let baseID = lookupBaseID(base)

  if (auth) {
    const airinst = new Airtable({apiKey: auth}).base(baseID)(tableName)
    const rawResults = await airinst.select(select)
    return rawResults.map(result => ({
      id: result.id,
      field: result.field
    }))
  } else {
    const whitelistedFields = whitelistBaseTable(baseID, tableName, auth)
    const airinst = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(baseID)(tableName)

    const rawResults = await airinst.select({...select, fields: whitelistedFields}).all()

    return whitelistRecords(rawResults, whitelistedFields)
  }
}