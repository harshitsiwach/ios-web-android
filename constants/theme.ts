export const lightTheme = {
  primary: '#FF6B00', // Slightly more vibrant orange
  background: '#F0F0F0', // Slightly darker background
  cardBackground: '#FFFFFF',
  text: '#222222', // Darker text for better contrast
  textSecondary: '#666666',
  border: '#DDDDDD', // Slightly darker borders
  shadow: '#000000',
  gradientStart: '#F5F5F5',
  gradientEnd: '#EEEEEE',
  up: '#4CAF50', // Green for positive changes
  down: '#F44336', // Red for negative changes
};

export const darkTheme = {
  primary: '#FFA500', // Orange
  background: '#000000', // Pure black for OLED screens
  cardBackground: '#121212', // Darker card background
  text: '#FFFFFF',
  textSecondary: '#AAAAAA', // Slightly dimmer secondary text
  border: '#222222', // Darker borders
  shadow: '#000000',
  gradientStart: '#000000',
  gradientEnd: '#111111',
  up: '#4CAF50', // Green for positive changes
  down: '#F44336', // Red for negative changes
};

export type Theme = typeof lightTheme;