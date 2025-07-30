if (!process.env.AIRTABLE_API_KEY) {
  throw new Error("Missing AIRTABLE_API_KEY from environmental variables")
}

import { bugsnagErrorHandler, bugsnagRequestHandler } from "./bugsnag"
import express from "express"
import cors from "cors"

const app = express()
app.use(bugsnagRequestHandler)
app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.redirect(302, "https://github.com/hackclub/airbridge")
})

app.get("/ping", (req, res) => {
  res.status(200).json({ message: "pong!" })
})

import routerV0 from "./v0"
import routerV0_1 from "./v0.1"
import routerV0_2 from "./v0.2"
app.use("/v0", routerV0)
app.use("/v0.1", routerV0_1)
app.use("/v0.2", routerV0_2)

app.use(bugsnagErrorHandler)

// Export the app for testing
export { app }

// Only start the server if this file is run directly (not imported)
let server
if (import.meta.main) {
  server = app.listen(process.env.PORT || 0, () =>
    console.log(`Up and listening on ${server.address().port}`)
  )
}

export { server }
