<h1 align="center">API2</h1>
<p align="center">
  <a href="https://github.com/hackclub/api2/actions?query=workflow%3Abuild">
    <img alt="build" src="https://github.com/Matt-Gleich/api2/workflows/build/badge.svg">
  </a>
</p>
<p align="center"><i>The bridges tying Hack Club's services together. (WIP) Illustrated below by <a href="https://gh.maxwofford.com">@maxwofford</a>.</i></p>
<p align="center"><img alt="Raft icon" src="https://i.imgur.com/VLgOTmO.png"></a>

## Reasoning

Our [previous API](https://github.com/hackclub/api/blob/master/README.md) was really good at a couple things. It hasn't been touched in years and it's still providing password-less authentication as a service at scale.

Hack Club (HQ & community) needs a service for easily reading & writing information that will last the test of time the same way our original API still handles authentication. API2 will create this by providing a JSON interface to an Airtable backend.

## Try the latest version here: [v0.1](./src/v0.1/README.md)

Version list:

- [v0.1](./src/v0.1/README.md)
- [v0](./src/v0/README.md)

## Developing & Contributing

```sh
# Set it up locally
git clone https://github.com/hackclub/api2 && cd api2
pnpm install

# Run locally with nodemon
pnpm run dev # then, go to localhost:5000/ping in your browser

# Run tests
pnpm test
```
