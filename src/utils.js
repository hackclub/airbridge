import Airtable from 'airtable'
import { whitelistBaseTable, whitelistRecords } from './whitelist'

export function lookupBaseID(baseID) {
  const lookedUpID = {
    'Operations': 'apptEEFG5HTfGQE7h',
    'hackathons.hackclub.com': 'apptapPDAi0eBaaG1',
    'SDP Priority Activations': 'apple9fiV81JsRytC'
  }[baseID]
  return lookedUpID || baseID
}

export async function airtableLookup(options, auth) {
  const { base, tableName, select } = options
  const baseID = lookupBaseID(base)

  if (auth) {
    const airinst = new Airtable({apiKey: auth}).base(baseID)(tableName)
    const rawResults = await airinst.select(select).all()
    return rawResults.map(result => ({
      id: result.id,
      fields: result.fields
    }))
  } else {
    const whitelistedFields = whitelistBaseTable(baseID, tableName, auth)
    const airinst = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(baseID)(tableName)

    const rawResults = await airinst.select({...select, fields: whitelistedFields}).all()

    return whitelistRecords(rawResults, whitelistedFields)
  }
}
