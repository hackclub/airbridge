import { lookupBaseID } from './utils'

const whitelistInfo = {
  'Operations': {
    'Clubs': [
      'Name',
      'Slack Channel ID',
      'Leader Slack IDs',
      'Address City',
      'Address State',
      'Address Postal Code',
      'Address Country',
      'Club URL',
      'Latitude',
      'Longitude',
    ],
    'Badges': [
      'ID',
      'Name',
      'Emoji Tag',
      'Icon',
      'People Slack IDs'
    ]
  }
}

export default async function whitelist(base, recordArray) {
  if (recordArray.length === 0) { 
    return []
  }
  const baseID = recordArray[0]._table._base.id
  const baseName = Object.keys(whitelistInfo).find(key => base === key) 
  if (!baseName) {
    throw 'Tried to access a base that is not in the whitelist. If you think this info should be public, ask staff to add this base to the whitelist.'
  }
  const tableName = recordArray[0]._table.name
  if (!whitelistInfo[baseName][tableName]) {
    throw 'Tried to access table that is not in the whitelist. If you think this info should be public, ask staff to add this table to the whitelist.'
  }

  const whitelistFields = whitelistInfo[baseName][tableName]
  return recordArray.map(record => whitelistRecord(record, whitelistFields))
}

function whitelistRecord(record, whitelistFields) {
  const result = {
    id: record.id,
    fields: {}
  }
  whitelistFields.forEach(field => {
    result.fields[field] = record.fields[field]
  })
  return result
}