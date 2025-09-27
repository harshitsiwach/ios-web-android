import { StyleSheet, View, FlatList, RefreshControl, ActivityIndicator, Text, Image, TouchableOpacity, StatusBar } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useNetworkSwitcher } from '@/hooks/useNetworkSwitcher';
import { useFocusEffect } from 'expo-router';

import {
  Host,
  VStack,
  HStack,
  Text as SwiftUIText,
  Spacer,
  List,
} from '@expo/ui/swift-ui';
import { glassEffect, padding, clipShape } from '@expo/ui/swift-ui/modifiers';

// Define the Polymarket market structure
type PolymarketMarket = {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  endDate: string;
  category: string;
  volume: string;
  active: boolean;
  closed: boolean;
  volumeNum: number;
  volume24hr: number;
  outcomes: string; // JSON string
  outcomePrices: string; // JSON string
  image: string | null;
  description: string;
  
  // Computed properties (we'll parse these in the component)
  parsedOutcomes: string[];
  parsedPrices: number[];
  formattedVolume: string;
};

export default function PolymarketScreen() {
  const { colors } = useTheme();
  const { switchToPolygon, getNetworkName, currentChain } = useNetworkSwitcher();
  const [markets, setMarkets] = useState<PolymarketMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Switch to Polygon network when this screen is focused
  useFocusEffect(
    useCallback(() => {
      if (currentChain?.id !== 137) { // Polygon mainnet chain ID
        Alert.alert(
          'Network Switch Required',
          `Switch from ${getNetworkName(currentChain?.id)} to Polygon network?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Switch', 
              onPress: () => {
                switchToPolygon();
              }
            }
          ]
        );
      }
    }, [currentChain, getNetworkName, switchToPolygon])
  );

  // Parse outcomes from JSON string
  const parseOutcomes = (outcomes: string): string[] => {
    try {
      const data = JSON.parse(outcomes);
      return Array.isArray(data) ? data : ["Yes", "No"];
    } catch {
      return ["Yes", "No"];
    }
  };

  // Parse prices from JSON string
  const parsePrices = (prices: string): number[] => {
    try {
      const data = JSON.parse(prices);
      if (Array.isArray(data)) {
        return data.map(p => parseFloat(p) || 0);
      }
      return [0, 0];
    } catch {
      return [0, 0];
    }
  };

  // Format volume number
  const formatVolume = (volumeNum: number): string => {
    if (volumeNum >= 1_000_000) {
      return `${(volumeNum / 1_000_000).toFixed(1)}M`;
    } else if (volumeNum >= 1_000) {
      return `${(volumeNum / 1_000).toFixed(1)}K`;
    } else {
      return `${Math.round(volumeNum)}`;
    }
  };

  // Fetch Polymarket data
  const fetchPolymarketData = async () => {
    try {
      const response = await fetch(
        'https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=10'
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process the data to add computed properties
      const processedMarkets = data.map((market: any, index: number) => ({
        ...market,
        parsedOutcomes: parseOutcomes(market.outcomes),
        parsedPrices: parsePrices(market.outcomePrices),
        formattedVolume: formatVolume(market.volumeNum)
      }));
      
      setMarkets(processedMarkets);
      setError(null);
    } catch (err) {
      console.error('Error fetching Polymarket data:', err);
      setError('Failed to fetch Polymarket data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchPolymarketData();
  }, []);

  // Refresh function for pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchPolymarketData();
  };

  // Render individual market item with glass effect
  const renderMarketItem = ({ item }: { item: PolymarketMarket }) => (
    <VStack 
      modifiers={[
        glassEffect({ glass: { variant: 'regular' } }),
        padding({ vertical: 12, horizontal: 15 }),
        clipShape('roundedRectangle', { cornerRadius: 12 })
      ]}
      style={styles.marketCard}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.marketImage} />
      ) : null}
      
      <VStack spacing={10} style={styles.cardContent}>
        <SwiftUIText size={16} weight="bold" color={colors.text}>{item.question}</SwiftUIText>
        
        <HStack alignment="center" spacing={8}>
          <View style={[styles.categoryBadge, { backgroundColor: 'rgba(0, 0, 255, 0.2)' }]}>
            <SwiftUIText size={12} color={colors.text}>{item.category}</SwiftUIText>
          </View>
          <Spacer />
          <SwiftUIText size={12} weight="bold" color="#4CAF50">{item.formattedVolume}</SwiftUIText>
        </HStack>
        
        <HStack alignment="center" spacing={16} style={styles.outcomesContainer}>
          {item.parsedOutcomes.slice(0, 2).map((outcome, index) => {
            const price = item.parsedPrices[index] || 0;
            const percentage = Math.round(price * 100);
            
            return (
              <VStack key={index} alignment="center" spacing={4}>
                <SwiftUIText size={14} color={colors.text}>{outcome}</SwiftUIText>
                <SwiftUIText size={14} weight="bold" color={colors.text}>{percentage}%</SwiftUIText>
              </VStack>
            );
          })}
        </HStack>
      </VStack>
    </VStack>
  );

  // Loading state
  if (loading) {
    return (
      <Host style={[styles.container, { backgroundColor: colors.background }]}>
        <VStack spacing={10} alignment="center">
          <ActivityIndicator size="large" color={colors.primary} />
          <SwiftUIText size={16} color="secondary">Loading Polymarket data...</SwiftUIText>
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
          <TouchableOpacity onPress={fetchPolymarketData}>
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
          Trending Polymarkets
        </SwiftUIText>
        
        <List scrollEnabled={true} listStyle="plain">
          {markets.map((item) => (
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
  marketCard: {
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  marketImage: {
    width: '100%',
    height: 150,
  },
  cardContent: {
    padding: 15,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  outcomesContainer: {
    justifyContent: 'space-between',
  },
});