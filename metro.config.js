const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Enable CSS support
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'css'];
// Enable .lottie files for Lottie animations
config.resolver.assetExts = [...(config.resolver.assetExts || []), 'lottie'];

module.exports = withNativeWind(config, { 
  input: './global.css',
  inlineRem: false,
});

