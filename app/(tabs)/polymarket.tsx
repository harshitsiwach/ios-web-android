import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

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
};

export default function PolymarketScreen() {
  const { colors } = useTheme();
  const [markets, setMarkets] = useState<PolymarketMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      
      setMarkets(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching Polymarket data:', err);
      setError('Failed to fetch Polymarket data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchPolymarketData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading Polymarket data...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: '#F44336' }]}>{error}</Text>
        <Text style={[styles.retryText, { color: colors.primary }]} onPress={fetchPolymarketData}>
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Polymarket</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        Platform-specific implementation not available.
      </Text>
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
  message: {
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
});