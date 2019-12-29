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
