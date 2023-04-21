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

# Development