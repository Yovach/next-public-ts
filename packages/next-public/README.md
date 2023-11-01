# next-public

A webpack plugin to compile TypeScript files in the public folder of a Next.js project.\
I created this Webpack plugin because I wanted to use TypeScript in the public folder of my Next.js project but Next.js doesn't support this out of the box.

## Features

- Write your `Service Workers` and your `Web Workers` in TypeScript
- Handle `process.env.NEXT_PUBLIC_*` in your TypeScript files
- Compile and minify your TypeScript files
- Auto-detect `*.ts` with `autoDetect` option and `+public` directory
- Inject a **SHA-1** hash of the file content into `%checksum%` variable in the compiled file
- Support for CommonJS and ES modules

## Installation

```bash
npm install --save-dev next-public
```

## Usage

### Auto-detect `*.ts` files with `+public` directory

```js
// next.config.js
const { NextPublicTsPlugin } = require("next-public");

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

### With `inputDir` and `outputDir` options

```js
// next.config.mjs
import path from "node:path";
import { NextPublicTsPlugin } from "next-public";

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  webpack(config, context) {
    config.plugins.push(
      new NextPublicTsPlugin({
        inputDir: path.join("src", "app", "+public"),
        outputDir: path.join("public"),
      }),
    );
    return config;
  },
};

export default nextConfig;
```

## Examples

You can find examples in the [examples](https://github.com/Yovach/next-public/tree/main/examples) directory.

## Plugin options

- `enabled` :
  A boolean value indicating whether the plugin should be enabled. Defaults to `true`.\
  **NOTE** : Use this option to disable the plugin in development mode.

- `autoDetect` :
  A boolean value indicating whether the plugin should automatically detect the TypeScript files in the input directory. Defaults to `false`.\
  e.g. : If you want to let the plugin to detect TypeScript files in `app/+public` directory.

- `inputDir` :
  A string representing the path to the directory containing the TypeScript files to be compiled.

- `outputDir` :
  A string representing the path to the directory where the compiled JavaScript files will be written.
