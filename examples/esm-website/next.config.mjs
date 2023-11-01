import { NextPublicTsPlugin } from "next-public";
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

      // Only enable in production during build
      enabled: !context.isServer && !context.dev,
    }));
    return config;
  }
};

export default nextConfig;
