import 'react-native-url-polyfill/auto';
import '@walletconnect/react-native-compat'; // WalletConnect React Native compatibility
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { View, StyleSheet } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider as CustomThemeProvider } from '@/contexts/ThemeContext';

// Conditional import for wallet providers to handle errors gracefully
let walletProviders: {
  WagmiProvider?: any;
  QueryClientProvider?: any;
  queryClient?: any;
  wagmiConfig?: any;
  AppKit?: any;
} = {};

try {
  const wagmiModule = require('@/lib/wagmiConfig');
  // Load AppKit creation function
  const { createAppKit } = require('@reown/appkit-wagmi-react-native');
  
  // Initialize AppKit only on native platforms
  if (typeof window === 'undefined' || !(window as any).hasExistingEthereumProvider) {
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
      
      createAppKit({
        projectId,
        metadata,
        wagmiConfig: wagmiModule.wagmiConfig,
        defaultChain: wagmiModule.chains[0], // Use first chain as default
        enableAnalytics: true,
        features: {
          onramp: true,
          swaps: true,
        },
      });
    } catch (initError) {
      console.warn('Failed to initialize AppKit on native platform:', initError);
    }
  }
  
  walletProviders = {
    WagmiProvider: wagmiModule.WagmiProvider,
    QueryClientProvider: wagmiModule.QueryClientProvider,
    queryClient: wagmiModule.queryClient,
    wagmiConfig: wagmiModule.wagmiConfig,
    AppKit: (typeof window !== 'undefined' && (window as any).hasExistingEthereumProvider) 
      ? () => null 
      : require('@reown/appkit-wagmi-react-native').AppKit,
  };
} catch (error) {
  console.warn('Wallet providers not available, running without wallet functionality:', error);
  walletProviders = {};
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const {
    WagmiProvider,
    QueryClientProvider,
    queryClient,
    wagmiConfig,
    AppKit
  } = walletProviders;

  // If wallet providers are not available, render without them
  if (!WagmiProvider || !QueryClientProvider || !queryClient || !wagmiConfig || !AppKit) {
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
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <CustomThemeProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <View style={styles.container}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              <StatusBar style="auto" />
              {AppKit && <AppKit />}
            </View>
          </ThemeProvider>
        </CustomThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});