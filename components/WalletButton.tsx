import { useNetworkSwitcher } from '@/hooks/useNetworkSwitcher';
import { useAppKit } from '@reown/appkit-wagmi-react-native';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

const WalletButton = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const { getNetworkName } = useNetworkSwitcher();
  const [isModalVisible, setModalVisible] = useState(false);

  const handleConnect = () => {
    if (!isConnected) {
      // Try using Reown AppKit first for a better wallet connection experience
      open();
    } else {
      // Open modal with wallet details when already connected
      setModalVisible(true);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setModalVisible(false);
  };

  const truncateAddress = (address: string): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <>
      <TouchableOpacity style={styles.button} onPress={handleConnect}>
        <Text style={styles.buttonText}>
          {isConnected ? truncateAddress(address as string) : 'Connect Wallet'}
        </Text>
      </TouchableOpacity>

      {/* Wallet Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Wallet Connected</Text>
            <Text style={styles.addressLabel}>Address:</Text>
            <Text style={styles.addressText}>{address}</Text>
            <Text style={styles.networkLabel}>Network:</Text>
            <Text style={styles.networkText}>{getNetworkName()}</Text>
            <TouchableOpacity 
              style={styles.disconnectButton} 
              onPress={handleDisconnect}
            >
              <Text style={styles.disconnectButtonText}>Disconnect</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
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
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  networkLabel: {
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