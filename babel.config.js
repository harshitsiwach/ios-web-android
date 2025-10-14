module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [
      // Add alias plugin to ensure proper resolution
      [
        'module-resolver',
        {
          alias: {
            '@': './',
            // Polyfill for crypto module
            crypto: 'react-native-crypto',
          },
        },
      ],
      // Plugin to transform require calls for problematic modules
      [
        'transform-inline-environment-variables',
        {
          include: ['NODE_ENV', 'REOWN_PROJECT_ID', 'THIRDWEB_CLIENT_ID'],
        },
      ],
    ],
  };
};