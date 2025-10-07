import { WagmiProvider } from 'wagmi';
import { mainnet, polygon, arbitrum, optimism, base, bsc } from '@wagmi/core/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { defaultWagmiConfig } from '@reown/appkit-wagmi-react-native';

// Get project ID from environment variables
const projectId = process.env.REOWN_PROJECT_ID || '69a707270e85426363932965ab26ed21';

// Metadata for the app
const metadata = {
  name: 'Glass App',
  description: 'Prediction markets and crypto trading app',
  url: 'https://glass.app',
  icons: ['https://glass.app/icon.png'],
  redirect: {
    native: 'glass://',
    universal: 'https://glass.app',
  },
};

// Supported chains
const chains = [mainnet, polygon, arbitrum, optimism, base, bsc] as const;

// Create wagmi config
const wagmiConfig = defaultWagmiConfig({ 
  chains, 
  projectId, 
  metadata,
});

// Create query client
const queryClient = new QueryClient();

// Export everything except AppKit creation, which will be handled in the layout file
export { 
  WagmiProvider, 
  QueryClientProvider, 
  queryClient, 
  wagmiConfig,
  projectId,
  chains
};