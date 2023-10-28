const { NextPublicTsPlugin } = require("next-public-ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config, context) {
    config.plugins.push(new NextPublicTsPlugin({
      autoDetect: true,

      // Only enable in production during build
      enabled: !context.isServer && !context.dev,
    }));
    return config;
  }
};

module.exports = nextConfig;
