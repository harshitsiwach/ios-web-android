# Hyperliquid SDK Integration with React Native Expo

A comprehensive guide to integrating Hyperliquid's trading data and APIs into your React Native Expo application.

## Overview

Hyperliquid is a high-performance decentralized exchange (DEX) built on its own Layer 1 blockchain, specializing in perpetual futures and spot trading. This guide covers how to integrate their TypeScript SDK into your Expo app to display real-time trading data, market information, and user analytics.

## Table of Contents

1. [Installation](#installation)
2. [Required Polyfills for React Native](#required-polyfills-for-react-native)
3. [Basic Setup](#basic-setup)
4. [Available Data Types](#available-data-types)
5. [Info API Methods](#info-api-methods)
6. [WebSocket Subscriptions](#websocket-subscriptions)
7. [Implementation Examples](#implementation-examples)
8. [Rate Limits and Best Practices](#rate-limits-and-best-practices)
9. [Troubleshooting](#troubleshooting)

## Installation

Install the Hyperliquid SDK and required polyfills:

```bash
# Install the main SDK
npm install hyperliquid

# Install required polyfills for React Native
npm install react-native-url-polyfill
npm install react-native-get-random-values
npm install text-encoding
npm install base-64
```

## Required Polyfills for React Native

React Native lacks some web APIs that the Hyperliquid SDK requires. Add these polyfills to your app's entry point (`App.js` or `index.js`):

```javascript
// Add these imports at the very top of your entry file
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import { TextEncoder, TextDecoder } from 'text-encoding';
import { encode, decode } from 'base-64';

// Polyfill global objects
if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}
if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder;
}
if (!global.btoa) {
  global.btoa = encode;
}
if (!global.atob) {
  global.atob = decode;
}
```

## Basic Setup

Initialize the Hyperliquid SDK in your React Native component:

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { Hyperliquid } from 'hyperliquid';

const HyperliquidApp = () => {
  const [sdk, setSdk] = useState(null);
  const [marketData, setMarketData] = useState({});
  
  useEffect(() => {
    // Initialize SDK without WebSocket for simple data fetching
    const hyperliquidSDK = new Hyperliquid({ 
      enableWs: false // Set to true if you need real-time WebSocket data
    });
    setSdk(hyperliquidSDK);
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
        Hyperliquid Market Data
      </Text>
      {/* Your UI components here */}
    </View>
  );
};

export default HyperliquidApp;
```

## Available Data Types

### Market Data You Can Display

1. **Real-time Prices** - Current mid prices for all trading pairs
2. **Order Books** - Level 2 order book data with bid/ask levels
3. **Trading Volume** - 24-hour volume and trading statistics
4. **Perpetuals Data** - Funding rates, open interest, mark prices
5. **Spot Token Information** - Token metadata, balances, trading pairs
6. **Candle Data** - OHLCV data for price charts
7. **User Data** - Trading history, positions, balances (requires user address)
8. **Market Statistics** - Asset contexts including price changes, volume

### Supported Assets

- **Perpetuals**: BTC-PERP, ETH-PERP, SOL-PERP, and 100+ other perpetual contracts
- **Spot Trading**: PURR/USDC, HYPE/USDC, and other HIP-1 tokens
- **Leverage**: Up to 50x on perpetuals, depending on the asset

## Info API Methods

### General Market Information

#### Get All Market Prices
```javascript
const fetchAllPrices = async () => {
  try {
    const allMids = await sdk.info.getAllMids();
    console.log('All market prices:', allMids);
    // Returns: { "BTC": "43250.5", "ETH": "2650.0", ... }
  } catch (error) {
    console.error('Error fetching prices:', error);
  }
};
```

#### Get Order Book Data
```javascript
const fetchOrderBook = async (symbol) => {
  try {
    const orderBook = await sdk.info.getL2Book(symbol);
    console.log(`${symbol} order book:`, orderBook);
    // Returns: { coin: "BTC", levels: [bids, asks], time: timestamp }
  } catch (error) {
    console.error('Error fetching order book:', error);
  }
};

// Usage
fetchOrderBook('BTC-PERP');
```

#### Get Candle Data for Charts
```javascript
const fetchCandleData = async (symbol, interval, startTime, endTime) => {
  try {
    const candles = await sdk.info.getCandleSnapshot({
      coin: symbol,
      interval: interval, // "1m", "5m", "15m", "1h", "1d", etc.
      startTime: startTime,
      endTime: endTime
    });
    console.log(`${symbol} candles:`, candles);
    // Returns array of candle objects with OHLCV data
  } catch (error) {
    console.error('Error fetching candles:', error);
  }
};

// Usage
fetchCandleData('BTC-PERP', '1h', Date.now() - 24*60*60*1000, Date.now());
```

### Perpetuals-Specific Data

#### Get Perpetuals Metadata
```javascript
const fetchPerpetualsInfo = async () => {
  try {
    const perpsMeta = await sdk.info.perpetuals.getMeta();
    console.log('Perpetuals metadata:', perpsMeta);
    // Returns: { universe: [...], marginTables: [...] }
  } catch (error) {
    console.error('Error fetching perpetuals info:', error);
  }
};
```

#### Get Perpetuals Market Context (Funding, Open Interest)
```javascript
const fetchPerpetualContexts = async () => {
  try {
    const contexts = await sdk.info.perpetuals.getMetaAndAssetCtxs();
    console.log('Perpetuals contexts:', contexts);
    // Returns: funding rates, open interest, mark prices, etc.
  } catch (error) {
    console.error('Error fetching contexts:', error);
  }
};
```

#### Get Funding Rate History
```javascript
const fetchFundingHistory = async (coin, startTime, endTime) => {
  try {
    const funding = await sdk.info.getFundingHistory({
      coin: coin,
      startTime: startTime,
      endTime: endTime
    });
    console.log(`${coin} funding history:`, funding);
  } catch (error) {
    console.error('Error fetching funding history:', error);
  }
};
```

### Spot Trading Data

#### Get Spot Metadata
```javascript
const fetchSpotInfo = async () => {
  try {
    const spotMeta = await sdk.info.spot.getSpotMeta();
    console.log('Spot metadata:', spotMeta);
    // Returns: { tokens: [...], universe: [...] }
  } catch (error) {
    console.error('Error fetching spot info:', error);
  }
};
```

#### Get Spot Asset Contexts
```javascript
const fetchSpotContexts = async () => {
  try {
    const contexts = await sdk.info.spot.getSpotMetaAndAssetCtxs();
    console.log('Spot contexts:', contexts);
    // Returns: token prices, volume, market data
  } catch (error) {
    console.error('Error fetching spot contexts:', error);
  }
};
```

### User-Specific Data (Optional)

If you want to display user-specific data, you'll need a user's wallet address:

#### Get User's Trading History
```javascript
const fetchUserFills = async (userAddress) => {
  try {
    const fills = await sdk.info.getUserFills({ user: userAddress });
    console.log('User fills:', fills);
    // Returns: array of user's recent trades
  } catch (error) {
    console.error('Error fetching user fills:', error);
  }
};
```

#### Get User's Open Orders
```javascript
const fetchUserOrders = async (userAddress) => {
  try {
    const orders = await sdk.info.getUserOpenOrders({ user: userAddress });
    console.log('User open orders:', orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
  }
};
```

#### Get User's Portfolio
```javascript
const fetchUserPortfolio = async (userAddress) => {
  try {
    const portfolio = await sdk.info.getUserPortfolio({ user: userAddress });
    console.log('User portfolio:', portfolio);
  } catch (error) {
    console.error('Error fetching user portfolio:', error);
  }
};
```

## WebSocket Subscriptions

For real-time data updates, enable WebSocket connections:

```javascript
import React, { useEffect, useState } from 'react';
import { Hyperliquid } from 'hyperliquid';

const RealTimeData = () => {
  const [sdk, setSdk] = useState(null);
  const [prices, setPrices] = useState({});
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    const initializeWebSocket = async () => {
      const hyperliquidSDK = new Hyperliquid({ enableWs: true });
      
      try {
        await hyperliquidSDK.connect();
        console.log('WebSocket connected');
        
        // Subscribe to all market prices
        hyperliquidSDK.subscriptions.subscribeToAllMids((data) => {
          console.log('Price update:', data);
          setPrices(data.mids);
        });
        
        // Subscribe to BTC trades
        hyperliquidSDK.subscriptions.subscribeToTrades('BTC-PERP', (data) => {
          console.log('BTC trades:', data);
          setTrades(prevTrades => [...data, ...prevTrades.slice(0, 99)]);
        });
        
        // Subscribe to candle updates
        hyperliquidSDK.subscriptions.subscribeToCandle('BTC-PERP', '1m', (data) => {
          console.log('BTC 1m candle:', data);
        });
        
        setSdk(hyperliquidSDK);
      } catch (error) {
        console.error('WebSocket connection error:', error);
      }
    };

    initializeWebSocket();

    return () => {
      if (sdk) {
        sdk.disconnect();
      }
    };
  }, []);

  return (
    // Your real-time UI components
    <div>
      <h2>Real-time Prices</h2>
      {Object.entries(prices).map(([symbol, price]) => (
        <div key={symbol}>{symbol}: ${price}</div>
      ))}
    </div>
  );
};
```

### Available WebSocket Subscriptions

1. **allMids** - All market prices
2. **trades** - Trade updates for specific coins
3. **l2Book** - Order book updates
4. **candle** - Candlestick updates
5. **userFills** - User's trade executions (requires user address)
6. **userEvents** - User events (requires user address)
7. **bbo** - Best bid/offer updates

## Implementation Examples

### Complete Market Dashboard Component

```javascript
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  RefreshControl,
  TouchableOpacity 
} from 'react-native';
import { Hyperliquid } from 'hyperliquid';

const MarketDashboard = () => {
  const [sdk, setSdk] = useState(null);
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeSDK();
  }, []);

  const initializeSDK = async () => {
    try {
      const hyperliquidSDK = new Hyperliquid({ enableWs: false });
      setSdk(hyperliquidSDK);
      await fetchMarketData(hyperliquidSDK);
    } catch (error) {
      console.error('SDK initialization error:', error);
    }
  };

  const fetchMarketData = async (sdkInstance = sdk) => {
    if (!sdkInstance) return;
    
    try {
      setLoading(true);
      
      // Fetch multiple data sources
      const [allMids, perpMeta, perpContexts] = await Promise.all([
        sdkInstance.info.getAllMids(),
        sdkInstance.info.perpetuals.getMeta(),
        sdkInstance.info.perpetuals.getMetaAndAssetCtxs()
      ]);

      // Combine data for display
      const combinedData = perpMeta.universe.map((asset, index) => {
        const context = perpContexts[1][index]; // Asset contexts
        const currentPrice = allMids[asset.name];
        
        return {
          id: asset.name,
          name: asset.name,
          price: currentPrice,
          change24h: context ? 
            ((parseFloat(context.markPx) - parseFloat(context.prevDayPx)) / parseFloat(context.prevDayPx) * 100).toFixed(2) 
            : '0.00',
          volume24h: context ? parseFloat(context.dayNtlVlm).toLocaleString() : '0',
          fundingRate: context ? (parseFloat(context.funding) * 100).toFixed(4) : '0.0000',
          openInterest: context ? parseFloat(context.openInterest).toLocaleString() : '0',
          maxLeverage: asset.maxLeverage,
        };
      });

      setMarketData(combinedData);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMarketData();
  };

  const renderMarketItem = ({ item }) => (
    <TouchableOpacity style={styles.marketItem}>
      <View style={styles.marketHeader}>
        <Text style={styles.marketName}>{item.name}-PERP</Text>
        <Text style={styles.leverage}>{item.maxLeverage}x</Text>
      </View>
      
      <View style={styles.marketData}>
        <Text style={styles.price}>${parseFloat(item.price).toLocaleString()}</Text>
        <Text style={[
          styles.change,
          { color: parseFloat(item.change24h) >= 0 ? '#4CAF50' : '#F44336' }
        ]}>
          {parseFloat(item.change24h) >= 0 ? '+' : ''}{item.change24h}%
        </Text>
      </View>
      
      <View style={styles.marketStats}>
        <Text style={styles.statText}>Volume: ${item.volume24h}</Text>
        <Text style={styles.statText}>Funding: {item.fundingRate}%</Text>
        <Text style={styles.statText}>OI: ${item.openInterest}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hyperliquid Markets</Text>
      
      <FlatList
        data={marketData}
        keyExtractor={(item) => item.id}
        renderItem={renderMarketItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  marketItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  marketName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  leverage: {
    fontSize: 12,
    color: '#FFB74D',
    backgroundColor: '#FF8F00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  marketData: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  change: {
    fontSize: 16,
    fontWeight: '600',
  },
  marketStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
    color: '#AAAAAA',
  },
});

export default MarketDashboard;
```

### Price Ticker Component

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Hyperliquid } from 'hyperliquid';

const PriceTicker = () => {
  const [prices, setPrices] = useState({});
  const [sdk, setSdk] = useState(null);

  useEffect(() => {
    const initializeRealTimeData = async () => {
      const hyperliquidSDK = new Hyperliquid({ enableWs: true });
      
      try {
        await hyperliquidSDK.connect();
        
        // Subscribe to real-time price updates
        hyperliquidSDK.subscriptions.subscribeToAllMids((data) => {
          setPrices(data.mids);
        });
        
        setSdk(hyperliquidSDK);
      } catch (error) {
        console.error('Real-time connection error:', error);
      }
    };

    initializeRealTimeData();

    return () => {
      if (sdk) {
        sdk.disconnect();
      }
    };
  }, []);

  const majorPairs = ['BTC', 'ETH', 'SOL', 'AVAX', 'MATIC'];
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.tickerContainer}
    >
      {majorPairs.map((pair) => (
        <View key={pair} style={styles.tickerItem}>
          <Text style={styles.tickerSymbol}>{pair}</Text>
          <Text style={styles.tickerPrice}>
            ${prices[pair] ? parseFloat(prices[pair]).toLocaleString() : '---'}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tickerContainer: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
  },
  tickerItem: {
    marginHorizontal: 16,
    alignItems: 'center',
  },
  tickerSymbol: {
    color: '#AAAAAA',
    fontSize: 12,
    marginBottom: 4,
  },
  tickerPrice: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PriceTicker;
```

## Rate Limits and Best Practices

### API Rate Limits

Hyperliquid implements token bucket rate limiting:
- **100 tokens maximum capacity**
- **10 tokens per second refill rate**
- The SDK automatically handles rate limiting with backoff

### WebSocket Limits

- **Maximum 1000 subscriptions per IP address**
- **Maximum 2000 messages per minute**
- **Maximum 100 simultaneous inflight POST messages**

### Best Practices

1. **Use REST API for initial data loading**
2. **Use WebSocket only for real-time updates**
3. **Implement proper error handling and reconnection logic**
4. **Cache data locally to reduce API calls**
5. **Unsubscribe from unused WebSocket feeds**

```javascript
// Good practice: Batch multiple API calls
const fetchAllMarketData = async () => {
  try {
    const [prices, perpData, spotData] = await Promise.allSettled([
      sdk.info.getAllMids(),
      sdk.info.perpetuals.getMetaAndAssetCtxs(),
      sdk.info.spot.getSpotMetaAndAssetCtxs()
    ]);
    
    // Handle results...
  } catch (error) {
    console.error('Batch fetch error:', error);
  }
};
```

## Troubleshooting

### Common Issues and Solutions

#### 1. "URL is not defined" Error
```javascript
// Solution: Add URL polyfill at the top of your entry file
import 'react-native-url-polyfill/auto';
```

#### 2. "TextEncoder is not defined" Error
```javascript
// Solution: Add TextEncoder polyfill
import { TextEncoder, TextDecoder } from 'text-encoding';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
```

#### 3. WebSocket Connection Issues
```javascript
// Solution: Add connection retry logic
const connectWithRetry = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sdk.connect();
      break;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

#### 4. Rate Limiting Issues
```javascript
// Solution: Implement exponential backoff
const apiCallWithBackoff = async (apiCall, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.message.includes('rate limit') && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      throw error;
    }
  }
};
```

### Memory Management

```javascript
// Clean up WebSocket connections and subscriptions
useEffect(() => {
  return () => {
    if (sdk) {
      // Unsubscribe from all feeds
      sdk.subscriptions.unsubscribeAll?.();
      // Disconnect WebSocket
      sdk.disconnect();
    }
  };
}, [sdk]);
```

## Environment Configuration

### Development vs Production

```javascript
const config = {
  development: {
    baseURL: 'https://api.hyperliquid-testnet.xyz',
    wsURL: 'wss://api.hyperliquid-testnet.xyz/ws',
  },
  production: {
    baseURL: 'https://api.hyperliquid.xyz',
    wsURL: 'wss://api.hyperliquid.xyz/ws',
  }
};

const sdk = new Hyperliquid({
  enableWs: true,
  baseURL: __DEV__ ? config.development.baseURL : config.production.baseURL
});
```

## Data Types Reference

### AllMids Response
```typescript
interface AllMids {
  [coinSymbol: string]: string; // Price as string
}
```

### L2 Book Response
```typescript
interface L2Book {
  coin: string;
  levels: [Array<Level>, Array<Level>]; // [bids, asks]
  time: number;
}

interface Level {
  px: string; // Price
  sz: string; // Size
  n: number;  // Number of orders
}
```

### Asset Context
```typescript
interface AssetContext {
  dayNtlVlm: string;    // 24h volume
  funding: string;       // Funding rate
  markPx: string;       // Mark price
  midPx?: string;       // Mid price
  openInterest: string; // Open interest
  oraclePx: string;     // Oracle price
  prevDayPx: string;    // Previous day price
}
```

### Trade Data
```typescript
interface Trade {
  coin: string;
  side: string;    // "A" (ask/sell) or "B" (bid/buy)
  px: string;      // Price
  sz: string;      // Size
  time: number;    // Timestamp
  hash: string;    // Transaction hash
  tid: number;     // Trade ID
}
```

### Candle Data
```typescript
interface Candle {
  t: number;    // Open time (ms)
  T: number;    // Close time (ms)
  s: string;    // Symbol
  i: string;    // Interval
  o: number;    // Open price
  c: number;    // Close price
  h: number;    // High price
  l: number;    // Low price
  v: number;    // Volume
  n: number;    // Number of trades
}
```

This comprehensive guide should help you integrate all the available Hyperliquid data into your React Native Expo application. The SDK provides extensive market data that you can display to users, from basic price information to advanced trading analytics and real-time updates.