import { useTheme } from '@/contexts/ThemeContext';
import { useNetworkSwitcher } from '@/hooks/useNetworkSwitcher';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
    
    setSelectedCryptos(prev => ({
      ...prev,
      [id]: prev[id] === prediction ? null : prediction
    }));
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.searchIconContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
            </View>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search cryptos..."
              placeholderTextColor={colors.textSecondary}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity style={styles.clearButton} onPress={() => setSearchTerm('')}>
                <Text style={[styles.clearButtonText, { color: colors.text }]}>✕</Text>
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
                <TouchableOpacity style={styles.actionButton} onPress={() => setIsVisible(true)} >
                  <Text style={[styles.actionText, { color: colors.primary }]}>View Team</Text>
                </TouchableOpacity>


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
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
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
            <View style={[styles.teamIndicator, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.teamText, { color: colors.textSecondary }]}>
                Team: {Object.keys(selectedCryptos).filter(id => selectedCryptos[id] !== null).length}/5 tokens selected
              </Text>
            </View>
          )}

          {/* Crypto list */}
          <View style={styles.cryptoList}>
            {filteredCryptos.map((item) => (
              <View 
                key={item.id} 
                style={[
                  styles.cryptoItem, 
                  { backgroundColor: colors.cardBackground },
                  selectedCryptos[item.id] && {
                    borderColor: selectedCryptos[item.id] === 'up' ? colors.up : colors.down,
                    borderWidth: 2,
                  }
                ]}
              >
                <View style={styles.cryptoRow}>
                  {/* Crypto logo */}
                  {item.image ? (
                    <Image 
                      source={{ uri: item.image }} 
                      style={styles.cryptoLogo}
                    />
                  ) : (
                    <View style={[styles.cryptoLogoPlaceholder, { backgroundColor: colors.cardBackground }]} />
                  )}
                  
                  <View style={styles.cryptoInfo}>
                    <Text style={[styles.cryptoName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.cryptoSymbol, { color: colors.textSecondary }]}>{item.symbol.toUpperCase()}</Text>
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
                      {item.price_change_percentage_24h >= 0 ? '↑' : '↓'} 
                      {Math.abs(item.price_change_percentage_24h).toFixed(2)}%
                    </Text>
                  </View>
                  
                  <View style={styles.cryptoActions}>
                    <TouchableOpacity
                      style={[
                        styles.actionButtonSmall,
                        selectedCryptos[item.id] === 'up' && { backgroundColor: colors.up + '20' }
                      ]}
                      onPress={() => handleCryptoSelect(item.id, 'up')}
                    >
                      <Text style={[
                        styles.actionTextSmall,
                        { color: selectedCryptos[item.id] === 'up' ? colors.up : colors.textSecondary }
                      ]}>↑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.actionButtonSmall,
                        selectedCryptos[item.id] === 'down' && { backgroundColor: colors.down + '20' }
                      ]}
                      onPress={() => handleCryptoSelect(item.id, 'down')}
                    >
                      <Text style={[
                        styles.actionTextSmall,
                        { color: selectedCryptos[item.id] === 'down' ? colors.down : colors.textSecondary }
                      ]}>↓</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
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
  cryptoList: {
    paddingBottom: 16,
  },
  cryptoItem: {
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  cryptoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cryptoLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  
  cryptoInfo: {
    flex: 1,
    marginLeft: 10,
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cryptoSymbol: {
    fontSize: 14,
    marginTop: 2,
  },
  cryptoPriceContainer: {
    alignItems: 'flex-end',
    marginRight: 15,
  },
  cryptoPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  cryptoChange: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  cryptoActions: {
    flexDirection: 'row',
  },
  actionButtonSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  actionTextSmall: {
    fontSize: 16,
    fontWeight: 'bold',
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
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0, // Reset default padding
    marginRight: 5, // Add margin to make space for clear button
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