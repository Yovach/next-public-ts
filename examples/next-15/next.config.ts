import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json', '.public.ts'],
    rules: {
      "*.public.ts": {
        loaders: ["file-loader", "next-public"],
        as: "*.js",
      }
    },

  },
  // webpack(config) {
  //   config.module.rules.push({
  //     test: /\.pts$/,
  //     use: [
  //       {
  //         loader: "next-public",
  //         options: {
  //           as: "*.js"
  //         }
  //       }
  //     ]
  //   });
  //   return config;
  // }
};

export default nextConfig;
