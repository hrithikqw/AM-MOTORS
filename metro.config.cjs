const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Add support for .mjs and .cjs file extensions (used by ESM modules)
config.resolver.sourceExts.push("mjs", "cjs");

// Optional: Improve alias handling if you're using "@/..." imports
config.resolver.alias = {
  "@": path.resolve(__dirname),
};

module.exports = config;
