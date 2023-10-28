const { NextPublicTsPlugin } = require("next-public-ts");
const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config, context) {
    config.plugins.push(new NextPublicTsPlugin({
      autoDetect: true,
    }));
    return config;
  }
};

module.exports = nextConfig;
