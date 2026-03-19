
// const { getDefaultConfig } = require("expo/metro-config");
// const { withNativeWind } = require('nativewind/metro');

// // 1. Get the default Expo config
// const config = getDefaultConfig(__dirname);

// // 2. Add WASM support for Skia Web
// config.resolver.assetExts.push('wasm');
// config.resolver.sourceExts.push('wasm');

// // 3. Export with NativeWind wrapper
// module.exports = withNativeWind(config, { input: './app/global.css' });

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// ✅ Fix: ignore Skia's massive C++ source folders
config.watchFolders = [];
config.resolver.blockList = [
  /node_modules\/@shopify\/react-native-skia\/cpp\/.*/,
  /node_modules\/@shopify\/react-native-skia\/src\/skia\/.*/,
];

// WASM support for Skia Web
config.resolver.assetExts.push('wasm');
config.resolver.sourceExts.push('wasm');

module.exports = withNativeWind(config, { input: './app/global.css' });