import { airtableLookup as airtableLookupV0_1 } from "../v0.1/utils.js"
import { baseInfo } from "./allowlist"

export function lookupBaseID(baseID) {
  const lookedUpID = baseInfo[baseID]
  return lookedUpID || baseID
}

// Unauthenticated reads go through v0.1's allowlist so the two versions can't
// drift; v0's legacy base names are only resolved for authenticated requests.
export async function airtableLookup(options, auth) {
  return airtableLookupV0_1(
    auth ? { ...options, base: lookupBaseID(options.base) } : options,
    auth,
  )
}
