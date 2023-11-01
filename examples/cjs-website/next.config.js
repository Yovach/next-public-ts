const { NextPublicTsPlugin } = require("next-public");
const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config, context) {
    config.plugins.push(new NextPublicTsPlugin({
      inputDir: path.join("src", "app", "compiled-public"),
      outputDir: path.join("public"),
    }));
    return config;
  }
};

module.exports = nextConfig;
