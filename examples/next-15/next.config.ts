import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  /* config options here */
  turbopack: {
    rules: {
      "**/+public/**/*.{js,ts}": {
        loaders: [
          {loader: "next-public", options: {}}
        ],
        as: "*.js"
      }
    }
  }
};

export default nextConfig;
