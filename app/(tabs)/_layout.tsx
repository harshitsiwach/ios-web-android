import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs 
      appearance="liquid-glass"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFA500',
        tabBarInactiveTintColor: '#888888',
      }}
    >
      <NativeTabs.Trigger name="index">
        <Icon systemName="house.fill" />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="polymarket">
        <Icon systemName="chart.bar.xaxis" />
        <Label>Polymarket</Label>
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="hyperliquid">
        <Icon systemName="chart.line.uptrend.xyaxis" />
        <Label>Hyperliquid</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="news">
        <Icon systemName="newspaper.fill" />
        <Label>News</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <Icon systemName="magnifyingglass" />
        <Label>Search</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
