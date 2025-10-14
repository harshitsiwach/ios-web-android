// Mock for Node.js crypto module for React Native
// This file provides a minimal implementation of the crypto module
// to satisfy dependencies that expect it to exist

const crypto = {
  // Minimal implementation of required crypto functions
  randomBytes: (size) => {
    if (typeof global.crypto !== 'undefined' && typeof global.crypto.getRandomValues !== 'undefined') {
      const array = new Uint8Array(size);
      global.crypto.getRandomValues(array);
      return array;
    }
    // Fallback to Math.random if crypto is not available
    const array = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  },
  
  createHash: (algorithm) => {
    // Return a mock hash object
    return {
      update: () => {},
      digest: () => 'mock-digest'
    };
  },
  
  createHmac: (algorithm, key) => {
    // Return a mock HMAC object
    return {
      update: () => {},
      digest: () => 'mock-hmac'
    };
  },
  
  // Add other crypto functions as needed
  constants: {
    // Empty constants object
  }
};

// Export the crypto object
if (typeof module !== 'undefined' && module.exports) {
  module.exports = crypto;
}

// Also attach to global if needed
if (typeof global !== 'undefined') {
  global.crypto = global.crypto || crypto;
}

export default crypto;