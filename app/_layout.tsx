import 'react-native-url-polyfill/auto';
import '@walletconnect/react-native-compat'; // WalletConnect React Native compatibility
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { View, StyleSheet } from 'react-native';
import WalletButton from '@/components/WalletButton';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider as CustomThemeProvider } from '@/contexts/ThemeContext';

// Import Thirdweb components
import { ThirdwebProvider } from '@thirdweb-dev/react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThirdwebProvider
      activeChain="base" // Set default chain to Base
      supportedChains={['base', 'polygon', 'ethereum']} // Supported chains
    >
      <CustomThemeProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <View style={styles.container}>
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: colorScheme === 'dark' ? '#000000' : '#F0F0F0',
                },
                headerTintColor: colorScheme === 'dark' ? '#FFA500' : '#FF6B00',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
                headerRight: () => <WalletButton />,
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </View>
        </ThemeProvider>
      </CustomThemeProvider>
    </ThirdwebProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});