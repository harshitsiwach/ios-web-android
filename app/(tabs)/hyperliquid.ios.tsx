import { StyleSheet, View, FlatList, RefreshControl, ActivityIndicator, Text, Image, TouchableOpacity, StatusBar } from 'react-native';
import { useEffect, useState } from 'react';
import { Hyperliquid } from 'hyperliquid';
import { useTheme } from '@/contexts/ThemeContext';

import {
  Host,
  VStack,
  HStack,
  Text as SwiftUIText,
  Spacer,
  List,
} from '@expo/ui/swift-ui';
import { glassEffect, padding, clipShape } from '@expo/ui/swift-ui/modifiers';

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

  // Render individual market item with glass effect
  const renderMarketItem = ({ item }: { item: MarketData }) => (
    <VStack 
      modifiers={[
        glassEffect({ glass: { variant: 'regular' } }),
        padding({ vertical: 12, horizontal: 15 }),
        clipShape('roundedRectangle', { cornerRadius: 12 })
      ]}
      style={styles.marketItem}
    >
      <HStack alignment="center" spacing={8}>
        <VStack alignment="leading" spacing={4} style={styles.marketInfo}>
          <HStack alignment="center">
            <SwiftUIText size={18} weight="bold" color={colors.text}>{item.name}-PERP</SwiftUIText>
            <View style={[styles.leverageBadge, { backgroundColor: '#FF8F00' }]}>
              <SwiftUIText size={12} color="#000">{item.maxLeverage}x</SwiftUIText>
            </View>
          </HStack>
          
          <HStack alignment="center" spacing={8}>
            <SwiftUIText size={20} weight="bold" color={colors.text}>
              ${parseFloat(item.price).toLocaleString()}
            </SwiftUIText>
            <SwiftUIText 
              size={16} 
              weight="600"
              color={parseFloat(item.change24h) >= 0 ? '#4CAF50' : '#F44336'}
            >
              {parseFloat(item.change24h) >= 0 ? '+' : ''}{item.change24h}%
            </SwiftUIText>
          </HStack>
        </VStack>
        
        <Spacer />
        
        <VStack alignment="trailing" spacing={4}>
          <SwiftUIText size={12} color={colors.textSecondary}>Volume: ${item.volume24h}</SwiftUIText>
          <SwiftUIText size={12} color={colors.textSecondary}>Funding: {item.fundingRate}%</SwiftUIText>
          <SwiftUIText size={12} color={colors.textSecondary}>OI: ${item.openInterest}</SwiftUIText>
        </VStack>
      </HStack>
    </VStack>
  );

  // Loading state
  if (loading) {
    return (
      <Host style={[styles.container, { backgroundColor: colors.background }]}>
        <VStack spacing={10} alignment="center">
          <ActivityIndicator size="large" color={colors.primary} />
          <SwiftUIText size={16} color="secondary">Loading Hyperliquid data...</SwiftUIText>
        </VStack>
      </Host>
    );
  }

  // Error state
  if (error) {
    return (
      <Host style={[styles.container, { backgroundColor: colors.background }]}>
        <VStack spacing={10} alignment="center">
          <SwiftUIText size={16} color="#F44336">{error}</SwiftUIText>
          <TouchableOpacity onPress={fetchMarketData}>
            <SwiftUIText size={16} color={colors.primary}>Tap to retry</SwiftUIText>
          </TouchableOpacity>
        </VStack>
      </Host>
    );
  }

  return (
    <Host style={[styles.container, { backgroundColor: colors.background }]}>
      <VStack spacing={15}>
        <SwiftUIText size={24} weight="bold" style={styles.header} color={colors.text}>
          Hyperliquid Markets
        </SwiftUIText>
        
        <List scrollEnabled={true} listStyle="plain">
          {marketData.map((item) => (
            <View key={item.id}>
              {renderMarketItem({ item })}
            </View>
          ))}
        </List>
      </VStack>
    </Host>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    textAlign: 'center',
    marginVertical: 20,
  },
  marketItem: {
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  marketInfo: {
    flex: 1,
  },
  leverageBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
});