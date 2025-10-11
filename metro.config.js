const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Enable CSS support
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'css'];

module.exports = withNativeWind(config, { 
  input: './global.css',
  inlineRem: false,
});

