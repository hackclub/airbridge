![](api2.jpg)

**Examples**

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