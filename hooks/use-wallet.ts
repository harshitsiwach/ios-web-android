import { useAppKit, useAppKitState } from '@reown/appkit-wagmi-react-native';
import { useAccount, useBalance } from 'wagmi';

export const useWallet = () => {
  const { open, close } = useAppKit();
  const { isConnected, isReconnecting, isConnecting } = useAccount();
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { open: isModalOpen } = useAppKitState();

  return {
    open,
    close,
    isConnected,
    isConnecting: isConnecting || isReconnecting,
    address,
    balance,
    isModalOpen,
  };
};