import { transformSync } from "next/dist/build/swc/index.js";
import { webpack } from "next/dist/compiled/webpack/webpack";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join as pathJoin, sep as pathSep } from "node:path";

function compileDirectory(inputDir: string, outputDir: string) {
  if (!existsSync(inputDir)) {
    return;
  }

  const files = readdirSync(inputDir);
  for (const file of files) {
    const filePath = pathJoin(inputDir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      const basename = filePath.split(pathSep).pop()!;
      compileDirectory(filePath, pathJoin(outputDir, basename));
    } else {
      if (!filePath.endsWith(".ts")) {
        // ignore non-ts files
        continue;
      } else if (!existsSync(outputDir)) {
        // create output directory if it doesn't exist
        mkdirSync(outputDir, { recursive: true });
      }
      const fileContent = readFileSync(filePath, "utf-8");
      const transformed = transformSync(fileContent, {
        jsc: {
          parser: {
            syntax: "typescript",
          },
          minify: {
            mangle: {},
            compress: {},
            format: {},
          },
          target: "es2020",
          loose: true,
        },
        sourceMaps: false,
        isModule: true,
        minify: true,
      });
      const outputFilePath = pathJoin(outputDir, file.replace(".ts", ".js"));
      writeFileSync(outputFilePath, transformed.code);
    }
  }
}

type PluginOptions = {
  inputDir: string | string[];
  outputDir: string;
  enabled?: boolean;
};

class NextPublicTsPlugin {
  inputDir: string[];
  outputDir: string;
  enabled: boolean;
  constructor(options: PluginOptions) {
    if (!options) {
      throw new Error("`options` is required");
    }

    let { inputDir, outputDir } = options;
    if (!outputDir || !inputDir) {
      throw new Error("`inputDir` and `outputDir` are both required");
    } else if (typeof inputDir === "string") {
      inputDir = [inputDir];
    }

    this.enabled = options.enabled ?? true;
    this.inputDir = inputDir;
    this.outputDir = outputDir;
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.afterEmit.tap("CopyPublicPlugin", (): void => {
      for (const inputDir of this.inputDir) {
        compileDirectory(inputDir, this.outputDir);
      }
    });
  }
}

export { NextPublicTsPlugin };
