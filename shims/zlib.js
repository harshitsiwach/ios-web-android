// Shim for zlib module in React Native
// This provides a minimal implementation to prevent crashes

// Empty implementations for zlib methods
const zlib = {
  deflate: (buffer, callback) => {
    console.warn('zlib.deflate is not available in React Native');
    if (callback) callback(new Error('zlib.deflate not implemented'), null);
    return null;
  },
  inflate: (buffer, callback) => {
    console.warn('zlib.inflate is not available in React Native');
    if (callback) callback(new Error('zlib.inflate not implemented'), null);
    return null;
  },
  gzip: (buffer, callback) => {
    console.warn('zlib.gzip is not available in React Native');
    if (callback) callback(new Error('zlib.gzip not implemented'), null);
    return null;
  },
  gunzip: (buffer, callback) => {
    console.warn('zlib.gunzip is not available in React Native');
    if (callback) callback(new Error('zlib.gunzip not implemented'), null);
    return null;
  }
};

// Export the zlib object
if (typeof module !== 'undefined' && module.exports) {
  module.exports = zlib;
}

// Also attach to global if needed
if (typeof global !== 'undefined') {
  global.zlib = zlib;
}

export default zlib;