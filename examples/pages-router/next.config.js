const { NextPublicTsPlugin } = require("next-public-ts");
const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config, context) {
    config.plugins.push(new NextPublicTsPlugin({
      inputDir: path.join("src", "+public"),
      outputDir: path.join("public"),
    }));
    return config;
  }
};

module.exports = nextConfig;
