const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Workaround for Windows path issue with node:sea
// https://github.com/expo/expo/issues/26879
process.env.EXPO_NO_METRO_WORKSPACE_ROOT = '1';

// Fix for Metro trying to create folders with colons on Windows
config.resolver = {
  ...config.resolver,
  unstable_enablePackageExports: false,
  unstable_conditionNames: ['require', 'import'],
  // Exclude backend and admin folders from bundling
  blockList: [
    /backend\/.*/,
    /admin-dashboard\/.*/,
    /node_modules\/.*\/node_modules\/react-native\/.*/,
  ],
};

// Only watch the passenger-app directory
config.watchFolders = [__dirname];

// Exclude backend and admin folders from being watched
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      if (req.url.includes('/backend/') || req.url.includes('/admin-dashboard/')) {
        res.statusCode = 404;
        res.end('Not Found');
        return;
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
