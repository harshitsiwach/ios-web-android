# Reown AppKit SDK Integration with React Native Expo (iOS)

A comprehensive guide to integrating Reown AppKit into your Expo React Native app, enabling full wallet connectivity, authentication, payments, notifications, smart accounts, and more.

## Overview
Reown AppKit is a modular, cross-chain SDK providing seamless Web3 onboarding, universal wallet connection (430+ wallets), multichain support (EVM, Solana, Bitcoin), social/email login, onramp, in-app swap, notifications, and more. This guide covers end-to-end setup, all main features, hooks, API calls, UI components, and configuration options.

## Table of Contents

1. [Installation](#installation)
2. [Project and Core Setup](#project-and-core-setup)
3. [Polyfills & Native Config](#polyfills--native-config)
4. [Wallet Connection Modal](#wallet-connection-modal)
5. [UI Components](#ui-components)
6. [Hooks API](#hooks-api)
7. [Wagmi Integration](#wagmi-integration)
8. [Ethers/Solana Adapter](#etherssolana-adapter)
9. [Authentication (SIWX, Social, Email)](#authentication-siwx-social-email)
10. [Smart Accounts & Sessions](#smart-accounts--sessions)
11. [Notifications](#notifications)
12. [Payments (Onramp, Swap)](#payments-onramp-swap)
13. [Advanced Configuration](#advanced-configuration)
14. [Troubleshooting and Best Practices](#troubleshooting-and-best-practices)

---

## Installation

```bash
yarn add @reown/appkit-wagmi-react-native wagmi viem @tanstack/react-query
# Native modules for iOS/Expo Prebuild
yarn add @react-native-async-storage/async-storage react-native-get-random-values react-native-svg react-native-modal@14.0.0-rc.1 @react-native-community/netinfo @walletconnect/react-native-compat
npx pod-install
```

### Polyfills
Add necessary polyfills to the top of your entrypoint (App.js/index.js):
```js
import '@walletconnect/react-native-compat';
```

---
## Project and Core Setup

- Sign up at [Reown Dashboard](https://dashboard.reown.com) to get your **Project ID**
- Configure supported chains
- Supply app metadata and config

```js
import { WagmiProvider } from 'wagmi';
import { mainnet, polygon, arbitrum } from '@wagmi/core/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit, defaultWagmiConfig, AppKit } from '@reown/appkit-wagmi-react-native';

const queryClient = new QueryClient();
const projectId = 'YOUR_PROJECT_ID';
const metadata = {
  name: 'AppKit RN',
  description: 'AppKit Example',
  url: 'https://reown.com/appkit',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
  redirect: {
    native: 'YOUR_APP_SCHEME://',
    universal: 'YOUR_APP_UNIVERSAL_LINK.com',
  },
};
const chains = [mainnet, polygon, arbitrum];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });
createAppKit({
  projectId,
  metadata,
  wagmiConfig,
  defaultChain: mainnet, // Optional
  enableAnalytics: true, // Optional
});

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {/* Your content */}
        <AppKit />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

---

## Wallet Connection Modal and UI

**Ready UI components:**
- `<AppKitButton />` â€“ Open the connection modal
- `<AccountButton />` â€“ Shows connected account/profile
- `<ConnectButton />` â€“ UI for connection only
- `<NetworkButton />` â€“ UI for switching/selecting blockchain network

Example:
```js
import { AppKitButton } from '@reown/appkit-wagmi-react-native';
export default function ConnectView() {
  return <AppKitButton />;
}
```

## Enable Wallet Detection (Optional)
- Add wallet schemes in your Info.plist under `LSApplicationQueriesSchemes` for detection and prioritization

## Enable Coinbase Wallet (Optional, Expo Prebuild required)
- Install `@coinbase/wallet-mobile-sdk`, `react-native-mmkv`, and `@reown/appkit-coinbase-wagmi-react-native`

---
## Hooks API

**Modal Control:**
- `useAppKit` â€“ Programmatic control for open/close and modal views: `Connect`, `Account`, `Networks`, `WhatIsAWallet`, `Swap`, `OnRamp`
- `useAppKitState` â€“ Observe modal state (open, selectedNetworkId)
- `useAppKitEvents` â€“ Listen to (and react to) modal events
- `useAppKitEventSubscription` â€“ Subscribe to specific modal events
- `useWalletInfo` â€“ Get connected wallet metadata

**Wagmi (EVM):**
- `useAccount` â€“ Wallet address, status
- `useSignMessage` â€“ Sign arbitrary messages
- `useReadContract` â€“ Call read-only methods on smart contracts

**Typical usage:**
```js
const { open, close } = useAppKit();
const { address, isConnected } = useAccount();
const { walletInfo } = useWalletInfo();
```

---
## Ethers and Solana Adapter Support
- Use ethers or wagmi for EVM; use the Solana adapter for Solana-compatible projects. (Adapters selected at AppKit creation)

## Authentication (SIWX, Social Login, Email, One-click Auth)
- Configure `features` in `createAppKit` for social/email login
- Full SIWX/One-click Auth flows available; see docs for advanced JWT/interoperability

---
## Smart Accounts & Smart Sessions
- Enable programmable accounts with extended UX
- Server-initiated actions (API) for automated flows
- See [Smart Sessions](https://docs.reown.com/appkit/recipes/smart-sessions)

---
## Notifications
- Integrate push and on-chain notifications via Notify API and Web3Inbox
- See Reown Notify client setup for details

---
## Payments (Onramp, Swap)
Both Onramp (fiat-to-crypto) and Swap features are built in.
- Trigger views with modal programmatic open, or by enabling features at creation:
```js
createAppKit({
  ...,
  features: {
    onramp: true, // Fiat crypto purchase (default)
    swaps: true,  // In-app token swapping (default)
  }
});
```
- Example: Trigger On-Ramp Flow:
```js
const { open } = useAppKit();
<Button title="Buy Crypto" onPress={() => open({ view: 'OnRamp' })} />
```

---
## Advanced Configuration
- Customize modal order: `connectMethodsOrder: ['social','email','wallet']`
- Enable legal compliance checkbox: `legalCheckbox: true`
- Add custom adapters for other chain ecosystems (Solana, Ethers, etc)

---
## Troubleshooting and Best Practices
- Ensure all polyfills loaded before imports (walletconnect, netinfo, etc)
- For Expo: use Prebuild (not Expo Go) for full WalletConnect/Coinbase support
- Clean up event subscriptions on unmount
- Use provider state (wagmi/react-query) for optimal UX

---

## Useful Links
- Official Docs: https://docs.reown.com/appkit/
- Supported Features Table: https://docs.reown.com/appkit/features
- Example Apps Repo: https://github.com/reown-com/react-native-examples

---

This readme enables you to deliver a production-grade, feature-rich Web3 onboarding experience on iOS (and Android) via Expo React Native, with all modern wallet, chain, auth, and smart account features.