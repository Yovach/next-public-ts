import type { Options as SwcOptions } from "@swc/core";
import { transform } from "@swc/core";
import { globSync } from "fast-glob";
import { subtle } from "node:crypto";
import { existsSync, promises } from "node:fs";
import { dirname, join as pathJoin, sep as pathSep } from "node:path";
import type { Compiler } from "webpack";

const encoder = new TextEncoder();

function getSwcOptions(): SwcOptions {
  return {
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
  };
}

/**
 * Calculates the SHA-1 checksum of a given string
 */
async function calculateChecksum(fileContent: string): Promise<string> {
  const checksum = await subtle.digest("SHA-1", encoder.encode(fileContent));
  const checksumStr = Array.from(new Uint8Array(checksum))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return checksumStr;
}

async function injectChecksum(code: string): Promise<string> {
  return code.replace(/%checksum%/g, await calculateChecksum(code));
}

/**
 * Compiles files in a directory
 * @deprecated
 */
async function compileDirectory(
  inputDir: string,
  outputDir: string
): Promise<void> {
  if (!existsSync(inputDir)) {
    console.warn(`Input directory ${inputDir} does not exist`);
    return;
  } else if (!existsSync(outputDir)) {
    // create output directory if it doesn't exist
    await promises.mkdir(outputDir, { recursive: true });
  }

  const files = await promises.readdir(inputDir);
  for (const file of files) {
    const filePath = pathJoin(inputDir, file);
    const stat = await promises.stat(filePath);
    if (stat.isDirectory()) {
      const basename = filePath.split(pathSep).pop()!;
      return compileDirectory(filePath, pathJoin(outputDir, basename));
    } else {
      if (!filePath.endsWith(".ts")) {
        // ignore non-ts files
        continue;
      }
      const fileContent = await promises.readFile(filePath, "utf-8");

      // compile file with swc (from next.js)
      const transformed = await transform(fileContent, getSwcOptions());
      transformed.code = await injectChecksum(transformed.code);

      // write compiled file to output directory
      const outputFilePath = pathJoin(outputDir, file.replace(".ts", ".js"));
      await promises.writeFile(outputFilePath, transformed.code);
    }
  }
}

/**
 * Compiles a list of files
 */
async function compileFiles(inputFiles: string[]): Promise<void> {
  for (const file of inputFiles) {
    const [, filePath] = file.split("+public/", 2);
    if (!filePath) {
      throw new Error("Invalid file path");
    }

    const fileContent = await promises.readFile(file, "utf-8");

    const outputFilePath = pathJoin("public", filePath.replace(".ts", ".js"));
    // create output directory if it doesn't exist
    if (!existsSync(outputFilePath)) {
      await promises.mkdir(dirname(outputFilePath), {
        recursive: true,
      });
    }

    // compile file with swc (from next.js)
    const transformed = await transform(fileContent, getSwcOptions());
    transformed.code = await injectChecksum(transformed.code);

    // write compiled file to output directory
    await promises.writeFile(outputFilePath, transformed.code);
  }
}

type PluginOptions = {
  enabled?: boolean;
} & (
  | {
      inputDir: string | string[];
      outputDir: string;
      autoDetect?: false;
    }
  | {
      autoDetect: true;
    }
);

class NextPublicTsPlugin {
  #input: string[];
  #output: string;

  #enabled: boolean;
  #autoDetect: boolean = false;
  constructor(options: PluginOptions) {
    if (!options) {
      throw new Error("`options` is required");
    }

    this.#enabled = options.enabled ?? true;
    if (!options.autoDetect) {
      let { inputDir, outputDir } = options;
      if (!outputDir || !inputDir) {
        throw new Error("`inputDir` and `outputDir` are both required");
      } else if (typeof inputDir === "string") {
        inputDir = [inputDir];
      }

      this.#input = inputDir;
      this.#output = outputDir;
    } else {
      this.#output = "public";
      this.#autoDetect = true;

      this.#input = globSync(["**/+public/**/*.ts", "!**/public"]);
    }
  }

  apply(compiler: Compiler) {
    if (!this.#enabled) {
      return;
    }

    const { webpack } = compiler;
    const { Compilation } = webpack;
    compiler.hooks.compilation.tap(
      "NextPublicTsPlugin",
      (compilation): void => {
        compilation.hooks.processAssets.tapPromise(
          {
            name: "NextPublicTsPlugin",
            stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
          },
          async () => {
            if (this.#autoDetect) {
              return compileFiles(this.#input);
            } else {
              await Promise.all(
                this.#input.map(async (inputDir) => {
                  return compileDirectory(inputDir, this.#output);
                })
              );
            }
          }
        );
      }
    );
  }
}

export { NextPublicTsPlugin };
