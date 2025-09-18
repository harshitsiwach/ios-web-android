import { StyleSheet, Image, Alert, RefreshControl } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
// import { AppKitButton } from '@reown/appkit-wagmi-react-native';

import {
  Host,
  VStack,
  HStack,
  Text as SwiftUIText,
  Button,
  Spacer,
  List,
} from '@expo/ui/swift-ui';
import { glassEffect, padding, clipShape } from '@expo/ui/swift-ui/modifiers';

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
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCryptos, setSelectedCryptos] = useState<Record<string, 'up' | 'down' | null>>({});
  const [team, setTeam] = useState<TeamSelection[]>([]);

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
      <Host style={[styles.container, { backgroundColor: colors.background }]}>
        <VStack spacing={10} alignment="center">
          <ActivityIndicator size="large" color={colors.primary} />
          <SwiftUIText size={16} color="secondary">Loading crypto prices...</SwiftUIText>
        </VStack>
      </Host>
    );
  }

  return (
    <Host style={[styles.container, { backgroundColor: colors.background }]}>
      <VStack spacing={15}>
        {/* Header with enhanced glass effect */}
        <VStack 
          modifiers={[
            glassEffect({ glass: { variant: 'regular' } }),
            padding({ horizontal: 15, vertical: 12 }),
            clipShape('roundedRectangle', { cornerRadius: 16 })
          ]}
        >
          <HStack alignment="center">
            <Image 
              source={{ uri: 'https://placehold.co/40' }} 
              style={styles.logo}
            />
            <VStack alignment="leading" spacing={2} modifiers={[padding({ horizontal: 10 })]}>
              <SwiftUIText size={20} weight="bold">Crypto Markets</SwiftUIText>
              <SwiftUIText size={14} color="secondary">Real-time prices & trends</SwiftUIText>
            </VStack>
            <Spacer />
            <HStack spacing={10}>
              <Button variant="glass" onPress={viewTeam}>
                <SwiftUIText size={16}>View Team</SwiftUIText>
              </Button>
              <Button variant="glass" systemImage="magnifyingglass" />
              <Button variant="glass" onPress={toggleTheme} systemImage={theme === 'dark' ? 'sun.max' : 'moon'} />
            </HStack>
          </HStack>
        </VStack>

        {/* Team selection indicator */}
        {Object.keys(selectedCryptos).filter(id => selectedCryptos[id] !== null).length > 0 && (
          <HStack 
            alignment="center" 
            modifiers={[
              glassEffect({ glass: { variant: 'clear' } }),
              padding({ horizontal: 15, vertical: 8 }),
              clipShape('capsule')
            ]}
            style={{ alignSelf: 'center' }}
          >
            <SwiftUIText size={14} color="secondary">
              Team: {Object.keys(selectedCryptos).filter(id => selectedCryptos[id] !== null).length}/5 tokens selected
            </SwiftUIText>
          </HStack>
        )}

        {/* Crypto list with enhanced glass effect and pill-shaped items */}
        <List scrollEnabled={true} listStyle="plain">
          {cryptos.map((item) => (
            <VStack 
              key={item.id} 
              modifiers={[
                glassEffect({ glass: { variant: 'regular' } }), 
                padding({ vertical: 12, horizontal: 15 }), 
                clipShape('capsule'), // Pill-shaped design for modern look
                ...(selectedCryptos[item.id] ? [
                  { 
                    // Add a subtle glow effect for selected items
                    shadowColor: selectedCryptos[item.id] === 'up' ? colors.up : colors.down,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4
                  }
                ] : [])
              ]}
            >
              <HStack alignment="center">
                {/* Crypto logo */}
                {item.image ? (
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.cryptoLogo}
                  />
                ) : (
                  <VStack 
                    modifiers={[
                      glassEffect({ glass: { variant: 'clear' } }),
                      clipShape('circle')
                    ]}
                    style={styles.cryptoLogoPlaceholder}
                  />
                )}
                
                <VStack alignment="leading" spacing={4} modifiers={[padding({ horizontal: 10 })]}>
                  <SwiftUIText size={16} weight="bold">{item.name}</SwiftUIText>
                  <SwiftUIText size={14} color="secondary">{item.symbol.toUpperCase()}</SwiftUIText>
                </VStack>
                <Spacer />
                <VStack alignment="trailing" spacing={4}>
                  <SwiftUIText size={16}>${item.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</SwiftUIText>
                  <SwiftUIText 
                    size={14}
                    weight="medium"
                    color={item.price_change_percentage_24h >= 0 ? colors.up : colors.down}
                  >
                    {item.price_change_percentage_24h >= 0 ? '↑' : '↓'} 
                    {Math.abs(item.price_change_percentage_24h).toFixed(2)}%
                  </SwiftUIText>
                </VStack>
                <HStack spacing={8} modifiers={[padding({ leading: 15 })]}>
                  <Button
                    variant="glass"
                    size="small"
                    onPress={() => handleCryptoSelect(item.id, 'up')}
                    systemImage="arrow.up"
                    tint={selectedCryptos[item.id] === 'up' ? colors.up : 'gray'}
                    modifiers={[padding({ all: 8 })]}
                  />
                  <Button
                    variant="glass"
                    size="small"
                    onPress={() => handleCryptoSelect(item.id, 'down')}
                    systemImage="arrow.down"
                    tint={selectedCryptos[item.id] === 'down' ? colors.down : 'gray'}
                    modifiers={[padding({ all: 8 })]}
                  />
                </HStack>
              </HStack>
            </VStack>
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
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  cryptoLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  cryptoLogoPlaceholder: {
    width: 32,
    height: 32,
  },
});
