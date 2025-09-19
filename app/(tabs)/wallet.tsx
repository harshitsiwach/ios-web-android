import { StyleSheet, View, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { AppKitButton } from '@reown/appkit-wagmi-react-native';
import { useWallet } from '@/hooks/use-wallet';
import { useEffect, useState } from 'react';

export default function WalletScreen() {
  const { colors } = useTheme();
  const { address, isConnected, isConnecting, open } = useWallet();
  const [refreshing, setRefreshing] = useState(false);
  
  const onRefresh = async () => {
    setRefreshing(true);
    // Add any refresh logic here if needed
    setRefreshing(false);
  };
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
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
        <Text style={[styles.title, { color: colors.text }]}>Wallet</Text>
        
        {!isConnected ? (
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Connect Your Wallet</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Connect your wallet to access crypto features and prediction markets
            </Text>
            
            <View style={styles.buttonContainer}>
              <AppKitButton />
            </View>
            
            <TouchableOpacity 
              style={[styles.customButton, { backgroundColor: colors.primary }]}
              onPress={() => open()}
            >
              <Text style={styles.customButtonText}>Custom Connect</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Wallet Info Card */}
            <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Wallet Connected</Text>
              
              <View style={styles.infoRow}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Address:</Text>
                <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
                  {address?.substring(0, 18)}...{address?.substring(address.length - 4)}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Status:</Text>
                <Text style={[styles.value, { color: '#4CAF50' }]}>Connected</Text>
              </View>
              
              {/* Removed balance display */}
              
              <TouchableOpacity 
                style={[styles.disconnectButton, { backgroundColor: colors.cardBackground, borderColor: colors.textSecondary }]}
                onPress={() => open()}
              >
                <Text style={[styles.disconnectButtonText, { color: colors.text }]}>
                  Manage Wallet
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Features */}
            <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Features</Text>
              
              <View style={styles.featureItem}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>Prediction Markets</Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  Trade on real-world events with Polymarket integration
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>Crypto Trading</Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  Access perpetual futures with Hyperliquid
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>Portfolio Tracking</Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  Monitor your positions and performance
                </Text>
              </View>
            </View>
          </>
        )}
        
        {/* Connection status indicator */}
        <View style={[styles.statusIndicator, { 
          backgroundColor: isConnected ? '#4CAF50' : (isConnecting ? '#FFC107' : '#F44336') 
        }]} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  buttonContainer: {
    marginVertical: 10,
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
  disconnectButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 1,
  },
  disconnectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  featureItem: {
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignSelf: 'center',
    marginBottom: 20,
  },
});