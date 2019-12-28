import AirtablePlus from 'airtable-plus'
import whitelist from './whitelist'

export function lookupBaseID(baseID) {
  const lookedUpID = {
    'Operations': 'apptEEFG5HTfGQE7h'
  }[baseID]
  return lookedUpID || baseID
}

export async function airtableLookup(params, auth) {
  let { base, tableName } = params
  let baseID = lookupBaseID(base)

  if (auth) {
    const air = new AirtablePlus({ apiKey: auth, baseID, tableName })
    const results = await air.read()
    return results
  } else {
    const air = new AirtablePlus({ baseID, tableName, complex: true })
    const rawResults = await air.read()
    return await whitelist(base, rawResults)
  }
}