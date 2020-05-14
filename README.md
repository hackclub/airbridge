<h1 align="center">API2</h1>
<p align="center"><i>The bridges tying Hack Club's services together. Illustrated below.</i></p>
<p align="center"><img alt="Raft icon" src="https://i.imgur.com/VLgOTmO.png"></a>

## Reasoning

Our [previous API](https://github.com/hackclub/api) was really good at a couple things. It hasn't been touched in years and it's still providing password-less authentication as a service at scale.

Hack Club (HQ & community) needs a service for easily reading & writing information that will last the test of time the same way our original API still handles authentication. API2 will create this by providing a JSON interface to an Airtable backend.

## Use it in your browser

**Basic calls**
```sh
# Ensure you can connect
curl https://api2.hackclub.com/ping
# returns "pong!"

# Get all records in a table
curl https://api2.hackclub.com/v0/Operations/Badges
# returns JSON array of records from 'Badges' table in 'Operations' base

# Planned for future release:
# Get specific record from a table
curl https://api2.hackclub.com/v0/Operations/Badges/rec9j291j3k928
# returns JSON object from airtable
```

**Authorization**
```sh
# Getting a protected route w/o using an auth token
curl https://api2.hackclub.com/v0/Operations/Addresses # or some other sensative data
# "ERROR: Tried to access table that is not in the whitelist."

# Lend your own Airtable API keys to get past the whitelist
curl -H "Authorization: Bearer VALID_AIRTABLE_KEY" https://api2.hackclub.com/v0/Operations/Addresses
# returns JSON array of non-whitelisted records from airtable
```

**Filtering, searching**
```sh
# The "select" URL param can be used to pass arguments into Airtable's API. A list of optional parameters are show below with examples

# Get only 1 record
curl https://api2.hackclub.com/v0/Operations/Badges?select={"maxResults":1}

# Get all badges, sorted by the number of people who have earned them
curl https://api2.hackclub.com/v0/Operations/Badges?select={"sort":[{"field":"People Count","direction":"desc"}]}

# You can combine arguments too. Here we'll sort badges by the number of people
# and select the single record at the top of the list to get the badge with the
# most users
curl https://api2.hackclub.com/v0/Operations/Badges?select={"sort":[{"field":"People Count","direction":"desc"}],"maxResults":1}

# You can select specific fields to return to speed up queries/only see the data you want:
curl https://api2.hackclub.com/v0/Operations/Badges?select={"fields":["Name"]}
```

## Developing & Contributing

```sh
git clone https://github.com/hackclub/api2
cd api2/
pnpm install

# Run locally with nodemon
pnpm run dev
# Run tests
pnpm test
```

### Development tools

```sh
# The `meta` url param will return a JSON object with metadata about the request you've just made
curl http://localhost:5000/v0/Operations/Clubs/?meta=true
# returns the following:
{
    result: [...], # Array of badges from Airtable
    meta: {
        duration: 241, # Time in ms to complete request
        query: {...}, # List of URL query params parsed by the server
        params: {...}, # List of URL params parsed by the server
    }
}
```

