# Expo SDK 54 Liquid Glass Components & SwiftUI Integration Guide

A comprehensive guide to implementing the new Liquid Glass design and SwiftUI components in React Native Expo, including all available components, modifiers, and implementation patterns introduced in SDK 54.

## Overview

Expo SDK 54 introduces groundbreaking support for iOS 26's Liquid Glass design language and native SwiftUI integration. This guide covers all available components, installation, configuration, and implementation patterns for creating native-feeling apps with React Native.

## Table of Contents

1. [Installation & Requirements](#installation--requirements)
2. [Liquid Glass Components (`expo-glass-effect`)](#liquid-glass-components-expo-glass-effect)
3. [Expo UI SwiftUI Components](#expo-ui-swiftui-components)
4. [Modifiers System](#modifiers-system)
5. [Native Tabs with Liquid Glass](#native-tabs-with-liquid-glass)
6. [Mesh Gradient Integration](#mesh-gradient-integration)
7. [Advanced Implementations](#advanced-implementations)
8. [Platform Compatibility](#platform-compatibility)
9. [Performance Optimization](#performance-optimization)
10. [Migration Guide](#migration-guide)

---

## Installation & Requirements

### SDK 54 Upgrade

```bash
# Upgrade to Expo SDK 54
npx expo install expo@^54.0.0 --fix

# Install Liquid Glass and UI packages
npx expo install expo-glass-effect
npx expo install @expo/ui
npx expo install expo-mesh-gradient
npx expo install expo-router@^6.0.0
```

### iOS Requirements

- **Xcode 26+** (required for Liquid Glass compilation)
- **iOS 26+** (required for Liquid Glass runtime)
- **Development build** (Expo Go does not support these features)

### Build Configuration

```bash
# Prebuild with development build
npx expo prebuild --clean

# For EAS Build, configure Xcode 26
# In eas.json:
{
  "build": {
    "preview": {
      "ios": {
        "image": "latest",
        "xcode": "26.0.0"
      }
    }
  }
}
```

---

## Liquid Glass Components (`expo-glass-effect`)

### Installation & Basic Setup

```bash
npx expo install expo-glass-effect
```

### GlassView Component

The core component for creating Liquid Glass effects using iOS's native `UIVisualEffectView`.

```javascript
import React from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

export default function BasicGlassExample() {
  // Check if Liquid Glass is available
  const isAvailable = isLiquidGlassAvailable();

  if (!isAvailable) {
    return <Text>Liquid Glass not available on this device</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        style={styles.backgroundImage}
        source={{
          uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        }}
      />
      
      {/* Basic Glass View */}
      <GlassView style={styles.glassView}>
        <Text style={styles.text}>Regular Glass Effect</Text>
      </GlassView>
      
      {/* Clear Glass Style */}
      <GlassView 
        style={styles.clearGlassView} 
        glassEffectStyle="clear"
        tintColor="rgba(255, 255, 255, 0.2)"
      >
        <Text style={styles.text}>Clear Glass Effect</Text>
      </GlassView>
      
      {/* Interactive Glass View */}
      <GlassView 
        style={styles.interactiveGlass}
        isInteractive={true}
        glassEffectStyle="regular"
      >
        <Text style={styles.text}>Interactive Glass</Text>
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  glassView: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  clearGlassView: {
    position: 'absolute',
    top: 200,
    left: 20,
    right: 20,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  interactiveGlass: {
    position: 'absolute',
    top: 300,
    left: 20,
    right: 20,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
});
```

### Glass Effect Styles

Available `glassEffectStyle` options:

- `'regular'` - Standard glass effect (default)
- `'clear'` - More transparent glass effect
- `'identity'` - Minimal glass effect

### GlassContainer Component

Combines multiple glass views into a unified effect:

```javascript
import { GlassView, GlassContainer } from 'expo-glass-effect';

export default function GlassContainerExample() {
  return (
    <View style={styles.container}>
      <Image
        style={styles.backgroundImage}
        source={{
          uri: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=600&fit=crop',
        }}
      />
      
      <GlassContainer spacing={10} style={styles.containerStyle}>
        <GlassView style={styles.glass1} isInteractive />
        <GlassView style={styles.glass2} />
        <GlassView style={styles.glass3} />
      </GlassContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  containerStyle: {
    position: 'absolute',
    top: 200,
    left: 50,
    width: 250,
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  glass1: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  glass2: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  glass3: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
```

---

## Expo UI SwiftUI Components

### Installation & Host Setup

```bash
npx expo install @expo/ui
```

All SwiftUI components must be wrapped in a `<Host>` component:

```javascript
import { Host, VStack, HStack, Text, Button } from '@expo/ui/swift-ui';

export default function SwiftUIExample() {
  return (
    <Host style={{ flex: 1, margin: 32 }}>
      <VStack spacing={16}>
        <Text size={24}>Hello SwiftUI in React Native!</Text>
        <HStack spacing={12}>
          <Button onPress={() => console.log('Pressed')}>
            Click Me
          </Button>
        </HStack>
      </VStack>
    </Host>
  );
}
```

### Available SwiftUI Components

#### Layout Components

```javascript
// VStack - Vertical layout
<Host style={{ flex: 1 }}>
  <VStack spacing={16} alignment="center">
    <Text>Item 1</Text>
    <Text>Item 2</Text>
    <Text>Item 3</Text>
  </VStack>
</Host>

// HStack - Horizontal layout
<Host matchContents>
  <HStack spacing={12} alignment="center">
    <Text>Left</Text>
    <Spacer />
    <Text>Right</Text>
  </HStack>
</Host>

// Spacer - Flexible space
<HStack>
  <Text>Left</Text>
  <Spacer />
  <Text>Right</Text>
</HStack>
```

#### Text Components

```javascript
// Text with various styles
<Text size={32} color="primary">Large Primary Text</Text>
<Text size={16} color="secondary">Secondary Text</Text>
<Text weight="bold">Bold Text</Text>
<Text style="headline">Headline Style</Text>
```

#### Input Components

```javascript
// Button variants
<Button 
  variant="prominent" 
  color="blue"
  systemImage="star.fill"
  onPress={() => console.log('Pressed')}
>
  Prominent Button
</Button>

<Button variant="glass" systemImage="person">
  Glass Button
</Button>

<Button variant="glassProminent" color="orange">
  Glass Prominent
</Button>

// Switch/Toggle
const [isOn, setIsOn] = useState(false);
<Switch value={isOn} onValueChange={setIsOn} />

// Slider
const [value, setValue] = useState(0.5);
<Slider 
  value={value} 
  onValueChange={setValue}
  minimumValue={0}
  maximumValue={1}
/>
```

#### Progress Components

```javascript
// Circular Progress
<CircularProgress />
<CircularProgress color="orange" />

// Linear Progress
<LinearProgress progress={0.7} color="blue" />

// Gauge (iOS only)
<Gauge
  max={{ value: 1, label: '1' }}
  min={{ value: 0, label: '0' }}
  current={{ value: 0.5 }}
  color={['systemRed', 'systemOrange', 'systemYellow', 'systemGreen']}
  type="circularCapacity"
/>
```

#### Form Components

```javascript
// Form with sections
<Form>
  <Section title="Personal Info">
    <TextField placeholder="Name" value={name} onChangeText={setName} />
    <TextField placeholder="Email" value={email} onChangeText={setEmail} />
  </Section>
  
  <Section title="Preferences" footer="Choose your app settings">
    <HStack>
      <Text>Dark Mode</Text>
      <Spacer />
      <Switch value={darkMode} onValueChange={setDarkMode} />
    </HStack>
  </Section>
</Form>

// List component
<List 
  scrollEnabled={true}
  editModeEnabled={editMode}
  onSelectionChange={(items) => console.log('Selected:', items)}
  listStyle="automatic"
>
  {data.map((item, index) => (
    <ListItem key={index} title={item.title} systemImage={item.icon} />
  ))}
</List>
```

#### Image Components

```javascript
// System SF Symbols
<Image 
  systemName="star.fill" 
  color="yellow" 
  size={24} 
/>

// Custom images
<Image 
  source={{ uri: 'https://example.com/image.jpg' }}
  style={{ width: 100, height: 100 }}
/>
```

#### Date & Time Pickers

```javascript
// Date Picker
<DateTimePicker
  onDateSelected={(date) => setSelectedDate(date)}
  displayedComponents="date"
  initialDate={selectedDate.toISOString()}
  variant="wheel"
/>

// Time Picker
<DateTimePicker
  onDateSelected={(date) => setSelectedTime(date)}
  displayedComponents="hourAndMinute"
  variant="compact"
/>

// Picker (Segmented Control)
<Picker
  options={['$', '$$', '$$$', '$$$$']}
  selectedIndex={selectedIndex}
  onOptionSelected={({ nativeEvent: { index } }) => setSelectedIndex(index)}
  variant="segmented"
/>
```

---

## Modifiers System

Modifiers provide a SwiftUI-like way to style components:

```javascript
import { 
  glassEffect, 
  padding, 
  background, 
  clipShape, 
  frame 
} from '@expo/ui/swift-ui/modifiers';

// Glass effect modifier
<Text
  size={24}
  modifiers={[
    padding({ all: 16 }),
    glassEffect({
      glass: {
        variant: 'regular', // 'regular', 'clear', 'identity'
      },
    }),
  ]}
>
  Glass Effect Text
</Text>

// Multiple modifiers
<VStack
  spacing={16}
  modifiers={[
    padding({ horizontal: 20, vertical: 16 }),
    background('#007AFF'),
    clipShape('roundedRectangle', { cornerRadius: 12 }),
    frame({ maxWidth: 300, height: 200 }),
  ]}
>
  <Text color="white">Styled Container</Text>
</VStack>
```

### Available Modifiers

```javascript
// Padding
padding({ all: 16 })
padding({ horizontal: 20, vertical: 10 })
padding({ top: 8, bottom: 8, leading: 16, trailing: 16 })

// Background
background('#FF0000')
background('systemBlue')

// Frame
frame({ width: 200, height: 100 })
frame({ maxWidth: 300, minHeight: 50 })

// Clip Shape
clipShape('circle')
clipShape('roundedRectangle', { cornerRadius: 8 })

// Glass Effect
glassEffect({
  glass: {
    variant: 'regular', // 'regular', 'clear', 'identity'
  },
})

// Border
border(2, 'red')

// Shadow
shadow({ radius: 4, x: 0, y: 2, color: 'black', opacity: 0.25 })

// Opacity
opacity(0.8)

// Rotation
rotationEffect(45) // degrees

// Scale
scaleEffect(1.2)
```

---

## Native Tabs with Liquid Glass

### Basic Native Tabs Setup

```javascript
import { NativeTabs, Icon, Label, Badge } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon systemName="house.fill" />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="explore">
        <Icon systemName="magnifyingglass" />
        <Label>Explore</Label>
        <Badge>3</Badge>
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="profile">
        <Icon systemName="person.fill" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

### Liquid Glass Tab Bar

```javascript
// Enable liquid glass tab bar (iOS 26+ only)
<NativeTabs 
  appearance="liquid-glass"
  backgroundColor="rgba(255, 255, 255, 0.1)"
  blurEffect="systemMaterial"
>
  <NativeTabs.Trigger name="home">
    <Icon systemName="house.fill" />
    <Label>Home</Label>
  </NativeTabs.Trigger>
  
  <NativeTabs.Trigger name="messages">
    <Icon systemName="message.fill" />
    <Label>Messages</Label>
    <Badge>9+</Badge>
  </NativeTabs.Trigger>
</NativeTabs>
```

### Advanced Tab Configuration

```javascript
export default function AdvancedTabLayout() {
  const [notificationCount, setNotificationCount] = useState(5);
  
  return (
    <NativeTabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'transparent',
        },
      }}
    >
      <NativeTabs.Trigger 
        name="home"
        disablePopToTop={false}
        disableScrollToTop={false}
      >
        <Icon systemName="house.fill" />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="notifications">
        <Icon systemName="bell.fill" />
        <Label>Notifications</Label>
        {notificationCount > 0 && (
          <Badge>{notificationCount > 9 ? '9+' : notificationCount}</Badge>
        )}
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="settings" hidden={false}>
        <Icon systemName="gear" />
        <Label hidden /> {/* Hide label but keep icon */}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

---

## Mesh Gradient Integration

### Installation & Basic Usage

```bash
npx expo install expo-mesh-gradient
```

```javascript
import { MeshGradientView } from 'expo-mesh-gradient';

export default function MeshGradientExample() {
  return (
    <MeshGradientView
      style={{ flex: 1 }}
      columns={3}
      rows={3}
      colors={[
        'red', 'purple', 'indigo',
        'orange', 'white', 'blue',
        'yellow', 'green', 'cyan'
      ]}
      points={[
        [0.0, 0.0], [0.5, 0.0], [1.0, 0.0],
        [0.0, 0.5], [0.5, 0.5], [1.0, 0.5],
        [0.0, 1.0], [0.5, 1.0], [1.0, 1.0],
      ]}
      smoothsColors={true}
      ignoresSafeArea={true}
    />
  );
}
```

### Animated Mesh Gradients

```javascript
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export default function AnimatedMeshGradient() {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ]).start(() => animate());
    };
    animate();
  }, []);

  const animatedPoints = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      [
        [0.0, 0.0], [0.5, 0.0], [1.0, 0.0],
        [0.0, 0.5], [0.5, 0.5], [1.0, 0.5],
        [0.0, 1.0], [0.5, 1.0], [1.0, 1.0],
      ],
      [
        [0.1, 0.1], [0.4, 0.2], [0.9, 0.1],
        [0.2, 0.4], [0.6, 0.6], [0.8, 0.4],
        [0.1, 0.9], [0.6, 0.8], [0.9, 0.9],
      ]
    ]
  });

  return (
    <Animated.View style={{ flex: 1 }}>
      <MeshGradientView
        style={{ flex: 1 }}
        columns={3}
        rows={3}
        colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']}
        points={animatedPoints}
      />
    </Animated.View>
  );
}
```

### Mesh Gradient with Glass Overlay

```javascript
export default function MeshGradientWithGlass() {
  return (
    <View style={{ flex: 1 }}>
      <MeshGradientView
        style={{ flex: 1 }}
        columns={3}
        rows={3}
        colors={[
          'red', 'purple', 'indigo',
          'orange', 'white', 'blue',
          'yellow', 'green', 'cyan'
        ]}
        points={[
          [0.0, 0.0], [0.5, 0.0], [1.0, 0.0],
          [0.0, 0.5], [0.5, 0.5], [1.0, 0.5],
          [0.0, 1.0], [0.5, 1.0], [1.0, 1.0],
        ]}
      />
      
      {/* Glass overlay with SwiftUI */}
      <Host style={{ position: 'absolute', top: 100, left: 20, right: 20 }}>
        <VStack
          spacing={16}
          modifiers={[
            padding({ all: 24 }),
            glassEffect({
              glass: { variant: 'clear' },
            }),
            clipShape('roundedRectangle', { cornerRadius: 16 }),
          ]}
        >
          <Text size={24} color="primary">Glass on Mesh</Text>
          <Text size={16} color="secondary">
            Beautiful combination of mesh gradient and glass effect
          </Text>
        </VStack>
      </Host>
    </View>
  );
}
```

---

## Advanced Implementations

### iOS Settings-Style Interface

```javascript
import {
  Form,
  Section,
  HStack,
  VStack,
  Text,
  Image,
  Button,
  Switch,
  Spacer,
  Host
} from '@expo/ui/swift-ui';
import { background, clipShape, frame } from '@expo/ui/swift-ui/modifiers';

export default function SettingsInterface() {
  const [airplaneMode, setAirplaneMode] = useState(false);
  const [wifi, setWifi] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Form>
        {/* Profile Section */}
        <Section>
          <HStack spacing={12}>
            <Image
              source={{ uri: 'https://github.com/user.png' }}
              style={{ width: 60, height: 60, borderRadius: 30 }}
            />
            <VStack spacing={4} alignment="leading">
              <Text size={18} weight="semibold">John Doe</Text>
              <Text size={14} color="secondary">Apple ID, iCloud, Media & Purchases</Text>
            </VStack>
            <Spacer />
            <Image systemName="chevron.right" size={14} color="secondary" />
          </HStack>
        </Section>

        {/* Connectivity Section */}
        <Section title="Connectivity">
          <HStack spacing={12}>
            <Image
              systemName="airplane"
              color="white"
              size={18}
              modifiers={[
                frame({ width: 28, height: 28 }),
                background('#FF9500'),
                clipShape('roundedRectangle', { cornerRadius: 6 }),
              ]}
            />
            <Text>Airplane Mode</Text>
            <Spacer />
            <Switch value={airplaneMode} onValueChange={setAirplaneMode} />
          </HStack>

          <Button>
            <HStack spacing={12}>
              <Image
                systemName="wifi"
                color="white"
                size={18}
                modifiers={[
                  frame({ width: 28, height: 28 }),
                  background('#007AFF'),
                  clipShape('roundedRectangle', { cornerRadius: 6 }),
                ]}
              />
              <Text color="primary">Wi-Fi</Text>
              <Spacer />
              <Text color="secondary">Connected</Text>
              <Image systemName="chevron.right" size={14} color="secondary" />
            </HStack>
          </Button>
        </Section>

        {/* Display Section */}
        <Section title="Display & Brightness">
          <HStack spacing={12}>
            <Image
              systemName="sun.max.fill"
              color="white"
              size={18}
              modifiers={[
                frame({ width: 28, height: 28 }),
                background('#007AFF'),
                clipShape('roundedRectangle', { cornerRadius: 6 }),
              ]}
            />
            <Text>Dark Mode</Text>
            <Spacer />
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </HStack>
        </Section>
      </Form>
    </Host>
  );
}
```

### Custom Card Components

```javascript
import { GlassView } from 'expo-glass-effect';
import { Host, VStack, HStack, Text, Image } from '@expo/ui/swift-ui';
import { padding, clipShape } from '@expo/ui/swift-ui/modifiers';

export default function CustomCards() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Glass Card */}
      <GlassView style={styles.card}>
        <Host matchContents>
          <VStack spacing={12} modifiers={[padding({ all: 16 })]}>
            <HStack spacing={12}>
              <Image systemName="creditcard.fill" color="white" size={24} />
              <Text size={18} color="white" weight="semibold">Payment Card</Text>
            </HStack>
            <Text size={14} color="rgba(255,255,255,0.8)">
              **** **** **** 1234
            </Text>
            <Text size={12} color="rgba(255,255,255,0.6)">
              Expires 12/25
            </Text>
          </VStack>
        </Host>
      </GlassView>

      {/* Weather Card */}
      <GlassView style={styles.card} glassEffectStyle="clear">
        <Host matchContents>
          <HStack 
            spacing={16}
            modifiers={[
              padding({ all: 20 }),
              clipShape('roundedRectangle', { cornerRadius: 16 })
            ]}
          >
            <VStack spacing={8}>
              <Text size={24} color="white" weight="bold">72Â°</Text>
              <Text size={14} color="rgba(255,255,255,0.8)">Sunny</Text>
            </VStack>
            <Spacer />
            <Image systemName="sun.max.fill" color="yellow" size={32} />
          </HStack>
        </Host>
      </GlassView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
```

### Music Player Interface

```javascript
export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0.3);

  return (
    <View style={{ flex: 1 }}>
      {/* Background */}
      <MeshGradientView
        style={{ flex: 1 }}
        columns={2}
        rows={2}
        colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']}
        points={[
          [0.0, 0.0], [1.0, 0.0],
          [0.0, 1.0], [1.0, 1.0],
        ]}
      />

      {/* Player Controls */}
      <GlassView style={styles.playerContainer}>
        <Host matchContents>
          <VStack spacing={24} modifiers={[padding({ all: 24 })]}>
            {/* Album Art */}
            <Image
              source={{ uri: 'https://example.com/album-art.jpg' }}
              modifiers={[
                frame({ width: 200, height: 200 }),
                clipShape('roundedRectangle', { cornerRadius: 16 }),
              ]}
            />

            {/* Song Info */}
            <VStack spacing={4} alignment="center">
              <Text size={20} weight="bold" color="white">Song Title</Text>
              <Text size={16} color="rgba(255,255,255,0.8)">Artist Name</Text>
            </VStack>

            {/* Progress Bar */}
            <VStack spacing={8}>
              <LinearProgress progress={progress} color="white" />
              <HStack>
                <Text size={12} color="rgba(255,255,255,0.6)">1:23</Text>
                <Spacer />
                <Text size={12} color="rgba(255,255,255,0.6)">4:56</Text>
              </HStack>
            </VStack>

            {/* Controls */}
            <HStack spacing={24} alignment="center">
              <Button>
                <Image systemName="backward.fill" color="white" size={24} />
              </Button>
              
              <Button onPress={() => setIsPlaying(!isPlaying)}>
                <Image 
                  systemName={isPlaying ? "pause.circle.fill" : "play.circle.fill"} 
                  color="white" 
                  size={48} 
                />
              </Button>
              
              <Button>
                <Image systemName="forward.fill" color="white" size={24} />
              </Button>
            </HStack>
          </VStack>
        </Host>
      </GlassView>
    </View>
  );
}
```

---

## Platform Compatibility

### iOS Availability Check

```javascript
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Platform } from 'react-native';

export function useGlassSupport() {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      setIsSupported(isLiquidGlassAvailable());
    }
  }, []);

  return isSupported;
}

// Usage in component
export default function ConditionalGlass() {
  const glassSupported = useGlassSupport();

  if (glassSupported) {
    return (
      <GlassView style={styles.container}>
        <Text>Liquid Glass Supported!</Text>
      </GlassView>
    );
  }

  // Fallback for unsupported platforms
  return (
    <View style={[styles.container, styles.fallbackStyle]}>
      <Text>Fallback UI</Text>
    </View>
  );
}
```

### Android Fallbacks

```javascript
import { Platform } from 'react-native';
import { BlurView } from 'expo-blur';

export default function CrossPlatformGlass({ children, style }) {
  if (Platform.OS === 'ios' && isLiquidGlassAvailable()) {
    return (
      <GlassView style={style}>
        {children}
      </GlassView>
    );
  }

  // Android/Web fallback
  return (
    <BlurView intensity={80} style={[style, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
      {children}
    </BlurView>
  );
}
```

---

## Performance Optimization

### Lazy Loading Glass Components

```javascript
import { lazy, Suspense } from 'react';

const GlassComponent = lazy(() => import('./GlassComponent'));

export default function OptimizedApp() {
  const glassSupported = useGlassSupport();

  return (
    <View style={{ flex: 1 }}>
      {glassSupported ? (
        <Suspense fallback={<LoadingSpinner />}>
          <GlassComponent />
        </Suspense>
      ) : (
        <FallbackComponent />
      )}
    </View>
  );
}
```

### Memory Management

```javascript
export default function OptimizedGlassView() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Cleanup when component unmounts
    return () => {
      // Glass views are automatically cleaned up
    };
  }, []);

  // Only render when needed
  if (!isVisible) {
    return null;
  }

  return (
    <GlassView style={styles.container}>
      {/* Content */}
    </GlassView>
  );
}
```

---

## Migration Guide

### From SDK 53 to SDK 54

1. **Update Dependencies**:
```bash
npx expo install expo@^54.0.0 --fix
npx expo install expo-glass-effect @expo/ui expo-mesh-gradient
```

2. **Update Expo UI Components**:
```javascript
// Before (SDK 53)
import { Text, Button } from '@expo/ui/swift-ui';

<Text>Hello</Text>

// After (SDK 54) - Now requires Host wrapper
import { Host, Text, Button } from '@expo/ui/swift-ui';

<Host matchContents>
  <Text>Hello</Text>
</Host>
```

3. **Update Build Configuration**:
```json
// eas.json
{
  "build": {
    "preview": {
      "ios": {
        "xcode": "26.0.0"
      }
    }
  }
}
```

### Breaking Changes

- **Host Requirement**: All Expo UI components now require a `<Host>` wrapper
- **Xcode 26**: Required for Liquid Glass compilation
- **iOS 26**: Required for Liquid Glass runtime
- **Development Build**: Expo Go no longer supports these features

---

## Best Practices

1. **Always check platform support** before using Liquid Glass
2. **Provide fallbacks** for unsupported platforms
3. **Use Host components** efficiently to avoid performance issues
4. **Limit glass effects** to avoid visual clutter
5. **Test on actual devices** as simulators may not show full effects
6. **Consider accessibility** - some users may have reduced transparency enabled

This comprehensive guide provides everything needed to implement Liquid Glass and SwiftUI components in your Expo React Native app, bringing native iOS design patterns to cross-platform development.