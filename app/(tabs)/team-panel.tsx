import { useTheme } from '@/contexts/ThemeContext';
import { useWallet } from '@/hooks/use-wallet';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

// Define the crypto data structure
type Cryptocurrency = {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  image?: string;
};

// Define the team selection structure
type TeamSelection = {
  crypto: Cryptocurrency;
  prediction: 'up' | 'down';
  isCaptain?: boolean;
  isViceCaptain?: boolean;
};

const TeamPanelScreen = () => {
  const { colors } = useTheme();
  const { address, isConnected } = useWallet();
  const params = useLocalSearchParams();
  const [team, setTeam] = useState<TeamSelection[]>([]);
  const [captainIndex, setCaptainIndex] = useState<number | null>(null);
  const [viceCaptainIndex, setViceCaptainIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get team data from navigation parameters or stored in the app
  useEffect(() => {
    // Check if team data was passed through navigation parameters
    if (params.teamData) {
      try {
        const decodedTeamData = decodeURIComponent(params.teamData as string);
        const parsedTeam = JSON.parse(decodedTeamData);
        setTeam(parsedTeam);
      } catch (error) {
        console.error('Error parsing team data from params:', error);
        // Fallback to sample data
        const sampleTeam: TeamSelection[] = [
          { 
            crypto: {
              id: 'bitcoin',
              name: 'Bitcoin',
              symbol: 'BTC',
              current_price: 50000,
              price_change_percentage_24h: 2.5,
            },
            prediction: 'up'
          },
          { 
            crypto: {
              id: 'ethereum',
              name: 'Ethereum',
              symbol: 'ETH',
              current_price: 3000,
              price_change_percentage_24h: -1.2,
            },
            prediction: 'down'
          },
          { 
            crypto: {
              id: 'solana',
              name: 'Solana',
              symbol: 'SOL',
              current_price: 150,
              price_change_percentage_24h: 5.3,
            },
            prediction: 'up'
          },
          { 
            crypto: {
              id: 'cardano',
              name: 'Cardano',
              symbol: 'ADA',
              current_price: 0.5,
              price_change_percentage_24h: 0.8,
            },
            prediction: 'up'
          },
          { 
            crypto: {
              id: 'ripple',
              name: 'Ripple',
              symbol: 'XRP',
              current_price: 0.6,
              price_change_percentage_24h: -0.5,
            },
            prediction: 'down'
          },
        ];
        setTeam(sampleTeam);
      }
    } else {
      // Fallback to sample data if no team data was passed
      const sampleTeam: TeamSelection[] = [
        { 
          crypto: {
            id: 'bitcoin',
            name: 'Bitcoin',
            symbol: 'BTC',
            current_price: 50000,
            price_change_percentage_24h: 2.5,
          },
          prediction: 'up'
        },
        { 
          crypto: {
            id: 'ethereum',
            name: 'Ethereum',
            symbol: 'ETH',
            current_price: 3000,
            price_change_percentage_24h: -1.2,
          },
          prediction: 'down'
        },
        { 
          crypto: {
            id: 'solana',
            name: 'Solana',
            symbol: 'SOL',
            current_price: 150,
            price_change_percentage_24h: 5.3,
          },
          prediction: 'up'
        },
        { 
          crypto: {
            id: 'cardano',
            name: 'Cardano',
            symbol: 'ADA',
            current_price: 0.5,
            price_change_percentage_24h: 0.8,
          },
          prediction: 'up'
        },
        { 
          crypto: {
            id: 'ripple',
            name: 'Ripple',
            symbol: 'XRP',
            current_price: 0.6,
            price_change_percentage_24h: -0.5,
          },
          prediction: 'down'
        },
      ];
      setTeam(sampleTeam);
    }
    
    setLoading(false);
  }, [params.teamData]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refetching team data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const selectCaptain = (index: number) => {
    if (index === viceCaptainIndex) {
      Alert.alert('Selection Error', 'A token cannot be both Captain and Vice Captain.');
      return;
    }
    setCaptainIndex(index);
    
    // Update team with captain selection
    const updatedTeam = [...team];
    updatedTeam.forEach((item, idx) => {
      item.isCaptain = idx === index;
    });
    setTeam(updatedTeam);
  };

  const selectViceCaptain = (index: number) => {
    if (index === captainIndex) {
      Alert.alert('Selection Error', 'A token cannot be both Captain and Vice Captain.');
      return;
    }
    setViceCaptainIndex(index);
    
    // Update team with vice captain selection
    const updatedTeam = [...team];
    updatedTeam.forEach((item, idx) => {
      item.isViceCaptain = idx === index;
    });
    setTeam(updatedTeam);
  };

  const submitTeam = () => {
    if (captainIndex === null || viceCaptainIndex === null) {
      Alert.alert('Missing Selection', 'Please select both a Captain and a Vice Captain.');
      return;
    }
    
    // Verify wallet is connected before navigating to contests
    if (!isConnected || !address) {
      Alert.alert('Wallet Required', 'Please connect your wallet to submit a team.');
      return;
    }
    
    // Navigate to contest selection page
    router.push('/(tabs)/contest-selection');
  };

  const renderTeamItem = ({ item, index }: { item: TeamSelection; index: number }) => {
    const isCaptain = index === captainIndex;
    const isViceCaptain = index === viceCaptainIndex;
    const isUp = item.prediction === 'up';
    const changeColor = isUp ? colors.up : colors.down;

    return (
      <View style={[styles.teamItem, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 }]}>
        <View style={styles.cryptoInfo}>
          <Text style={[styles.cryptoName, { color: colors.text }]}>
            {item.crypto.name} ({item.crypto.symbol.toUpperCase()})
          </Text>
          <Text style={[styles.cryptoPrice, { color: colors.text }]}>
            ${item.crypto.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View style={styles.predictionContainer}>
            <Text style={[styles.prediction, { color: changeColor }]}>
              {isUp ? '📈 Up' : '📉 Down'} {Math.abs(item.crypto.price_change_percentage_24h).toFixed(2)}%
            </Text>
          </View>
        </View>
        
        <View style={styles.selectionButtons}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              isCaptain && { backgroundColor: colors.up }
            ]}
            onPress={() => selectCaptain(index)}
          >
            <Text style={[styles.roleButtonText, isCaptain && { color: 'white' }]}>
              {isCaptain ? 'Captain ✓' : 'Set Captain'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.roleButton,
              isViceCaptain && { backgroundColor: colors.primary }
            ]}
            onPress={() => selectViceCaptain(index)}
          >
            <Text style={[styles.roleButtonText, isViceCaptain && { color: 'white' }]}>
              {isViceCaptain ? 'Vice Cap ✓' : 'Set VC'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading team...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text, fontSize: 20, fontWeight: 'bold' }]}>Your Team</Text>
        <Text style={[styles.teamSize, { color: colors.textSecondary }]}>5/5 tokens selected</Text>
      </View>
      
      <FlatList
        data={team}
        renderItem={renderTeamItem}
        keyExtractor={(item, index) => `${item.crypto.id}-${index}`}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No tokens in your team yet
          </Text>
        }
      />
      
      <TouchableOpacity 
        style={[styles.submitButton, { backgroundColor: colors.primary }]}
        onPress={submitTeam}
      >
        <Text style={styles.submitButtonText}>Submit Team</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TeamPanelScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    marginBottom: 4,
  },
  teamSize: {
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  teamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  cryptoInfo: {
    flex: 1,
    marginRight: 12,
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cryptoPrice: {
    fontSize: 14,
    marginBottom: 4,
  },
  predictionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prediction: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectionButtons: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  roleButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: '#333',
    minWidth: 100,
    alignItems: 'center',
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  submitButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});