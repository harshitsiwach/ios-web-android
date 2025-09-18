import { StyleSheet, View, ActivityIndicator, Text, Image, TouchableOpacity, FlatList, RefreshControl, StatusBar } from 'react-native';
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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
      setRefreshing(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchCryptoNews();
  }, []);

  // Refresh function for pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchCryptoNews();
  };

  // Navigate to next article
  const nextArticle = () => {
    if (articles.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % articles.length);
    }
  };

  // Navigate to previous article
  const prevArticle = () => {
    if (articles.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + articles.length) % articles.length);
    }
  };

  // Render slideshow item
  const renderSlideshowItem = () => {
    if (articles.length === 0) return null;
    
    const article = articles[currentIndex];
    
    return (
      <View style={[styles.slide, { backgroundColor: colors.cardBackground }]}>
        {article.imageurl ? (
          <Image 
            source={{ uri: article.imageurl }} 
            style={styles.articleImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: colors.border }]} />
        )}
        <View style={styles.articleContent}>
          <Text style={[styles.articleTitle, { color: colors.text }]}>{article.title}</Text>
          <Text style={[styles.articleDescription, { color: colors.text }]} numberOfLines={3}>{article.body}</Text>
          <View style={styles.articleMeta}>
            <Text style={[styles.source, { color: colors.textSecondary }]}>{article.source_info.name}</Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {new Date(article.published_on * 1000).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

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

  // Empty state
  if (articles.length === 0) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.text }]}>No crypto news available at the moment.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Crypto News</Text>
      
      {/* Slideshow */}
      <View style={styles.slideshowContainer}>
        {renderSlideshowItem()}
        
        {/* Navigation buttons */}
        <View style={[styles.navigation, { backgroundColor: colors.cardBackground }]}>
          <TouchableOpacity style={styles.navButton} onPress={prevArticle}>
            <Text style={[styles.navButtonText, { color: colors.text }]}>‹</Text>
          </TouchableOpacity>
          
          <Text style={[styles.indicator, { color: colors.text }]}>
            {currentIndex + 1} / {articles.length}
          </Text>
          
          <TouchableOpacity style={styles.navButton} onPress={nextArticle}>
            <Text style={[styles.navButtonText, { color: colors.text }]}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Article list */}
      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, { color: colors.text }]}>More News</Text>
      </View>
      
      <FlatList
        data={articles}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.articleItem, { backgroundColor: colors.cardBackground }]}
            onPress={() => setCurrentIndex(articles.indexOf(item))}
          >
            {item.imageurl ? (
              <Image 
                source={{ uri: item.imageurl }} 
                style={styles.articleItemImg}
              />
            ) : (
              <View style={[styles.placeholderImageSmall, { backgroundColor: colors.border }]} />
            )}
            <View style={styles.articleItemContent}>
              <Text style={[styles.articleItemTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
              <Text style={[styles.articleItemSource, { color: colors.textSecondary }]}>{item.source_info.name}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
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
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  slideshowContainer: {
    height: 300,
    margin: 10,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  slide: {
    flex: 1,
  },
  articleImage: {
    width: '100%',
    height: 180,
  },
  placeholderImage: {
    width: '100%',
    height: 180,
  },
  articleContent: {
    padding: 15,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  articleDescription: {
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  source: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  indicator: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listHeader: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  articleItem: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  articleItemImg: {
    width: 80,
    height: 80,
  },
  placeholderImageSmall: {
    width: 80,
    height: 80,
  },
  articleItemContent: {
    flex: 1,
    padding: 10,
  },
  articleItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  articleItemSource: {
    fontSize: 12,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});