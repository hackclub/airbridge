import fetch from "node-fetch"

// Shared logging middleware to track requests that use filterByFormula
export async function logRequest(req, res, next) {
  let filterByFormula = null

  // Only log if there's actually a filterByFormula being used
  if (req.query.select) {
    try {
      const selectObj = JSON.parse(req.query.select)
      if (selectObj.filterByFormula) {
        filterByFormula = selectObj.filterByFormula
      }
    } catch (err) {
      // Ignore JSON parse errors
    }
  }

  // Only proceed with logging if filterByFormula is present
  if (filterByFormula) {
    try {
      const logData = {
        base: req.params.base || '',
        version: req.baseUrl.replace('/', '') || '', // e.g., "v0.1", "v0.2"
        full_request: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        filterbyformula: filterByFormula
      }

      // Only proceed if we have a valid Airtable API key
      if (!process.env.AIRTABLE_API_KEY) {
        console.log("No AIRTABLE_API_KEY found, skipping logging:", logData)
        return
      }

      // Proper upsert using Airtable REST API
      const response = await fetch('https://api.airtable.com/v0/appP3uDe6tFt7cA5r/Temp%20-%20logged%20requests', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          performUpsert: {
            fieldsToMergeOn: ['base', 'version', 'filterbyformula']
          },
          records: [{
            fields: {
              base: logData.base,
              version: logData.version,
              full_request: logData.full_request,
              filterbyformula: logData.filterbyformula
            }
          }]
        })
      })

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`)
      }

      console.log("Upserted filterByFormula request:", logData)
    } catch (error) {
      // Don't fail the request if logging fails
      console.error("Failed to log request:", error)
    }
  }

  next()
}
