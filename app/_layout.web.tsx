import 'react-native-url-polyfill/auto';
import '@walletconnect/react-native-compat'; // WalletConnect React Native compatibility
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { View, StyleSheet } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider as CustomThemeProvider } from '@/contexts/ThemeContext';

// Web3 polyfills for web platform
if (typeof window !== 'undefined') {
  // Ensure ethereum object is properly configured
  if (window.ethereum) {
    // If ethereum exists, make sure it's properly configured
    try {
      // Check if the property is already configurable
      const descriptor = Object.getOwnPropertyDescriptor(window, 'ethereum');
      if (descriptor && !descriptor.configurable) {
        // If not configurable, we can't modify it safely
        console.log('Ethereum object exists and is not configurable');
      }
    } catch (e) {
      console.warn('Could not check ethereum object descriptor:', e);
    }
  }
  
  // Add a helper to detect if we're in a web environment with an existing provider
  (window as any).hasExistingEthereumProvider = !!window.ethereum;
}

// Only import wallet providers
let WagmiProviderComponent: any = null;
let QueryClientProviderComponent: any = null;
let queryClientInstance: any = null;
let wagmiConfigInstance: any = null;
let AppKitComponent: any = null;
let createAppKit: any = null;

try {
  // Always load wagmi modules
  const wagmiModule = require('@/lib/wagmiConfig.web');
  WagmiProviderComponent = wagmiModule.WagmiProvider;
  QueryClientProviderComponent = wagmiModule.QueryClientProvider;
  queryClientInstance = wagmiModule.queryClient;
  wagmiConfigInstance = wagmiModule.wagmiConfig;
  
  // Load AppKit creation function
  const appKitModule = require('@reown/appkit-wagmi-react-native');
  createAppKit = appKitModule.createAppKit;
  
  // Check if ethereum is already defined to avoid conflicts
  if (typeof window !== 'undefined' && (window as any).hasExistingEthereumProvider) {
    // If ethereum is already defined, don't render AppKit to avoid conflicts
    AppKitComponent = () => null;
    console.log('Ethereum provider already exists, skipping AppKit UI');
  } else if (typeof window !== 'undefined') {
    // Only import AppKit component if we're going to use it
    AppKitComponent = appKitModule.AppKit;
    // Initialize AppKit only if no existing ethereum provider
    try {
      const projectId = wagmiModule.projectId || process.env.REOWN_PROJECT_ID || '69a707270e85426363932965ab26ed21';
      
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
      
      // Create AppKit instance
      createAppKit({
        projectId,
        metadata,
        wagmiConfig: wagmiConfigInstance,
        defaultChain: wagmiModule.chains[0], // Use first chain as default
        enableAnalytics: true,
        features: {
          onramp: true,
          swaps: true,
        },
      });
    } catch (initError) {
      console.warn('Failed to initialize AppKit:', initError);
      AppKitComponent = () => null;
    }
  }
} catch (error) {
  console.warn('Wallet providers not available:', error);
  // Fallback to minimal setup
  WagmiProviderComponent = ({ children }: any) => children;
  QueryClientProviderComponent = ({ children }: any) => children;
  AppKitComponent = () => null;
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // If wallet providers are not available, render without them
  if (!WagmiProviderComponent || !QueryClientProviderComponent) {
    return (
      <CustomThemeProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <View style={styles.container}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </View>
        </ThemeProvider>
      </CustomThemeProvider>
    );
  }

  return (
    <WagmiProviderComponent config={wagmiConfigInstance}>
      <QueryClientProviderComponent client={queryClientInstance}>
        <CustomThemeProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <View style={styles.container}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              <StatusBar style="auto" />
              {AppKitComponent && <AppKitComponent />}
            </View>
          </ThemeProvider>
        </CustomThemeProvider>
      </QueryClientProviderComponent>
    </WagmiProviderComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});