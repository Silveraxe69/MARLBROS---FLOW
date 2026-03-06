const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['@react-native-async-storage/async-storage'],
      },
    },
    argv
  );

  // Add aliases for react-native
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
  };

  // Disable node polyfills that cause issues
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    net: false,
    tls: false,
    crypto: false,
    stream: false,
    http: false,
    https: false,
    zlib: false,
    path: false,
    os: false,
    process: false,
  };

  return config;
};
