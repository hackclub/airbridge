<h1 align="center">V0.2</h1>
<p align="center"><i>The bridges tying Hack Club's services together. Illustrated below.</i></p>
<p align="center"><img alt="Raft icon" src="https://cloud-pevdu117q-hack-club-bot.vercel.app/0VLgOTmO.png"></a>

# What's new?

**tl;dr this is update with scoped access and special Airbridge API tokens**

V0.2 brings in the concept of [auth files](./auth). You can check out a [starter template](./auth/template.yml) if you want to write your own.

Authenticated vs unauthenticated requests are simplified now. If you don't authenticate your request, you'll automatically be authenticated to the [public auth file](./auth/public.yml). If you need access to fields or tables that shouldn't be publicly viewable, you can make your own auth file. You'll then be given an `Airbridge API Key` by a staff member (please ping us so we get back to you quickly!) you can use to access the private data listed in your auth file.

Is there a field you want access to & are fine with other people seeing it? Add it to the [public auth file](./auth/public.yml) so you can pull the data from Airbridge without having to use any API keys.

There's also a new route for looking up specific records: `https://airbrige.hackclub.com/v0.2/BASE/TABLE/RECORD_ID`.

Oh, last but not least, new name! `api2` -> `airbridge`. Your old services will still work; old requests to api2.hackclub.com will be redirected to airbridge.hackclub.com.

# Usage

Airbridge relies on JSON passed in the `select` url param. When I write:

```js
// Operations/Clubs
{
  maxRecords: 1,
  fields: ["Name", "Latitude"]
}
```

you should try this:

<details>
<summary>Browser example</summary>

```js
fetch('https://api2.hackclub.com/v0.2/Operations/Clubs?select={"maxRecords":1,"fields":["Name","Latitude"]}').then(res => console.log(res))
```
</details>
<details>
<summary>Terminal example</summary>

```sh
curl 'https://api2.hackclub.com/v0.2/Operations/Clubs?select={"maxRecords":1,"fields":["Name","Latitude"]}'
```
</details>

# PATCH (Update / Upsert)

PATCH requests let you update existing records or upsert (update-or-create) based on a merge field.

Your auth file needs a `patch` key under the table (similar to `get` and `post`):

```yaml
Your Base:
  baseID: appXXXXXXXXXXXXX
  Your Table:
    patch:
      - Email
      - Name
```

### Update by record ID

Include `id` in each record in the request body:

```sh
curl -X PATCH 'https://airbridge.hackclub.com/v0.2/Your%20Base/Your%20Table?authKey=YOUR_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"id": "recXXXXXXXXXXXXX", "Name": "Updated Name"}'
```

### Upsert with `fieldsToMergeOn`

Pass `fieldsToMergeOn` as a query param. If a record matching that field exists it gets updated; otherwise a new record is created. No `id` needed.

```sh
curl -X PATCH 'https://airbridge.hackclub.com/v0.2/Your%20Base/Your%20Table?authKey=YOUR_KEY&fieldsToMergeOn=Email' \
  -H 'Content-Type: application/json' \
  -d '{"Email": "max@example.com", "Name": "Max"}'
```

Both modes accept a single object or an array of objects. You can merge on multiple fields with a comma: `fieldsToMergeOn=Email,YSWS`.

# Development