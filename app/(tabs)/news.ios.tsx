import { StyleSheet, View, ActivityIndicator, Text, Image, TouchableOpacity, FlatList, RefreshControl, StatusBar } from 'react-native';
import { useEffect, useState } from 'react';
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

  // Render slideshow item with glass effect
  const renderSlideshowItem = () => {
    if (articles.length === 0) return null;
    
    const article = articles[currentIndex];
    
    return (
      <VStack 
        modifiers={[
          glassEffect({ glass: { variant: 'regular' } }),
          clipShape('roundedRectangle', { cornerRadius: 12 })
        ]}
        style={styles.slide}
      >
        {article.imageurl ? (
          <Image 
            source={{ uri: article.imageurl }} 
            style={styles.articleImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: colors.border }]} />
        )}
        <VStack spacing={10} style={styles.articleContent}>
          <SwiftUIText size={18} weight="bold" color={colors.text}>{article.title}</SwiftUIText>
          <SwiftUIText size={14} color={colors.text} numberOfLines={3}>{article.body}</SwiftUIText>
          <HStack alignment="center" spacing={8}>
            <SwiftUIText size={12} weight="bold" color={colors.textSecondary}>{article.source_info.name}</SwiftUIText>
            <Spacer />
            <SwiftUIText size={12} color={colors.textSecondary}>
              {new Date(article.published_on * 1000).toLocaleDateString()}
            </SwiftUIText>
          </HStack>
        </VStack>
      </VStack>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Host style={[styles.container, { backgroundColor: colors.background }]}>
        <VStack spacing={10} alignment="center">
          <ActivityIndicator size="large" color={colors.primary} />
          <SwiftUIText size={16} color="secondary">Loading crypto news...</SwiftUIText>
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
          <TouchableOpacity onPress={fetchCryptoNews}>
            <SwiftUIText size={16} color={colors.primary}>Tap to retry</SwiftUIText>
          </TouchableOpacity>
        </VStack>
      </Host>
    );
  }

  // Empty state
  if (articles.length === 0) {
    return (
      <Host style={[styles.container, { backgroundColor: colors.background }]}>
        <VStack spacing={10} alignment="center">
          <SwiftUIText size={16} color={colors.text}>No crypto news available at the moment.</SwiftUIText>
        </VStack>
      </Host>
    );
  }

  return (
    <Host style={[styles.container, { backgroundColor: colors.background }]}>
      <VStack spacing={15}>
        <SwiftUIText size={24} weight="bold" style={styles.header} color={colors.text}>
          Crypto News
        </SwiftUIText>
        
        {/* Slideshow */}
        <VStack style={styles.slideshowContainer}>
          {renderSlideshowItem()}
          
          {/* Navigation buttons */}
          <HStack 
            modifiers={[
              glassEffect({ glass: { variant: 'regular' } }),
              padding({ horizontal: 20, vertical: 10 }),
              clipShape('capsule')
            ]}
            style={styles.navigation}
          >
            <TouchableOpacity style={styles.navButton} onPress={prevArticle}>
              <SwiftUIText size={24} weight="bold" color={colors.text}>‹</SwiftUIText>
            </TouchableOpacity>
            
            <SwiftUIText size={16} weight="bold" color={colors.text}>
              {currentIndex + 1} / {articles.length}
            </SwiftUIText>
            
            <TouchableOpacity style={styles.navButton} onPress={nextArticle}>
              <SwiftUIText size={24} weight="bold" color={colors.text}>›</SwiftUIText>
            </TouchableOpacity>
          </HStack>
        </VStack>
        
        {/* Article list */}
        <VStack spacing={10} style={styles.listHeader}>
          <SwiftUIText size={20} weight="bold" color={colors.text}>More News</SwiftUIText>
        </VStack>
        
        <List scrollEnabled={true} listStyle="plain">
          {articles.map((item) => (
            <TouchableOpacity 
              key={item.id}
              modifiers={[
                glassEffect({ glass: { variant: 'regular' } }),
                padding({ all: 10 }),
                clipShape('roundedRectangle', { cornerRadius: 8 })
              ]}
              style={styles.articleItem}
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
              <VStack spacing={5} style={styles.articleItemContent}>
                <SwiftUIText size={14} weight="bold" color={colors.text} numberOfLines={2}>
                  {item.title}
                </SwiftUIText>
                <SwiftUIText size={12} color={colors.textSecondary}>
                  {item.source_info.name}
                </SwiftUIText>
              </VStack>
            </TouchableOpacity>
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
  slideshowContainer: {
    height: 300,
    margin: 10,
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
  navigation: {
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  navButton: {
    padding: 10,
  },
  listHeader: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  articleItem: {
    marginHorizontal: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  articleItemImg: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  placeholderImageSmall: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  articleItemContent: {
    flex: 1,
    padding: 10,
  },
});