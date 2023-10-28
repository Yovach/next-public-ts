# next-public-ts

A webpack plugin to compile TypeScript files in the public folder of a Next.js project.

I created this Webpack plugin because I wanted to use TypeScript in the public folder of my Next.js project but Next.js doesn't support this out of the box.

## Use cases

- Service workers
- Web workers
- Other JavaScript files that need to be in the public folder (if you want to write them in TypeScript and minify them)

## Installation

```bash
npm install --save-dev next-public-ts
```

## Usage

### ESM (Recommended)

```js
// next.config.mjs
import path from "node:path";
import { NextPublicTsPlugin } from "next-public-ts";

const __dirname = new URL(".", import.meta.url).pathname;

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  webpack(config, context) {
    config.plugins.push(
      new NextPublicTsPlugin({
        inputDir: path.join(__dirname, "src", "app", "+public"),
        outputDir: path.join(__dirname, "public"),
      }),
    );
    return config;
  },
};

export default nextConfig;
```

### CommonJS

```js
// next.config.js
const path = require("path");
const { NextPublicTsPlugin } = require("next-public-ts");

const nextConfig = {
  webpack(config, context) {
    config.plugins.push(
      new NextPublicTsPlugin({
        inputDir: path.join(__dirname, "src", "app", "+public"),
        outputDir: path.join(__dirname, "public"),
      }),
    );
    return config;
  },
};
```

### Auto-detect `+public` directory

```js
// next.config.js
const { NextPublicTsPlugin } = require("next-public-ts");

const nextConfig = {
  webpack(config, context) {
    config.plugins.push(
      new NextPublicTsPlugin({
        autoDetect: true,
      }),
    );
    return config;
  },
};
```

## Plugins options

### `enabled`

A boolean value indicating whether the plugin should be enabled. Defaults to `true`.\
**NOTE**: Use this option to disable the plugin in development mode.

### `autoDetect`

A boolean value indicating whether the plugin should automatically detect the TypeScript files in the input directory. Defaults to `false`.\
e.g.: If you want to let the plugin to detect TypeScript files in `app/+public` directory.

### `inputDir`

A string representing the path to the directory containing the TypeScript files to be compiled.

### `outputDir`

A string representing the path to the directory where the compiled JavaScript files will be written.

## Examples

You can find examples in the [examples](https://github.com/Yovach/next-public-ts/tree/main/examples) directory.
