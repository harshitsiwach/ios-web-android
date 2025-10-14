// Shim for react-native-randombytes to use react-native-get-random-values
import { getRandomBytesAsync } from 'expo-crypto';

// Export the randomBytes function
export const randomBytes = async (size) => {
  try {
    return await getRandomBytesAsync(size);
  } catch (error) {
    console.warn('Failed to generate random bytes:', error);
    // Fallback to Math.random if crypto fails
    const array = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }
};

// For backward compatibility, also export sync version
export const randomBytesSync = (size) => {
  // Sync version is not available in expo-crypto, so we'll use a fallback
  const array = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
};

// Export both versions for compatibility
export default {
  randomBytes,
  randomBytesSync
};