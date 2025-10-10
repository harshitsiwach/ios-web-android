import WalletButton from '@/components/WalletButton';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TabLayout() {
  const { colors, theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <View style={styles.headerRightContainer}>
            <WalletButton />
            <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
              <Text style={[styles.themeToggleText, { color: colors.primary }]}>
                {isDark ? '☀️' : '🌙'}
              </Text>
            </TouchableOpacity>
          </View>
        ),
        tabBarActiveTintColor: isDark ? '#60A5FA' : colors.primary, // neon blue in dark mode
        tabBarInactiveTintColor: isDark ? 'rgba(255,255,255,0.6)' : colors.textSecondary,
        tabBarBackground: () => (
          <BlurView
            tint={isDark ? 'dark' : 'light'}
            intensity={isDark ? 85 : 60}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarStyle: [
          styles.tabBarBase,
          isDark ? styles.tabBarDark : styles.tabBarLight,
        ],
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={color}
              style={focused && isDark && styles.activeGlow}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="polymarket"
        options={{
          title: 'Polymarket',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'bar-chart' : 'bar-chart-outline'}
              size={22}
              color={color}
              style={focused && isDark && styles.activeGlow}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="hyperliquid"
        options={{
          title: 'Hyperliquid',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'trending-up' : 'trending-up-outline'}
              size={22}
              color={color}
              style={focused && isDark && styles.activeGlow}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'newspaper' : 'newspaper-outline'}
              size={22}
              color={color}
              style={focused && isDark && styles.activeGlow}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="aster"
        options={{
          title: 'Aster',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'sparkles' : 'sparkles-outline'}
              size={22}
              color={color}
              style={focused && isDark && styles.activeGlow}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  themeToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 10,
  },
  themeToggleText: {
    fontSize: 18,
  },

  // Base shared tabbar style
  tabBarBase: {
    position: 'relative',
    bottom: 0,
    left: 20,
    right: 20,
    borderRadius: 25,
    height: 70,
    borderTopWidth: 0,
    overflow: 'hidden',
  },

  // 🔥 Dark theme look
  tabBarDark: {
    backgroundColor: 'rgba(10, 10, 15, 0.6)',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    elevation: 0, // remove black edge
  },

  // ☀️ Light theme fallback
  tabBarLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },

  // Neon glow on active icons
  activeGlow: {
    textShadowColor: '#3B82F6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});
