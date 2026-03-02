
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

// 1. Get the default Expo config
const config = getDefaultConfig(__dirname);

// 2. Add WASM support for Skia Web
config.resolver.assetExts.push('wasm');
config.resolver.sourceExts.push('wasm');

// 3. Export with NativeWind wrapper
module.exports = withNativeWind(config, { input: './app/global.css' });