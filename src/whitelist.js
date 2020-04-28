import { lookupBaseID } from './utils'

export const baseInfo = {
  Operations: 'apptEEFG5HTfGQE7h',
  'CCC Newsfeed': 'appQF79M2Gp8cfKR0',
  'hackathons.hackclub.com': 'apptapPDAi0eBaaG1',
  'SDP Priority Activations': 'apple9fiV81JsRytC',
  'Command Center Schedule': 'appGvXhgsuXhCTrOr',
  'Sessions': 'appezi7TOQFt8vTfa',
  'Draw in the dark': 'applcpliMnombEJb9'
}

const whitelistInfo = {
  'SDP Priority Activations': {
    'SDP Priority Activations': [
      'Submission Time',
      'Approved',
      'Rejection Reason',
      'Source type',
      'Mail Mission',
      'Address (city)',
      'Address (state)',
      'Address (zip code)'
    ]
  },
  'CCC Newsfeed': {
    'Items': [
      'Title',
      'Subtitle',
      'Notes',
      'Autonumber',
      'Attachments'
    ]
  },
  'hackathons.hackclub.com': {
    'applications': [
      'name',
      'website',
      'start',
      'end',
      'parsed_city',
      'parsed_state_code',
      'parsed_country',
      'parsed_country_code',
      'hackclub_affiliated',
      'mlh_associated',
      'logo',
      'banner',
      'approved',
      'virtual',
      'id',
      'created_at',
      'lat',
      'lng'
    ]
  },
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
  },
  'Command Center Schedule': {
    Schedule: [
      'Session Name',
      'Leader Name',
      'Time (Eastern)',
      'Date (formatted)',
      'Time (formatted)',
      'Calendar Event',
      'Preview Image'
    ]
  },
  Sessions: {
    Events: [
      'Title',
      'Description',
      'Leader',
      'Start Time',
      'End Time',
      'Avatar',
      'Emoji',
      'AMA',
      'AMA Name',
      'AMA Company',
      'AMA Title',
      'AMA Link',
      'AMA Id',
      'Calendar Link'
    ]
  },
  'Draw in the dark': {
    Deadline: [
      'Time',
      'Preview',
      'Art title',
      'Active'
    ]
  }
}

export function whitelistBaseTable(baseID, tableName) {
  const whitelistedBase = Object.keys(whitelistInfo).find(key => lookupBaseID(key) === lookupBaseID(baseID))
  if (!whitelistedBase) {
    const err = new Error("Not found: base either doesn't exist or isn't publicly accessible")
    err.statusCode = 404
    throw err
  } else {
    console.log('Publicly accessing base', baseID)
  }

  const whitelistedTable = whitelistInfo[whitelistedBase][tableName]
  if (!whitelistedTable) {
    const err = new Error("Not found: table either doesn't exist or isn't publicly accessible")
    err.statusCode = 404
    throw err
  } else {
    console.log('Publicly accessing table', tableName)
  }
  return whitelistedTable
}

export function whitelistRecords(records, whitelistedFields) {
  if (Array.isArray(records)) {
    return records.map(record => whitelistRecords(record, whitelistedFields))
  } else {
    const record = records
    const result = {
      id: record.id,
      fields: {}
    }

    whitelistedFields.forEach(field => result.fields[field] = record.fields[field])
    return result
  }
}
