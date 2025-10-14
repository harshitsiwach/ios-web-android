import { useAddress, useConnectionStatus, useDisconnect, useBalance, useChainId, useActiveWallet } from '@thirdweb-dev/react-native';
import { Base, Polygon, Mumbai, Arbitrum, Optimism } from '@thirdweb-dev/chains';

// Define supported chains
export const supportedChains = {
  polygon: Polygon,
  mumbai: Mumbai,
  base: Base, // Using Base for mainnet
  arbitrum: Arbitrum,
  optimism: Optimism
};

export const useWallet = () => {
  const address = useAddress();
  const connectionStatus = useConnectionStatus();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance();
  const chainId = useChainId();
  const activeWallet = useActiveWallet();

  return {
    address,
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    isReconnecting: connectionStatus === 'reconnecting',
    wallet: activeWallet,
    balance,
    chainId,
    connect: () => {
      // Connect functionality will be handled by Thirdweb's built-in UI components
    },
    disconnect: () => {
      disconnect();
    },
    switchChain: async (chain: keyof typeof supportedChains) => {
      if (activeWallet) {
        try {
          await activeWallet.switchChain(supportedChains[chain].chainId);
          return true;
        } catch (error) {
          console.error('Error switching chain:', error);
          return false;
        }
      }
      return false;
    }
  };
};