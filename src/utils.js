import Airtable from 'airtable'
import { whitelistBaseTable, whitelistRecords } from './whitelist'

export function lookupBaseID(baseID) {
  const lookedUpID = {
    Operations: 'apptEEFG5HTfGQE7h',
    'CCC Newsfeed': 'appQF79M2Gp8cfKR0',
    'hackathons.hackclub.com': 'apptapPDAi0eBaaG1',
    'SDP Priority Activations': 'apple9fiV81JsRytC',
    'Command Center Schedule': 'appGvXhgsuXhCTrOr',
    'Sessions': 'appezi7TOQFt8vTfa',
    'Draw in the dark': 'applcpliMnombEJb9'
  }[baseID]
  return lookedUpID || baseID
}

export async function airtableLookup(options, auth) {
  const { base, tableName, select } = options
  const baseID = lookupBaseID(base)

  if (auth) {
    const airinst = new Airtable({ apiKey: auth }).base(baseID)(tableName)
    const rawResults = await airinst.select(select).all()
    return rawResults.map(result => ({
      id: result.id,
      fields: result.fields
    }))
  } else {
    const whitelistedFields = whitelistBaseTable(baseID, tableName, auth)

    let resultFields = []
    if (select && Array.isArray(select.fields)) {
      resultFields = whitelistedFields.filter(f => select.fields.includes(f))
    } else {
      resultFields = whitelistedFields
    }

    const airinst = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
      baseID
    )(tableName)

    const rawResults = await airinst
      .select({ ...select, fields: resultFields })
      .all()

    return whitelistRecords(rawResults, resultFields)
  }
}
