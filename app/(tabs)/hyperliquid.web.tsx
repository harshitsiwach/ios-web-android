import { StyleSheet, View, FlatList, RefreshControl, ActivityIndicator, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useEffect, useState } from 'react';
import { Hyperliquid } from 'hyperliquid';
import { useTheme } from '@/contexts/ThemeContext';

// Define the market data structure
type MarketData = {
  id: string;
  name: string;
  price: string;
  change24h: string;
  volume24h: string;
  fundingRate: string;
  openInterest: string;
  maxLeverage: number;
};

export default function HyperliquidScreen() {
  const { colors } = useTheme();
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch market data from Hyperliquid
  const fetchMarketData = async () => {
    try {
      // Initialize SDK without WebSocket for simple data fetching
      const sdk = new Hyperliquid({ enableWs: false });
      
      // Fetch multiple data sources
      const [allMids, perpMeta, perpContexts] = await Promise.all([
        sdk.info.getAllMids(),
        sdk.info.perpetuals.getMeta(),
        sdk.info.perpetuals.getMetaAndAssetCtxs()
      ]);

      // Combine data for display
      const combinedData = perpMeta.universe.map((asset: any, index: number) => {
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
      setError(null);
    } catch (err) {
      console.error('Error fetching Hyperliquid data:', err);
      setError('Failed to fetch Hyperliquid data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchMarketData();
  }, []);

  // Refresh function for pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchMarketData();
  };

  // Render individual market item
  const renderMarketItem = ({ item }: { item: MarketData }) => (
    <TouchableOpacity style={[styles.marketItem, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.marketHeader}>
        <Text style={[styles.marketName, { color: colors.text }]}>{item.name}-PERP</Text>
        <Text style={[styles.leverage, { color: colors.text }]}>{item.maxLeverage}x</Text>
      </View>
      
      <View style={styles.marketData}>
        <Text style={[styles.price, { color: colors.text }]}>${parseFloat(item.price).toLocaleString()}</Text>
        <Text style={[
          styles.change,
          { color: parseFloat(item.change24h) >= 0 ? '#4CAF50' : '#F44336' }
        ]}>
          {parseFloat(item.change24h) >= 0 ? '+' : ''}{item.change24h}%
        </Text>
      </View>
      
      <View style={styles.marketStats}>
        <Text style={[styles.statText, { color: colors.textSecondary }]}>Volume: ${item.volume24h}</Text>
        <Text style={[styles.statText, { color: colors.textSecondary }]}>Funding: {item.fundingRate}%</Text>
        <Text style={[styles.statText, { color: colors.textSecondary }]}>OI: ${item.openInterest}</Text>
      </View>
    </TouchableOpacity>
  );

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading Hyperliquid data...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: '#F44336' }]}>{error}</Text>
        <Text style={[styles.retryText, { color: colors.primary }]} onPress={fetchMarketData}>
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Hyperliquid Markets</Text>
      
      <FlatList
        data={marketData}
        keyExtractor={(item) => item.id}
        renderItem={renderMarketItem}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[colors.primary]} 
            tintColor={colors.primary} 
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
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
  marketItem: {
    borderRadius: 12,
    padding: 16,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  },
  leverage: {
    fontSize: 12,
    color: '#000',
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
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});