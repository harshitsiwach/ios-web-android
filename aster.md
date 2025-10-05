# Aster API — Quick Start for React Native (Expo)

> A compact, copy-paste-ready guide to fetch market data and integrate Aster's REST & WebSocket APIs into an Expo/React Native app.

---

## Table of contents

* Quick facts
* Prerequisites
* Base URLs
* Useful market endpoints (REST)
* WebSocket streams (live data)
* Auth & signed endpoints (HMAC SHA256)
* User data stream (listenKey) flow
* Example: Minimal Expo / React Native code snippets

  * Simple REST helpers (GET price, order book, klines)
  * Signed request example (get balances)
  * WebSocket example (combined streams)
  * User data stream example
* Rate limits & best practices
* Troubleshooting & notes

---

## Quick facts

* Base REST API: `https://fapi.asterdex.com`
* Base WebSocket (market & user streams): `wss://fstream.asterdex.com`
* Signed endpoints (TRADE / USER_DATA) require an `X-MBX-APIKEY` header and an HMAC SHA256 `signature` param.
* Time fields in responses are in **milliseconds**.

---

## Prerequisites

Install / add these to your Expo project (examples use JavaScript):


npm install axios
# For signing (HMAC SHA256) in RN using JS:
npm install crypto-js
```

> `crypto-js` works well in Expo/React Native for producing HMAC-SHA256 signatures.

---

## Base URLs

* REST: `https://fapi.asterdex.com`
* WebSocket: `wss://fstream.asterdex.com`

---

## Useful market endpoints (REST)

* `GET /fapi/v1/ticker/price?symbol=BTCUSDT` — latest price
* `GET /fapi/v1/ticker/24hr?symbol=BTCUSDT` — 24h stats
* `GET /fapi/v1/depth?symbol=BTCUSDT&limit=5` — order book
* `GET /fapi/v1/klines?symbol=BTCUSDT&interval=1m&limit=100` — candles
