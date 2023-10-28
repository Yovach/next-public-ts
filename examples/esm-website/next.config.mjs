import { NextPublicTsPlugin } from "next-public-ts";
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config, context) {
    config.plugins.push(new NextPublicTsPlugin({
      inputDir: path.join("src", "app", "+public"),
      outputDir: path.join("public"),
    }));
    return config;
  }
};

export default nextConfig;
