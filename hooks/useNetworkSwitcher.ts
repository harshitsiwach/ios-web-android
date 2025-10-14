import { useWallet } from './use-wallet';
import { useChainId } from '@thirdweb-dev/react-native';

// Network names mapping
const NETWORK_NAMES: { [key: number]: string } = {
  1: 'Ethereum',
  5: 'Goerli',
  11155111: 'Sepolia',
  137: 'Polygon',
  80001: 'Polygon Mumbai',
  8453: 'Base',
  84532: 'Base Sepolia',
  42161: 'Arbitrum One',
  421613: 'Arbitrum Goerli',
  10: 'Optimism',
  420: 'Optimism Goerli',
};

export const useNetworkSwitcher = () => {
  const { switchChain } = useWallet();
  const chainId = useChainId();
  
  const getNetworkName = (chainId?: number): string => {
    if (!chainId) return 'Unknown';
    return NETWORK_NAMES[chainId] || `Chain ${chainId}`;
  };

  return {
    currentChain: { id: chainId },
    getNetworkName,
    switchChain,
  };
};