import { useNetworkSwitcher } from '@/hooks/useNetworkSwitcher';
import { ConnectWallet, useAddress, useBalance, useChainId, useConnectionStatus } from '@thirdweb-dev/react-native';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const WalletButton = () => {
  const address = useAddress();
  const connectionStatus = useConnectionStatus();
  const chainId = useChainId();
  const { data: balanceData } = useBalance();
  const { getNetworkName } = useNetworkSwitcher();
  const [isModalVisible, setModalVisible] = useState(false);

  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';

  const handleConnect = () => {
    if (!isConnected) {
      // Open modal to show connection options
      setModalVisible(true);
    } else {
      // Open modal with wallet details when already connected
      setModalVisible(true);
    }
  };

  const truncateAddress = (address: string): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <>
      <TouchableOpacity style={styles.button} onPress={handleConnect}>
        <Text style={styles.buttonText}>
          {isConnecting 
            ? 'Connecting...' 
            : isConnected 
              ? `${truncateAddress(address || '')} (${getNetworkName(chainId)})` 
              : 'Connect Wallet'}
        </Text>
      </TouchableOpacity>

      {/* Wallet Connection/Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {isConnected ? (
              <>
                <Text style={styles.modalTitle}>Wallet Connected</Text>
                <Text style={styles.addressLabel}>Address:</Text>
                <Text style={styles.addressText}>{address}</Text>
                <Text style={styles.networkLabel}>Network:</Text>
                <Text style={styles.networkText}>{getNetworkName(chainId)}</Text>
                <Text style={styles.balanceLabel}>Wallet Balance:</Text>
                <Text style={styles.balanceText}>{balanceData ? `${balanceData.displayValue} ${balanceData.symbol}` : 'Loading...'}</Text>
                <TouchableOpacity 
                  style={styles.disconnectButton} 
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.disconnectButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Connect Wallet</Text>
                <ConnectWallet 
                  theme="dark"
                  btnTitle="Connect Wallet"
                  modalSize="compact"
                />
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 'auto',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  addressText: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  networkText: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  networkLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  balanceText: {
    fontSize: 16,
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  disconnectButton: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  disconnectButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
  },
  closeButtonText: {
    color: '#888',
    fontWeight: 'bold',
  },
});

export default WalletButton;