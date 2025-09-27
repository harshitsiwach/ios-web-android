import { useChainId, useSwitchChain } from 'wagmi';
import { base, polygon, arbitrum } from '@wagmi/core/chains';

// Define network names mapping
const NETWORK_NAMES: { [key: number]: string } = {
  [base.id]: 'Base',
  [polygon.id]: 'Polygon',
  [arbitrum.id]: 'Arbitrum',
  1: 'Ethereum',
  5: 'Goerli',
  11155111: 'Sepolia',
  8453: 'Base',
  84532: 'Base Sepolia',
  137: 'Polygon',
  80001: 'Polygon Mumbai',
  42161: 'Arbitrum One',
  421613: 'Arbitrum Goerli',
};

export const useNetworkSwitcher = () => {
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  const switchToBase = () => {
    if (chainId !== base.id) {
      switchChain({ chainId: base.id });
    }
  };

  const switchToPolygon = () => {
    if (chainId !== polygon.id) {
      switchChain({ chainId: polygon.id });
    }
  };

  const switchToArbitrum = () => {
    if (chainId !== arbitrum.id) {
      switchChain({ chainId: arbitrum.id });
    }
  };

  const getNetworkName = (chainId?: number): string => {
    if (!chainId) return 'Unknown';
    return NETWORK_NAMES[chainId] || `Chain ${chainId}`;
  };

  return {
    currentChain: { id: chainId },
    switchToBase,
    switchToPolygon,
    switchToArbitrum,
    getNetworkName,
    isSwitching: isPending,
  };
};