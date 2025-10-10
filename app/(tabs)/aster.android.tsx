import { useTheme } from '@/contexts/ThemeContext';
import { BlurView } from 'expo-blur';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

// Define the market data structures
type TickerPrice = {
  symbol: string;
  price: string;
};

type Ticker24Hr = {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  
  bidPrice: string;
  askPrice: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
};

type OrderBookEntry = [string, string]; // [price, quantity]
type OrderBook = {
  symbol: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastUpdateId: number;
};

type KlineData = [
  number, // Open time
  string, // Open price
  string, // High price
  string, // Low price
  string, // Close price
  string, // Volume
  number, // Close time
  string, // Quote asset volume
  number, // Number of trades
  string, // Taker buy base asset volume
  string, // Taker buy quote asset volume
  string  // Unused field
];

const AsterScreen = () => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tickerData, setTickerData] = useState<TickerPrice[]>([]);
  const [ticker24hrData, setTicker24hrData] = useState<Ticker24Hr[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);

  // Fetch latest prices for multiple symbols
  const fetchTickerPrices = async () => {
    try {
      const response = await axios.get('https://fapi.asterdex.com/fapi/v1/ticker/price');
      setTickerData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching ticker prices:', err);
      setError('Failed to fetch ticker prices');
    }
  };

  // Fetch 24hr statistics for multiple symbols
  const fetchTicker24hr = async () => {
    try {
      const response = await axios.get('https://fapi.asterdex.com/fapi/v1/ticker/24hr');
      setTicker24hrData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching 24hr data:', err);
      setError('Failed to fetch 24hr data');
    }
  };

  // Fetch order book for BTCUSDT
  const fetchOrderBook = async () => {
    try {
      const response = await axios.get('https://fapi.asterdex.com/fapi/v1/depth', {
        params: {
          symbol: 'BTCUSDT',
          limit: 5
        }
      });
      setOrderBook(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching order book:', err);
      setError('Failed to fetch order book data');
    }
  };

  // Fetch all data
  const fetchData = async () => {
    try {
      await Promise.all([
        fetchTickerPrices(),
        fetchTicker24hr(),
        fetchOrderBook()
      ]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading Aster market data...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.down }]}>{error}</Text>
        <Text style={[styles.retryText, { color: colors.primary }]} onPress={() => fetchData()}>
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: 'rgba(10, 12, 22, 0.9)'}]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
      }
    >
      <View style={styles.content}>
        <Text style={[styles.header, { color: colors.text, textAlign: 'center', marginVertical: 20 }]}>Aster Market Data</Text>
        
        {/* Latest Prices */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.text, marginBottom: 10 }]}>Latest Prices</Text>
          {tickerData.slice(0, 10).map((ticker, index) => (
            <BlurView key={index} intensity={40} tint="dark" style={styles.cryptoCard}>
              <View style={styles.cryptoRow}>
                <Text style={[styles.symbol, { color: colors.text }]}>{ticker.symbol}</Text>
                <Text style={[styles.price, { color: colors.text }]}>{ticker.price}</Text>
              </View>
            </BlurView>
          ))}
        </View>
        
        {/* 24hr Statistics */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.text, marginBottom: 10 }]}>24hr Statistics</Text>
          {ticker24hrData.slice(0, 5).map((ticker, index) => (
            <BlurView key={index} intensity={40} tint="dark" style={styles.cryptoCard}>
              <View style={styles.cryptoRow}>
                <Text style={[styles.symbol, { color: colors.text }]}>{ticker.symbol}</Text>
                <Text style={[styles.price, { color: parseFloat(ticker.priceChangePercent) >= 0 ? colors.up : colors.down }]}>
                  {ticker.lastPrice} ({ticker.priceChangePercent}%)
                </Text>
              </View>
            </BlurView>
          ))}
        </View>
        
        {/* Order Book */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.text, marginBottom: 10 }]}>Order Book (BTCUSDT)</Text>
          {orderBook && (
            <View>
              <Text style={[styles.subtitle, { color: colors.textSecondary, marginBottom: 5 }]}>Bids</Text>
              {orderBook.bids.map((bid, index) => (
                <BlurView key={`bid-${index}`} intensity={40} tint="dark" style={styles.cryptoCard}>
                  <View style={styles.cryptoRow}>
                    <Text style={[styles.bidPrice, { color: colors.up }]}>{bid[0]}</Text>
                    <Text style={[styles.quantity, { color: colors.textSecondary }]}>{bid[1]}</Text>
                  </View>
                </BlurView>
              ))}
              
              <Text style={[styles.subtitle, { color: colors.textSecondary, marginVertical: 5 }]}>Asks</Text>
              {orderBook.asks.map((ask, index) => (
                <BlurView key={`ask-${index}`} intensity={40} tint="dark" style={styles.cryptoCard}>
                  <View style={styles.cryptoRow}>
                    <Text style={[styles.askPrice, { color: colors.down }]}>{ask[0]}</Text>
                    <Text style={[styles.quantity, { color: colors.textSecondary }]}>{ask[1]}</Text>
                  </View>
                </BlurView>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default AsterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  cryptoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  cryptoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symbol: {
    fontSize: 16,
    fontWeight: '600',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  bidPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  askPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  quantity: {
    fontSize: 14,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});