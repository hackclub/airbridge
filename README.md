<h1 align="center">Airbridge</h1>


<p align="center"><i>The bridges tying Hack Club's services together. (WIP) Illustrated below by <a href="https://gh.maxwofford.com">@maxwofford</a>.</i></p>
<p align="center"><img alt="Raft icon" src="https://cloud-gxlnkdt57.vercel.app/0untitled.png"></a>


[![test](https://github.com/hackclub/airbridge/actions/workflows/test.yml/badge.svg)](https://github.com/hackclub/airbridge/actions/workflows/test.yml)

[![format](https://github.com/hackclub/airbridge/actions/workflows/format.yml/badge.svg)](https://github.com/hackclub/airbridge/actions/workflows/format.yml)

## Reasoning

Our [previous API](https://github.com/hackclub/api/blob/master/README.md) was really good at a couple things. It hasn't been touched in years and it's still providing password-less authentication as a service at scale.

Hack Club (HQ & community) needs a service for easily reading & writing information that will last the test of time the same way our original API still handles authentication. Airbridge will create this by providing a JSON interface to an Airtable backend.

## Try the latest version here: [v0.1](./src/v0.1/README.md)

Version list:

- [v0.2 (in development)](./src/v0.2/README.md)
- [v0.1](./src/v0.1/README.md)
- [v0](./src/v0/README.md)

## Developing & Contributing
> The Airtable PAT (Personal Access Token) is under logins+dinobox@hackclub.com airtable account.

```sh
# Set it up locally
git clone https://github.com/hackclub/airbridge && cd airbridge
yarn

# Run locally with nodemon
yarn dev # then, go to localhost:5000/ping in your browser

# Run tests
yarn test

# Run specific tests
yarn test tests/v0/routes.test.js # (your choice of testfile here)
```
