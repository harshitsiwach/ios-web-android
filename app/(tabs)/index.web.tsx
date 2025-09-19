import { useTheme } from '@/contexts/ThemeContext';
import { useEffect, useState } from 'react';
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

// Custom Alert component for web
const CustomAlert = ({ visible, title, message, onClose }: { visible: boolean; title: string; message: string; onClose: () => void }) => {
  const { colors } = useTheme();
  
  if (!visible) return null;
  
  return (
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.modalMessage, { color: colors.text }]}>{message}</Text>
        <TouchableOpacity 
          style={[styles.modalButton, { backgroundColor: colors.primary }]} 
          onPress={onClose}
        >
          <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const { theme, colors, toggleTheme } = useTheme();
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCryptos, setSelectedCryptos] = useState<Record<string, 'up' | 'down' | null>>({});
  const [team, setTeam] = useState<TeamSelection[]>([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // Show custom alert
  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

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
    
    let teamMessage = `Your Team (${team.length}/5):

`;
    team.forEach((selection, index) => {
      const emoji = selection.prediction === 'up' ? '📈' : '📉';
      teamMessage += `${index + 1}. ${selection.crypto.name} (${selection.crypto.symbol.toUpperCase()}) ${emoji}
`;
    });
    
    showAlert('Your Team', teamMessage);
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
      <CustomAlert 
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
      
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
                <TouchableOpacity style={styles.actionButton} onPress={viewTeam}>
                  <Text style={[styles.actionText, { color: colors.primary }]}>View Team</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={toggleTheme}>
                  <Text style={[styles.actionText, { color: colors.primary }]}>
                    {theme === 'dark' ? '☀️' : '🌙'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

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
            {cryptos.map((item) => (
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
  cryptoLogoPlaceholder: {
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    fontWeight: 'bold',
  },
});