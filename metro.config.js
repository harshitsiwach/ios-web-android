// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for mjs files
config.resolver.sourceExts.push('mjs');

// Add resolver for @noble/curves package to address viem import issues
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@noble/curves': require.resolve('@noble/curves'),
  '@noble/hashes': require.resolve('@noble/hashes'),
};

// Add asset extensions if needed
config.resolver.assetExts.push('bin');

module.exports = config;