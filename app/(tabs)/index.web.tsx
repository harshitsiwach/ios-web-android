import { useTheme } from '@/contexts/ThemeContext';
import { GlassView } from 'expo-liquid-glass-view';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Image, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Define the crypto data structure
type Cryptocurrency = {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  image?: string; // Add image property for crypto logos
};

// Define the team selection structure
type TeamSelection = {
  crypto: Cryptocurrency;
  prediction: 'up' | 'down';
};

// Function to show alerts on web
const showAlert = (title: string, message: string) => {
  alert(`${title}\n${message}`);
};

export default function HomeScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCryptos, setSelectedCryptos] = useState<Record<string, 'up' | 'down' | null>>({});
  const [team, setTeam] = useState<TeamSelection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch crypto data from CoinGecko API
  const fetchCryptoData = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false'
      );
      const data = await response.json();
      setCryptos(data);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchCryptoData();
  }, []);

  // Update team when selections change
  useEffect(() => {
    const newTeam: TeamSelection[] = [];
    Object.entries(selectedCryptos).forEach(([id, prediction]) => {
      if (prediction !== null) {
        const crypto = cryptos.find(c => c.id === id);
        if (crypto) {
          newTeam.push({ crypto, prediction });
        }
      }
    });
    setTeam(newTeam);
  }, [selectedCryptos, cryptos]);

  // Refresh function for pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchCryptoData();
  };

  // Filter cryptos based on search query
  const filteredCryptos = cryptos.filter(crypto => 
    crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle crypto selection for up/down prediction
  const handleCryptoSelect = (id: string, prediction: 'up' | 'down') => {
    const currentSelections = Object.values(selectedCryptos).filter(Boolean).length;
    const isAlreadySelected = selectedCryptos[id] === prediction;
    
    if (!isAlreadySelected && currentSelections >= 5) {
      showAlert(
        'Team Full',
        'You can only select up to 5 tokens for your team.'
      );
      return;
    }
    
    setSelectedCryptos(prev => ({
      ...prev,
      [id]: prev[id] === prediction ? null : prediction
    }));
  };

  // View team function
  const viewTeam = () => {
    if (team.length === 0) {
      showAlert(
        'Empty Team',
        'Please select at least one token for your team.'
      );
      return;
    }
    
    // Navigate to the team panel screen with team data
    router.push({
      pathname: '/(tabs)/team-panel',
      params: { teamData: encodeURIComponent(JSON.stringify(team)) }
    });
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading crypto prices...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.headerContent}>
          <Image 
            source={{ uri: 'https://placehold.co/40' }} 
            style={styles.logo}
          />
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Crypto Markets</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Real-time prices & trends</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={viewTeam}>
            <Text style={[styles.headerButtonText, { color: colors.text }]}>View Team</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.themeButton, { backgroundColor: colors.primary }]} 
            onPress={toggleTheme}
          >
            <Text style={styles.themeButtonText}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Team selection indicator */}
      {Object.keys(selectedCryptos).filter(id => selectedCryptos[id] !== null).length > 0 && (
        <View style={[styles.teamIndicator, { backgroundColor: colors.cardBackground }]}>
          <Text style={{ color: colors.textSecondary }}>
            Team: {Object.keys(selectedCryptos).filter(id => selectedCryptos[id] !== null).length}/5 tokens selected
          </Text>
        </View>
      )}

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.cardBackground, color: colors.text }]}
          placeholder="Search cryptocurrencies..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Crypto list */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {filteredCryptos.map((item) => (
          <View 
            key={item.id} 
            style={[
              styles.cryptoItem, 
              { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 },
              selectedCryptos[item.id] && { borderLeftWidth: 4, borderLeftColor: selectedCryptos[item.id] === 'up' ? colors.up : colors.down }
            ]}
          >
            <View style={styles.cryptoInfo}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.cryptoLogo} />
              ) : (
                <View style={[styles.cryptoLogo, styles.cryptoLogoPlaceholder]} />
              )}
              <View style={styles.cryptoDetails}>
                <Text style={[styles.cryptoName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.cryptoSymbol, { color: colors.textSecondary }]}>{item.symbol.toUpperCase()}</Text>
              </View>
            </View>
            
            <View style={styles.cryptoPriceContainer}>
              <Text style={[styles.cryptoPrice, { color: colors.text }]}>
                ${item.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text 
                style={[
                  styles.cryptoChange, 
                  { color: item.price_change_percentage_24h >= 0 ? colors.up : colors.down }
                ]}
              >
                {item.price_change_percentage_24h >= 0 ? '↑' : '↓'} {Math.abs(item.price_change_percentage_24h).toFixed(2)}%
              </Text>
            </View>
            
            <View style={styles.predictionButtons}>
              <TouchableOpacity
                style={[
                  styles.predictionButton,
                  selectedCryptos[item.id] === 'up' && { backgroundColor: colors.up }
                ]}
                onPress={() => handleCryptoSelect(item.id, 'up')}
              >
                <Text style={styles.predictionButtonText}>📈</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.predictionButton,
                  selectedCryptos[item.id] === 'down' && { backgroundColor: colors.down }
                ]}
                onPress={() => handleCryptoSelect(item.id, 'down')}
              >
                <Text style={styles.predictionButtonText}>📉</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginRight: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  headerButtonText: {
    fontWeight: '500',
  },
  themeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeButtonText: {
    fontSize: 16,
  },
  teamIndicator: {
    marginHorizontal: 16,
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  searchContainer: {
    margin: 16,
  },
  searchInput: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cryptoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  cryptoInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cryptoLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  cryptoLogoPlaceholder: {
    backgroundColor: '#ccc',
  },
  cryptoDetails: {
    marginLeft: 12,
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: '600',
  },
  cryptoSymbol: {
    fontSize: 12,
  },
  cryptoPriceContainer: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  cryptoPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  cryptoChange: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  predictionButtons: {
    flexDirection: 'column',
  },
  predictionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#333',
    alignItems: 'center',
    marginBottom: 4,
  },
  predictionButtonText: {
    fontSize: 16,
  },
});