https://docs.asterdex.com/product/aster-perpetual-pro/api/api-documentation#test-connectivity this is the documentation. I want to test the trading using the API. How do i do that?

You can test trading on Aster using their Perpetual Pro API by executing real trades via authenticated and signed API calls—there’s no dedicated testnet, so all tests work with live mainnet liquidity and require actual trading permissions and small real/funded balances. Here’s a clear, step-by-step workflow:

1. Get an API Key
Register/login on the Aster DEX platform.

Navigate to “API Management” and create a new API key with trade permissions.

Note the API Key and Secret Key—these are case-sensitive and needed for signing requests.

2. Prepare REST API Calls
The REST API base URL:

text
https://fapi.asterdex.com
For each trading request (e.g., place an order), you’ll POST to the /fapi/v1/order endpoint with your chosen trade parameters.

3. Format and Sign Requests
Aster uses HMAC-SHA256 signatures for all trading (“TRADE”) and private (“USER_DATA”) endpoints.

For a new order (POST /fapi/v1/order), construct a query string of all parameters:

Example:

text
symbol=BTCUSDT
side=BUY
type=LIMIT
quantity=1
price=9000
timeInForce=GTC
recvWindow=5000
timestamp=<current_epoch_ms>
Generate the signature with the secret key:

bash
echo -n "symbol=BTCUSDT&side=BUY&type=LIMIT&quantity=1&price=9000&timeInForce=GTC&recvWindow=5000&timestamp=1591702613943" | openssl dgst -sha256 -hmac "<your_secret_key>"
Attach this signature as signature=<signature> to your query string or request body.

4. Send the Authenticated Request
Add a header:

text
X-MBX-APIKEY: <your_api_key>
Send the POST request with all required parameters and the signature:

bash
curl -H "X-MBX-APIKEY: <your_api_key>" -X POST 'https://fapi.asterdex.com/fapi/v1/order?symbol=BTCUSDT&side=BUY&type=LIMIT&quantity=1&price=9000&timeInForce=GTC&recvWindow=5000&timestamp=1591702613943&signature=<signature>'
Alternatively, POST with application/x-www-form-urlencoded data.

5. Validate Successful Trading and Handle Errors
The response will include the order status and identifiers. If your parameters violate exchange rules, an error payload (with code and msg) will be returned.

Always check

Rate limits in response headers (X-MBX-USED-WEIGHT-1m, X-MBX-ORDER-COUNT-1m).

IP ban (418) or rate limit (429) errors—back off if received.

6. Testing Safely
Use the minimum quantity and value allowed by the exchange for real trading tests.

You are operating in live mode, so all trades are real—fund your wallet accordingly and monitor risk.

Cancel orders and manage open positions using appropriate API calls if needed.

Example Order Code (Node.js, TypeScript)

import axios from 'axios';
import crypto from 'crypto';

const apiKey = 'YOUR_API_KEY';
const apiSecret = 'YOUR_SECRET_KEY';
const REST_URL = 'https://fapi.asterdex.com';

function sign(query: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(query).digest('hex');
}
const params =
  'symbol=BTCUSDT&side=BUY&type=LIMIT&quantity=1&price=9000&timeInForce=GTC&recvWindow=5000&timestamp=' +
  Date.now();
const signature = sign(params, apiSecret);

axios
  .post(`${REST_URL}/fapi/v1/order?${params}&signature=${signature}`, null, {
    headers: { 'X-MBX-APIKEY': apiKey },
  })
  .then(res => console.log(res.data))
  .catch(err => console.error(err.response?.data));

Resources for Endpoint Reference
Aster Perpetual Pro API documentation & endpoints

API key, signature, error response, and trading rules examples

In summary:
Register for an API key, fund your wallet, use the HMAC-SHA256 signing method as shown, and POST live orders using minimized (safe) sizes. There is no testnet—so tests are on live liquidity with actual funds at risk.



Switching network from with in the app:

With Reown AppKit in a React Native app, network switching can be handled within the app programmatically using their hooks and network management functions, without requiring manual network selection via MetaMask for most use cases.

Switching Networks Within the App
Reown AppKit provides a useAppKitNetwork hook with a switchNetwork function that allows switching between chains directly in your app logic. By maintaining a network mapping for each tab, you can call switchNetwork when the user changes tabs, so the wallet context aligns automatically. This enables seamless transitions between EVM, Solana, and other supported networks as you design.

MetaMask Interaction and Exceptions
For most desktop integrations, network switching can happen programmatically (the wallet may prompt for permission depending on user settings). On mobile wallets (like MetaMask Mobile via WalletConnect), there are limitations:

If the target network is not added/enabled in MetaMask Mobile, users may have to manually add or switch the network inside MetaMask, as some wallets do not expose network change prompts to WalletConnect or Dapp connections on mobile.

If a transaction is attempted on a network not shown in the wallet UI, the wallet may default to the network currently selected, leading to mismatches and failed transactions.

Advanced Options and Multi-Chain Config
Reown AppKit supports dynamic addition or removal of networks and chain adapters, though APIs for these features may not be officially documented yet and you may have to use experimental context provider features for advanced multi-chain setups

Method	Programmatic Network Switch	User Has To Open MetaMask	Supported Chains
switchNetwork (AppKit hook)	Yes, for most desktop flows	Sometimes for mobile	EVM, Solana, Bitcoin, Polkadot, etc. 
WalletConnect + MetaMask Mobile	Limited, may fail	Yes, if network not added	EVM, limited multi-chain 
For best UX, code tab-selection handlers to use the AppKit hooks for switching networks and check mobile wallet state, with fallback instructions if manual switching is required in specific scenarios.

