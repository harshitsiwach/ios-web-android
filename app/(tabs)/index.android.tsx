import { useTheme } from '@/contexts/ThemeContext';
import { useNetworkSwitcher } from '@/hooks/useNetworkSwitcher';
import { BlurView } from 'expo-blur';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState, } from 'react';
import { ActivityIndicator, Alert, Animated, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from "react-native-modal";
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

export default function HomeScreen() {
  const { theme, colors, toggleTheme } = useTheme();
  const { switchToBase, getNetworkName, currentChain } = useNetworkSwitcher();
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCryptos, setSelectedCryptos] = useState<Record<string, 'up' | 'down' | null>>({});
  const [team, setTeam] = useState<TeamSelection[]>([]);
 const [isVisible, setIsVisible] = useState(false);
 const [isContestModalVisible, setIsContestModalVisible] = useState(false);
 const scaleAnimation = new Animated.Value(1);
  // Switch to Base network when this screen is focused
  useFocusEffect(
    useCallback(() => {
      if (currentChain?.id !== 8453) { // Base mainnet chain ID
        Alert.alert(
          'Network Switch Required',
          `Switch from ${getNetworkName(currentChain?.id)} to Base network?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Switch', 
              onPress: () => {
                switchToBase();
              }
            }
          ]
        );
      }
    }, [currentChain, getNetworkName, switchToBase])
  );

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

  // Filter cryptos based on search term
  const filteredCryptos = cryptos.filter(crypto => 
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Refresh function for pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchCryptoData();
  };

  // Handle crypto selection for up/down prediction
  const handleCryptoSelect = (id: string, prediction: 'up' | 'down') => {
    const currentSelections = Object.values(selectedCryptos).filter(Boolean).length;
    const isAlreadySelected = selectedCryptos[id] === prediction;
    
    if (!isAlreadySelected && currentSelections >= 5) {
      Alert.alert(
        'Team Full',
        'You can only select up to 5 tokens for your team.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    const newSelectedCryptos = {
      ...selectedCryptos,
      [id]: selectedCryptos[id] === prediction ? null : prediction
    };
    
    const newSelectionsCount = Object.values(newSelectedCryptos).filter(Boolean).length;
    
    // If we're going from 4 to 5 selections, trigger animation
    if (currentSelections < 5 && newSelectionsCount === 5) {
      // Trigger animation
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    setSelectedCryptos(newSelectedCryptos);
  };

  // View team function
  const viewTeam = () => {
    if (team.length === 0) {
      Alert.alert(
        'Empty Team',
        'Please select at least one token for your team.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    let teamMessage = `Your Team (${team.length}/5):
`;
    team.forEach((selection, index) => {
      const emoji = selection.prediction === 'up' ? '📈' : '📉';
      teamMessage += `${index + 1}. ${selection.crypto.name} (${selection.crypto.symbol.toUpperCase()}) ${emoji}
`;
    });
    
    Alert.alert(
      'Your Team',
      teamMessage,
      [{ text: 'OK' }]
    );
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
    <View style={[styles.container, { backgroundColor: 'rgba(10, 12, 22, 0.9)'}]}>
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[colors.primary]} 
            tintColor={colors.primary} 
          />
        }
      >
        <View style={styles.content}>
          {/* Header */}
          
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Search cryptos..."
            placeholderTextColor="#8b93a1"
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
          <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.headerContent}>
              <Image 
                source={{ uri: 'https://placehold.co/40' }} 
                style={styles.logo}
              />
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: colors.text }]}>Crypto Markets</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Real-time prices & trends</Text>
              </View>
              <View style={styles.headerActions}>
                


                  {/* modal */}
                  
      <Modal
        isVisible={isVisible}
        onBackdropPress={() => setIsVisible(false)} // close when tapping outside
        style={styles.modal}
      >
        <View style={[styles.sheet, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>Your Team</Text>
            <TouchableOpacity onPress={() => setIsVisible(false)}>
              <Text style={[styles.closeButton, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                ${team.reduce((sum, selection) => sum + selection.crypto.current_price, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Value</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {team.length > 0 ? (team.reduce((sum, selection) => sum + selection.crypto.price_change_percentage_24h, 0) / team.length).toFixed(2) + '%' : '0.00%'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg. Change</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {team.filter(selection => selection.prediction === 'up').length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Bullish</Text>
            </View>
          </View>

          {/* Team List */}
          {team.length > 0 ? (
            team.map((selection, index) => (
              <View key={selection.crypto.id} style={[styles.teamItem, { borderBottomColor: colors.border }]}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {selection.crypto.image ? (
                    <Image source={{ uri: selection.crypto.image }} style={styles.cryptoLogoSmall} />
                  ) : (
                    <View style={[styles.cryptoLogoPlaceholder, { backgroundColor: colors.cardBackground }]} />
                  )}
                  <Text style={[styles.coinName, { color: colors.text }]}>{selection.crypto.name}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                  <Text style={[styles.prediction, { color: selection.prediction === 'up' ? colors.up : colors.down, fontWeight: "bold" }]}>
                    {selection.prediction.toUpperCase()}
                  </Text>
                  <TouchableOpacity onPress={() => handleCryptoSelect(selection.crypto.id, selection.prediction)}>
                    <Text style={{ color: colors.primary, fontWeight: "bold" }}>
                      {selection.prediction === 'up' ? '📈' : '📉'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyTeamText, { color: colors.textSecondary }]}>No tokens selected yet</Text>
          )}

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitBtn, { backgroundColor: '#3B82F6' }]}
            onPress={() => {
              if (team.length === 0) {
                Alert.alert('Empty Team', 'Please select at least one token for your team.', [{ text: 'OK' }]);
                return;
              }
              setIsVisible(false);
              setIsContestModalVisible(true);
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Submit Team</Text>
          </TouchableOpacity>
        </View>
      </Modal>

              </View>
            </View>
          </View>

          {/* Contest Selection Modal */}
          <Modal
            isVisible={isContestModalVisible}
            onBackdropPress={() => setIsContestModalVisible(false)} // close when tapping outside
            style={styles.modal}
          >
            <View style={[styles.sheet, { backgroundColor: colors.cardBackground }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.title, { color: colors.text }]}>Select Contest</Text>
                <TouchableOpacity onPress={() => setIsContestModalVisible(false)}>
                  <Text style={[styles.closeButton, { color: colors.text }]}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Contest Selection List */}
              <View style={styles.contestList}>
                {[
                  { id: 'daily', name: 'Premiere League (Daily Challenge)', description: 'Predict price movements for the next 24 hours' },
                  { id: 'weekly', name: 'NBA Fantasy Challenge (Weekly Challenge)', description: 'Predict price movements for the next 7 days' },
                  { id: 'monthly', name: 'Grand Slam (Monthly Challenge)', description: 'Predict price movements for the next 30 days' },
                  
                ].map((contest) => (
                  <TouchableOpacity
                    key={contest.id}
                    style={[styles.contestItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      // Here you would handle contest selection
                      Alert.alert(
                        'Contest Selected',
                        `You selected: ${contest.name}\n\n${contest.description}`,
                        [{ text: 'OK' }]
                      );
                      setIsContestModalVisible(false);
                    }}
                  >
                    <View>
                      <Text style={[styles.contestName, { color: colors.text }]}>{contest.name}</Text>
                      <Text style={[styles.contestDescription, { color: colors.textSecondary }]}>{contest.description}</Text>
                    </View>
                    <Text style={{ color: colors.primary }}>→</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Modal>

          {/* Search Bar */}
          

          {/* Team selection indicator */}
          {Object.keys(selectedCryptos).filter(id => selectedCryptos[id] !== null).length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                if (Object.keys(selectedCryptos).filter(id => selectedCryptos[id] !== null).length >= 5) {
                  setIsVisible(true);
                }
              }}
            >
              <Animated.View style={[styles.teamIndicator, { backgroundColor: colors.cardBackground, transform: [{ scale: scaleAnimation }] }]}>
                
                <Text style={[styles.teamText, { color: colors.textSecondary }]}>
                  {Object.keys(selectedCryptos).filter(id => selectedCryptos[id] !== null).length >= 5 ? '⚡ View Team' : `Team: ${Object.keys(selectedCryptos).filter(id => selectedCryptos[id] !== null).length}/5 tokens selected`}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          )}

          {/* Crypto list */}
        
        <View style={{ marginTop: 10 }}>
          {filteredCryptos.map(item => (
            <BlurView key={item.id} intensity={40} tint="dark" style={styles.cryptoCard}>
              <View style={styles.cryptoRow}>
                <Image source={{ uri: item.image }} style={styles.cryptoLogo} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cryptoName}>{item.name}</Text>
                  <Text style={styles.cryptoSymbol}>{item.symbol.toUpperCase()}</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>${item.current_price.toLocaleString()}</Text>
                  <Text
                    style={[
                      styles.change,
                      { color: item.price_change_percentage_24h >= 0 ? '#00e676' : '#ff5252' },
                    ]}
                  >
                    {item.price_change_percentage_24h >= 0 ? '▲' : '▼'}{' '}
                    {Math.abs(item.price_change_percentage_24h).toFixed(2)}%
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleCryptoSelect(item.id, 'up')}
                  style={[
                    styles.actionBtn,
                    selectedCryptos[item.id] === 'up' && styles.selectedUp,
                  ]}
                >
                  <Text
                    style={[
                      styles.actionText,
                      { color: selectedCryptos[item.id] === 'up' ? '#00e676' : '#9aa0b3' },
                    ]}
                  >
                    ↑
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleCryptoSelect(item.id, 'down')}
                  style={[
                    styles.actionBtn,
                    selectedCryptos[item.id] === 'down' && styles.selectedDown,
                  ]}
                >
                  <Text
                    style={[
                      styles.actionText,
                      { color: selectedCryptos[item.id] === 'down' ? '#ff5252' : '#9aa0b3' },
                    ]}
                  >
                    ↓
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          ))}
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  modal: { justifyContent: "flex-end", margin: 0 }, // bottom sheet
  sheet: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
  },

  statsRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 15 },
  statBox: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 16, fontWeight: "bold" },
  statLabel: { fontSize: 12 },
  teamItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 5,
   
    
  },
  coinName: { fontSize: 16, marginLeft: 10 },
  prediction: { fontSize: 14, fontWeight: "bold" },
  submitBtn: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  cryptoLogoSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  cryptoLogoPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  emptyTeamText: {
    textAlign: "center",
    paddingVertical: 20,
    fontSize: 16,
  },
  closeButton: {
    fontSize: 18,
  },
  contestList: {
    marginTop: 15,
  },
  contestItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  contestName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  contestDescription: {
    fontSize: 14,
    marginTop: 5,
  },

  container: {
    flex: 1,
    
  },
  
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
  },


  content: {
    padding: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    paddingVertical: 8,
  },
  clearText: {
    color: '#9aa0b3',
    fontSize: 18,
    padding: 5,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
    
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 10,
    padding: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  teamIndicator: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  teamText: {
    fontSize: 14,
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
    alignItems: 'center',
  },
  cryptoLogo: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
  },
  cryptoName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  cryptoSymbol: {
    color: '#9aa0b3',
    fontSize: 13,
    marginTop: 2,
  },
    priceContainer: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  price: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  change: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  selectedUp: {
    backgroundColor: 'rgba(0,230,118,0.15)',
    borderWidth: 1,
    borderColor: '#00e676',
  },
  selectedDown: {
    backgroundColor: 'rgba(255,82,82,0.15)',
    borderWidth: 1,
    borderColor: '#ff5252',
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIconContainer: {
    marginRight: 10,
    justifyContent: 'center',
  },
  searchIcon: {
    fontSize: 18,
  },
  
  clearButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  clearButtonText: {
    fontSize: 18,
  },
});