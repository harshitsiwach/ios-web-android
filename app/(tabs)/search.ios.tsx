import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native';

import {
  Host,
  VStack,
  Text as SwiftUIText,
} from '@expo/ui/swift-ui';
import { glassEffect, padding, clipShape } from '@expo/ui/swift-ui/modifiers';
import { useTheme } from '@/contexts/ThemeContext';

export default function SearchScreen() {
  const { colors } = useTheme();
  
  return (
    <Host style={[styles.container, { backgroundColor: colors.background }]}>
      <VStack 
        modifiers={[
          glassEffect({ glass: { variant: 'regular' } }),
          padding({ all: 20 }),
          clipShape('roundedRectangle', { cornerRadius: 16 })
        ]}
        style={styles.glassContainer}
      >
        <SwiftUIText size={24} weight="bold" color={colors.text}>
          Search
        </SwiftUIText>
        <SwiftUIText size={16} color={colors.textSecondary} style={styles.comingSoon}>
          Coming soon...
        </SwiftUIText>
      </VStack>
    </Host>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    padding: 30,
  },
  comingSoon: {
    marginTop: 10,
  },
});