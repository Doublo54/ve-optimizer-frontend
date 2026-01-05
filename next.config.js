/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };
    
    // Fix MetaMask SDK trying to import React Native modules
    if (!isServer) {
      config.resolve.alias['@react-native-async-storage/async-storage'] = path.resolve(__dirname, './src/utils/empty-module.js');
    }
    
    return config;
  },
};

module.exports = nextConfig;
