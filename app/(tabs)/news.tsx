import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

// Define the news article structure
type NewsArticle = {
  id: string;
  title: string;
  body: string;
  url: string;
  imageurl: string;
  published_on: number;
  source_info: {
    name: string;
  };
};

export default function NewsScreen() {
  const { colors } = useTheme();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch crypto news from CryptoCompare API
  const fetchCryptoNews = async () => {
    try {
      // Using CryptoCompare API with direct fetch
      const url = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.Type !== 100) {
        throw new Error(data.Message || 'Failed to fetch news');
      }
      
      // Process articles and add IDs
      const processedArticles = data.Data.map((article: any, index: number) => ({
        ...article,
        id: index.toString()
      }));
      
      setArticles(processedArticles);
      setError(null);
    } catch (err) {
      console.error('Error fetching crypto news:', err);
      setError('Failed to fetch crypto news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchCryptoNews();
  }, []);

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading crypto news...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: '#F44336' }]}>{error}</Text>
        <Text style={[styles.retryText, { color: colors.primary }]} onPress={fetchCryptoNews}>
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Crypto News</Text>
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