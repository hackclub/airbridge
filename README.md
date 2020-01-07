![](api2.jpg)

**Basic calls**
```sh
# Ensure you can connect
curl https://api2.hackclub.com/ping
# returns "pong!"

# Get all records in a table
curl https://api2.hackclub.com/v0/Operations/Badges
# returns JSON array of records from 'Badges' table in 'Operations' base

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
curl https://api2.hackclub.com/v0/Operations/Badges?select={"sort":[{field:"People Count",direction:"desc"}]}

# You can combine arguments too. Here we'll sort badges by the number of people
# and select the single record at the top of the list to get the badge with the
# most users
curl https://api2.hackclub.com/v0/Operations/Badges?select={"sort":[{field:"People Count",direction:"desc"}],"maxResults":1}
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

