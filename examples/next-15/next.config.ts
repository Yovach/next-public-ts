import type { NextConfig } from "next";
import { NextPublicTsPlugin } from "next-public";
import path from "node:path";
import type webpack from "webpack";

const nextConfig: NextConfig = {
  output: "export",
  webpack: (config: webpack.Configuration)  => {
    config.plugins?.push(new NextPublicTsPlugin({
      inputDir: path.join("app", "+public"),
      outputDir: path.join("public"),
    }));
    return config;
  }
};

export default nextConfig;
