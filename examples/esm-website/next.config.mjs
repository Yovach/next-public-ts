import { NextPublicTsPlugin } from "next-public-ts";
import path from "path";

const __dirname = new URL(".", import.meta.url).pathname;

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config, context) {
    config.plugins.push(new NextPublicTsPlugin({
      inputDir: path.join(__dirname, "src", "app", "+public"),
      outputDir: path.join(__dirname, "public"),
    }));
    return config;
  }
};

export default nextConfig;
