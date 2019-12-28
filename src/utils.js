import AirtablePlus from 'airtable-plus'
import whitelist from './whitelist'

export function lookupBaseID(baseID) {
  const lookedUpID = {
    'Operations': 'apptEEFG5HTfGQE7h'
  }[baseID]
  return lookedUpID || baseID
}

export async function airtableLookup(reqParams) {
  let { base, tableName, recordID } = reqParams
  let baseID = lookupBaseID(base)

  const air = new AirtablePlus({ baseID, tableName, complex: true })
  const rawResults = await air.read()
  return await whitelist(base, rawResults)
}