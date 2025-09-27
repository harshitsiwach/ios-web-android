import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { AppKitButton } from '@reown/appkit-wagmi-react-native';
import { useWallet } from '@/hooks/use-wallet';
import { useNetworkSwitcher } from '@/hooks/useNetworkSwitcher';
import { useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { address, isConnected, open } = useWallet();
  const { switchToBase, getNetworkName, currentChain } = useNetworkSwitcher();
  
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
  
  const handleCustomConnect = () => {
    open();
  };
  
  const showWalletInfo = () => {
    if (isConnected && address) {
      Alert.alert(
        'Wallet Connected',
        `Address: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
        [{ text: 'OK' }]
      );
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.title, { color: colors.text }]}>Home</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          Welcome to the Glass App
        </Text>
        
        {/* Connection status */}
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, { color: colors.text }]}>
            Wallet Status: {isConnected ? 'Connected' : 'Not Connected'}
          </Text>
          {isConnected && address && (
            <Text style={[styles.addressText, { color: colors.textSecondary }]} numberOfLines={1}>
              {address.substring(0, 10)}...{address.substring(address.length - 8)}
            </Text>
          )}
        </View>
        
        {/* Reown Wallet Connection Button */}
        <View style={styles.walletButtonContainer}>
          <AppKitButton />
        </View>
        
        {/* Custom connect button */}
        <TouchableOpacity 
          style={[styles.customButton, { backgroundColor: colors.primary }]}
          onPress={isConnected ? showWalletInfo : handleCustomConnect}
        >
          <Text style={styles.customButtonText}>
            {isConnected ? 'Show Wallet Info' : 'Connect Wallet'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    padding: 30,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  statusContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  walletButtonContainer: {
    marginVertical: 20,
    width: '100%',
  },
  customButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  customButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});