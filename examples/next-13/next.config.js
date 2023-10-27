const { NextPublicTsPlugin } = require("next-public-ts");
const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, context) {
    config.plugins.push(new NextPublicTsPlugin({
      inputDir: path.join(__dirname, "src", "app", "+public"),
      outputDir: path.join(__dirname, "public"),
    }));
    return config;
  }
};

module.exports = nextConfig;
