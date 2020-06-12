<h1 align="center">V0.1</h1>
<p align="center"><i>The bridges tying Hack Club's services together. Illustrated below.</i></p>
<p align="center"><img alt="Raft icon" src="https://i.imgur.com/VLgOTmO.png"></a>

# Usage

API2 relies on JSON passed in the `select` url param. When I write:

```js
// Operations/Clubs
{
  maxRecords: 1,
  fields: ["Name", "Latitude"]
}
```

you should try this:

```sh
curl https://api2.hackclub.com/v0.1/Operations/Clubs?select={"maxRecords":1,"fields":["Name","Latitude"]}
```

## The allowlist

You can use v0.1 without authentication. Your requests will be filtered through the allowlist found in [this file](./airtable-info.yml). If there are additional Airtable bases or fields you'd like access to, feel free to submit a PR to add them.

If you want to authenticate & get past the allowlist, you'll need an API token from Hack Club staff.