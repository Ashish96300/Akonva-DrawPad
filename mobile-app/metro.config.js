

// const { getDefaultConfig } = require("expo/metro-config");
// const { withNativeWind } = require('nativewind/metro');
// const path = require('path');

// const config = getDefaultConfig(__dirname);

// // ✅ Fix: ignore Skia's massive C++ source folders
// config.watchFolders = [];
// config.resolver.blockList = [
//   /node_modules\/@shopify\/react-native-skia\/cpp\/.*/,
//   /node_modules\/@shopify\/react-native-skia\/src\/skia\/.*/,
// ];

// // WASM support for Skia Web
// config.resolver.assetExts.push('wasm');
// config.resolver.sourceExts.push('wasm');

// module.exports = withNativeWind(config, { input: './app/global.css' });

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// ❌ REMOVED: config.resolver.blockList 
// We need to allow Metro to see the src/skia files for the Native build!

// ✅ ADDED: Support for native extensions and Skia files
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'mjs',
  'native.js',
  'android.js',
  'wasm'
];

// WASM support for Skia Web
config.resolver.assetExts.push('wasm');

module.exports = withNativeWind(config, { input: './app/global.css' });