const { airtableLookup } = require('../utils.js')

module.exports = async (req, res) => {
  const opts = {
    start: Date.now(),
    showMeta: req.query.meta || req.query.meat,
    authKey: req.query.authKey || process.env.AIRTABLE_API_KEY,
    query: req.query
  }
  if (req.query.authKey) opts.query.authKey = '[redacted]'

  if (req.method === 'POST') {
    res.status(501).json({ error: 'Posting in not yet implemented' })
  } else {
    const { base, tableName } = req.query
    if (req.query.select) {
      try {
        console.log(JSON.parse(req.query.select))
        opts.select = JSON.parse(req.query.select)
      } catch (error) {
        res.status(501).json({ error: error.message })
      }
    }

    try {
      const response = await airtableLookup(opts)

      if (opts.showMeta) {
        if (Array.isArray(response)) {
          opts.query.resultCount = response.length
        } else {
          opts.query.resultCount = 1
        }
        res.json({ response, meta: opts.query })
      } else {
        res.json(response)
      }
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message })
    }
  }
}
