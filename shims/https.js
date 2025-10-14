// Shim for https module in React Native
// This provides a minimal implementation to prevent crashes

// Empty implementations for https methods
const https = {
  request: () => {
    console.warn('https.request is not available in React Native');
    return null;
  },
  get: () => {
    console.warn('https.get is not available in React Native');
    return null;
  }
};

// Export the https object
if (typeof module !== 'undefined' && module.exports) {
  module.exports = https;
}

// Also attach to global if needed
if (typeof global !== 'undefined') {
  global.https = https;
}

export default https;