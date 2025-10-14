// Shim for http module in React Native
// This provides a minimal implementation to prevent crashes

// Empty implementations for http methods
const http = {
  request: () => {
    console.warn('http.request is not available in React Native');
    return null;
  },
  get: () => {
    console.warn('http.get is not available in React Native');
    return null;
  },
  createServer: () => {
    console.warn('http.createServer is not available in React Native');
    return null;
  }
};

// Export the http object
if (typeof module !== 'undefined' && module.exports) {
  module.exports = http;
}

// Also attach to global if needed
if (typeof global !== 'undefined') {
  global.http = http;
}

export default http;