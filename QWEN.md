# Glass App - Expo Multi-Platform Application

## Project Overview

This is a cross-platform mobile application built with Expo (React Native) that targets iOS, Android, and web platforms. The app integrates with financial and prediction market data sources, specifically:

1. **Polymarket** - Prediction market platform for real-world events
2. **Hyperliquid** - Decentralized exchange for perpetual futures and spot trading

The app uses a tab-based navigation system with the following sections:
- Home
- Polymarket (prediction markets)
- Hyperliquid (crypto trading)
- News
- Search

The application features a theme system with light and dark modes, and uses modern React Native patterns with TypeScript.

## Key Technologies

- **Expo** - Framework for building universal applications
- **React Native** - Cross-platform mobile development
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation library
- **Supabase** - Backend-as-a-Service for authentication and database
- **TanStack Query** - Server state management
- **Viem** - Ethereum development library
- **Hyperliquid SDK** - Crypto trading data integration
- **Reown (WalletConnect)** - Wallet connection functionality

## Project Structure

```
app/                    # File-based routing with Expo Router
  (tabs)/               # Tab-based navigation screens
    _layout.tsx         # Tab navigation layout
    index.tsx           # Home screen
    polymarket.tsx      # Prediction market data
    hyperliquid.tsx     # Crypto trading data
    news.tsx            # News feed
    search.tsx          # Search functionality
components/             # Reusable UI components
constants/              # Application constants (themes, etc.)
contexts/               # React context providers (Theme)
hooks/                  # Custom React hooks
lib/                    # Utility functions and helpers
assets/                 # Images, fonts, and other static assets
```

## Building and Running

### Prerequisites
- Node.js (LTS version recommended)
- npm or yarn package manager
- Expo CLI (installed globally)

### Installation
```bash
npm install
```

### Development
```bash
# Start the development server
npx expo start

# Start for specific platforms
npx expo start --ios
npx expo start --android
npx expo start --web
```

### Building
```bash
# Build for development
npm run android
npm run ios
npm run web

# Create production builds
npx expo build
```

### Testing
```bash
# Run linting
npm run lint
```

## Development Conventions

### Code Style
- TypeScript for type safety
- Functional components with hooks
- Context API for state management
- File-based routing with Expo Router

### Theming
- Light and dark theme support
- Theme context provider in `contexts/ThemeContext.tsx`
- Color constants defined in `constants/theme.ts`

### Platform-Specific Code
- Uses platform-specific file extensions (.ios.tsx, .android.tsx, .web.tsx)
- Native components where appropriate

## API Integrations

### Polymarket
- Fetches prediction market data from Gamma API
- Displays trending markets with questions, outcomes, and prices
- Shows market volume, liquidity, and end dates

### Hyperliquid
- Uses Hyperliquid SDK for crypto market data
- Displays perpetual futures information
- Shows prices, funding rates, open interest, and 24h volume
- Requires polyfills for React Native compatibility

## Wallet Integration

The app includes wallet integration using Reown (WalletConnect) with support for multiple chains:
- Ethereum
- Polygon (for Polymarket)
- Arbitrum (for Hyperliquid)
- Base
- Optimism

## Key Files

- `app.json` - Expo configuration
- `package.json` - Dependencies and scripts
- `app/(tabs)/_layout.tsx` - Tab navigation
- `contexts/ThemeContext.tsx` - Theme management
- `constants/theme.ts` - Color definitions
- `hyperliquiddocs.md` - Hyperliquid integration guide
- `POLYMARKET_INTEGRATION_SUMMARY.md` - Polymarket implementation details

## Future Enhancements

Based on documentation, planned features include:
- Filtering and search functionality for markets
- Detailed market statistics and charts
- Trading simulation capabilities
- Portfolio tracking
- Notification system for market changes

## Qwen Added Memories
- mainmemo
- added dark and light theme to it
- erro search
