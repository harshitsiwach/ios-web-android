# Expo SDK 54 Liquid Glass & Native UI Components Guide

A comprehensive guide to implementing iOS 26 Liquid Glass components and native UI features in Expo SDK 54 applications.

## Overview

Expo SDK 54 introduces native liquid glass support for iOS 26, bringing Apple's stunning glass design language to React Native applications through multiple implementation approaches:

- **expo-glass-effect**: UIKit-based glass components using `UIVisualEffectView`
- **expo-liquid-glass-view**: SwiftUI-powered liquid glass views with advanced customization
- **Expo UI (Beta)**: SwiftUI primitives with glass modifiers for React Native
- **Expo Router v6**: Native tabs with automatic liquid glass styling

---

## 🚀 Quick Start

### Installation

```bash
# Create new Expo SDK 54 app
npx create-expo-app@latest my-glass-app
cd my-glass-app

# Install liquid glass libraries
npx expo install expo-glass-effect
npx expo install expo-liquid-glass-view
npx expo install @expo/ui

# For iOS development
cd ios && pod install
```

### Platform Requirements

- **iOS 26+** for liquid glass effects
- **Xcode 16.1+** for compilation
- **macOS 14+** for development
- Automatic fallback to regular views on unsupported platforms

---

## 📦 Core Components & APIs

### 1. expo-glass-effect (Recommended for Most Apps)

The primary library for liquid glass effects using native iOS `UIVisualEffectView`.

#### GlassView Component

```jsx
import { GlassView } from 'expo-glass-effect';

<GlassView 
  style={styles.glassContainer}
  glassEffectStyle="regular" // 'regular' | 'clear'
  tintColor="#ffffff"
  isInteractive={false}
>
  {/* Your content */}
</GlassView>
```

**Props:**
- `glassEffectStyle`: `'regular'` | `'clear'` (default: `'regular'`)
- `tintColor`: Custom tint color overlay
- `isInteractive`: Boolean for touch interaction (set once on mount)

#### GlassContainer Component

Groups multiple glass views with unified visual effects:

```jsx
import { GlassContainer, GlassView } from 'expo-glass-effect';

<GlassContainer spacing={10} style={styles.container}>
  <GlassView style={styles.glass1} />
  <GlassView style={styles.glass2} />
  <GlassView style={styles.glass3} />
</GlassContainer>
```

**Props:**
- `spacing`: Distance threshold for glass element merging effects

#### Utility Functions

```jsx
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { AccessibilityInfo } from 'react-native';

// Check component availability
const hasGlass = isLiquidGlassAvailable();

// Check user accessibility settings
const reducedTransparency = await AccessibilityInfo.isReduceTransparencyEnabled();
```

### 2. expo-liquid-glass-view (SwiftUI-Powered)

Advanced SwiftUI-based glass views with extensive customization options.

```jsx
import { ExpoLiquidGlassView, CornerStyle, LiquidGlassType } from "expo-liquid-glass-view";

<ExpoLiquidGlassView
  type={LiquidGlassType.Tint}
  tint="#000000"
  cornerRadius={24}
  cornerStyle={CornerStyle.Circular}
  style={{ width: 200, height: 200 }}
>
  <Text style={{ color: "#fff", textAlign: "center" }}>
    Liquid Glass ✨
  </Text>
</ExpoLiquidGlassView>
```

**Advanced Props:**
- `type`: `"clear"` | `"tint"` | `"regular"` | `"interactive"` | `"identity"`
- `tint`: System material tint or custom color
- `cornerRadius`: Border radius in points (default: 12)
- `cornerStyle`: `"continuous"` | `"circular"` (default: "continuous")

**Type Definitions:**
```typescript
enum CornerStyle {
  Continuous = "continuous",
  Circular = "circular",
}

enum LiquidGlassType {
  Clear = "clear",
  Tint = "tint", 
  Regular = "regular",
  Interactive = "interactive",
  Identity = "identity",
}
```

### 3. Expo UI SwiftUI Primitives (Beta)

Native SwiftUI components with glass modifiers for React Native.

```jsx
import { Host, HStack, VStack, Text, Button } from "@expo/ui/swift-ui";
import { glassEffect, padding } from '@expo/ui/swift-ui/modifiers';

export default function App() {
  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={16}>
        {/* Glass text with modifiers */}
        <Text
          size={32}
          modifiers={[
            padding({ all: 16 }),
            glassEffect({ glass: { variant: 'regular' } })
          ]}
        >
          Glass Effect Text
        </Text>
        
        {/* Glass buttons */}
        <Button 
          variant="glassProminent" 
          color="orange"
          systemImage="questionmark.circle"
        >
          Help & Support
        </Button>
        
        <Button 
          variant="glass" 
          systemImage="person"
        >
          View Profile
        </Button>
      </VStack>
    </Host>
  );
}
```

**Key Features:**
- **Host Component**: Required wrapper for Expo UI views
- **Modifiers**: Array-based styling system similar to SwiftUI
- **Button Variants**: `glass`, `glassProminent` with system icons
- **Layout Components**: `HStack`, `VStack` for native layouts

---

## 🧭 Expo Router v6 Native Tabs

Expo Router v6 automatically provides liquid glass tab bars on iOS 26+ with zero configuration.

### Basic Implementation

```jsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings', 
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="cog" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Native Tabs (Experimental)

For full native platform styling:

```jsx
// Use native tabs for platform-specific appearance
import { NativeTabs } from 'expo-router/native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Screen name="index" />
      <NativeTabs.Screen name="settings" />
    </NativeTabs>
  );
}
```

**Features:**
- Automatic liquid glass styling on iOS 26+
- Native material tabs on Android
- Adaptive color schemes (light/dark)
- System-level accessibility support

---

## 💡 Implementation Patterns

### Platform-Specific Rendering

```jsx
import { Platform } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

export function AdaptiveGlassView({ children, style }) {
  if (Platform.OS === 'ios' && isLiquidGlassAvailable()) {
    return (
      <GlassView style={style} glassEffectStyle="regular">
        {children}
      </GlassView>
    );
  }
  
  // Fallback for unsupported platforms
  return (
    <View style={[style, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
      {children}
    </View>
  );
}
```

### Accessibility Considerations

```jsx
import { AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';

export function useReducedTransparency() {
  const [isReduced, setIsReduced] = useState(false);
  
  useEffect(() => {
    AccessibilityInfo.isReduceTransparencyEnabled().then(setIsReduced);
    
    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setIsReduced
    );
    
    return () => subscription?.remove();
  }, []);
  
  return isReduced;
}

// Usage in component
function GlassComponent() {
  const reducedTransparency = useReducedTransparency();
  
  if (reducedTransparency) {
    return <SolidBackgroundView />;
  }
  
  return <GlassView />;
}
```

### Dynamic Glass Effects

```jsx
export function InteractiveGlass() {
  const [isInteractive, setIsInteractive] = useState(false);
  
  return (
    <GlassView
      key={isInteractive ? 'interactive' : 'static'} // Remount for isInteractive change
      isInteractive={isInteractive}
      style={styles.container}
    >
      <Button 
        title="Toggle Interactive" 
        onPress={() => setIsInteractive(!isInteractive)}
      />
    </GlassView>
  );
}
```

---

## 🎨 Design Guidelines

### Apple's Liquid Glass Principles

1. **Contextual Enhancement**: Use glass effects to highlight UI elements, not replace primary content
2. **Layered Hierarchy**: Glass components should feel elevated and separate from background content
3. **Adaptive Behavior**: Effects should respond to light/dark modes and accessibility settings
4. **Performance**: Minimize overlapping glass effects for optimal rendering

### Best Use Cases

- **Navigation Elements**: Tab bars, toolbars, navigation bars
- **Floating Controls**: Action buttons, context menus, modal overlays
- **Content Cards**: Information panels, media controls, notification banners
- **Interactive Elements**: Buttons, toggles, segmented controls

### Styling Recommendations

```jsx
const styles = StyleSheet.create({
  glassContainer: {
    borderRadius: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  
  floatingGlass: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    borderRadius: 16,
  },
});
```

---

## ⚡ Performance Optimization

### Conditional Rendering

```jsx
// Only render glass effects on supported devices
const GlassOptimized = ({ children }) => {
  const canUseGlass = useMemo(() => {
    return Platform.OS === 'ios' && 
           Platform.Version >= 26 && 
           isLiquidGlassAvailable();
  }, []);
  
  if (!canUseGlass) {
    return <StandardView>{children}</StandardView>;
  }
  
  return <GlassView>{children}</GlassView>;
};
```

### Memory Management

```jsx
// Avoid frequent remounting of interactive glass views
const MemoizedGlass = memo(({ content, isInteractive }) => (
  <GlassView 
    key={`glass-${isInteractive}`}
    isInteractive={isInteractive}
  >
    {content}
  </GlassView>
));
```

---

## 🔧 Troubleshooting

### Common Issues

**Issue**: Glass effects not appearing
- **Solution**: Verify iOS 26+ device, Xcode 16.1+ compilation, and correct library installation

**Issue**: App crashes with glass components
- **Solution**: Wrap glass usage in platform checks and error boundaries

**Issue**: Performance degradation
- **Solution**: Limit overlapping glass effects, use memoization, implement conditional rendering

### Error Boundary Example

```jsx
class GlassErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <View />;
    }
    
    return this.props.children;
  }
}

// Usage
<GlassErrorBoundary fallback={<StandardView />}>
  <GlassView />
</GlassErrorBoundary>
```

---

## 📚 Additional Resources

### Documentation Links
- [expo-glass-effect Official Docs](https://docs.expo.dev/versions/latest/sdk/glass-effect/)
- [expo-liquid-glass-view GitHub](https://github.com/rit3zh/expo-liquid-glass-view) 
- [Expo UI SwiftUI Guide](https://docs.expo.dev/guides/expo-ui-swift-ui/)
- [Expo Router Tabs Documentation](https://docs.expo.dev/router/advanced/tabs/)
- [Apple Liquid Glass Guidelines](https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass)

### Example Projects
- [Expo UI Playground](https://github.com/betomoedano/expo-ui-playground)
- [Liquid Glass Sample App](https://github.com/mertozseven/LiquidGlassSwiftUI)

### Video Tutorials
- [Expo SDK 54 Overview](https://www.youtube.com/watch?v=iYh-7WfJTR0)
- [Liquid Glass Tutorial](https://www.youtube.com/watch?v=2wXYLWz3YEQ)
- [SwiftUI Glass Controls](https://www.youtube.com/watch?v=-9QxBHmcQpI)

---

## 🎯 Summary

Expo SDK 54 provides three powerful approaches for implementing liquid glass UI:

1. **expo-glass-effect**: Production-ready UIKit solution for most applications
2. **expo-liquid-glass-view**: Advanced SwiftUI customization with rich options  
3. **Expo UI**: Beta SwiftUI primitives for native component development

Combined with Expo Router v6's native tabs, developers can create stunning, platform-native iOS 26 applications while maintaining React Native's development experience and cross-platform capabilities.

Choose the approach that best fits your app's requirements, always implement proper fallbacks for older platforms, and follow Apple's design guidelines for optimal user experience.