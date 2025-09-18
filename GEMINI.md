# Project Overview

This is a React Native Expo project named "glass", built with Expo SDK 54. It utilizes TypeScript and Expo Router for navigation. The application integrates several advanced features, including:

*   **Liquid Glass UI:** Leveraging `expo-glass-effect` and `@expo/ui/swift-ui` for a native iOS 26-inspired design.
*   **Wallet Connectivity:** Integration with Reown AppKit (`@reown/appkit-wagmi-react-native`) for Web3 wallet connections.
*   **Backend-as-a-Service:** Supabase (`@supabase/supabase-js`) is integrated for potential authentication, database, and other backend functionalities.
*   **Data Display:** Fetches and displays data related to cryptocurrencies (CoinGecko API), Hyperliquid markets, Polymarket markets, and crypto news (CryptoCompare API).
*   **Theming:** Features a custom theme context (`ThemeContext.tsx`) for light and dark mode.

## Building and Running

The project is configured for a bare workflow due to the use of native modules.

*   **Install Dependencies:**
    ```bash
    npm install
    ```
*   **Generate Native Project Files (if not already done):**
    ```bash
    npx expo prebuild --clean
    ```
*   **Run on iOS Simulator/Device:**
    ```bash
    npx expo run:ios
    ```
*   **Run on Android Emulator/Device:**
    ```bash
    npx expo run:android
    ```
*   **Start Development Server (for web or if not running native builds):**
    ```bash
    npx expo start
    ```
*   **Lint Code:**
    ```bash
    npm run lint
    ```
*   **Reset Project (to starter code):**
    ```bash
    npm run reset-project
    ```

## Development Conventions

*   **Language:** TypeScript is used throughout the project.
*   **Routing:** Uses Expo Router for file-based navigation.
*   **Styling:** Primarily uses `StyleSheet.create` for component-specific styles.
*   **Theming:** A custom `ThemeContext` and `useTheme` hook manage light/dark mode.
*   **UI Components:** Leverages `@expo/ui/swift-ui` for native iOS-like components and `expo-glass-effect` for Liquid Glass aesthetics.
*   **Project Structure:**
    *   `app/`: Contains screen components and navigation layouts.
    *   `assets/`: Stores static assets like images.
    *   `components/`: Reusable UI components.
    *   `constants/`: Application-wide constants, including theme definitions.
    *   `contexts/`: React Context providers (e.g., `ThemeContext`).
    *   `hooks/`: Custom React hooks.
    *   `lib/`: Utility files, including Supabase client initialization.
