const { NextPublicTsPlugin } = require("next-public");
const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, context) {
    config.plugins.push(new NextPublicTsPlugin({
      inputDir: path.join("app", "+public"),
      outputDir: path.join("public"),
    }));
    return config;
  }
};

module.exports = nextConfig;
