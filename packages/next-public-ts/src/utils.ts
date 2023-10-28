import type { Options as SwcOptions } from "@swc/core";
import { transform } from "@swc/core";
import { globSync } from "fast-glob";
import { subtle } from "node:crypto";
import { existsSync, promises } from "node:fs";
import { dirname, join as pathJoin } from "node:path";

const encoder = new TextEncoder();

/**
 * Calculates the SHA-1 checksum of a given string
 */
export async function calculateChecksum(fileContent: string): Promise<string> {
  const checksum = await subtle.digest("SHA-1", encoder.encode(fileContent));
  const checksumStr = Array.from(new Uint8Array(checksum))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return checksumStr;
}

/**
 * Compiles a file with swc and replace %checksum% with the SHA-1 checksum of the file
 */
export async function compileFile(filePath: string): Promise<string> {
  const fileContent = await promises.readFile(filePath, "utf-8");
  const transformed = await transform(fileContent, getSwcOptions());
  transformed.code = transformed.code.replace(
    /%checksum%/g,
    await calculateChecksum(transformed.code)
  );
  return transformed.code;
}

export function getSwcOptions(): SwcOptions {
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
 * Compiles files in a directory
 */
export function compileDirectory(
  inputDir: string,
  outputDir: string
): Promise<void>[] {
  const files = globSync([inputDir + "/**/*.ts", "!**/public"]);
  return files.map(async (file) => {
    const [, filePath] = file.split(inputDir, 2);
    if (!filePath) {
      throw new Error("Invalid file path");
    }

    // create output directory if it doesn't exist
    const outputFilePath = pathJoin(outputDir, filePath.replace(".ts", ".js"));
    if (!existsSync(outputFilePath)) {
      await promises.mkdir(dirname(outputFilePath), {
        recursive: true,
      });
    }

    // compile file with swc (from next.js)
    const inputFilePath = pathJoin(inputDir, filePath);
    const fileContent = await compileFile(inputFilePath);

    // write compiled file to output directory
    return promises.writeFile(outputFilePath, fileContent);
  });
}

/**
 * Compiles a list of files
 */
export function compileFiles(inputFiles: string[]): Promise<void>[] {
  return inputFiles.map(async (file) => {
    const [, filePath] = file.split("+public/", 2);
    if (!filePath) {
      throw new Error("Invalid file path");
    }

    // create output directory if it doesn't exist
    const outputFilePath = pathJoin("public", filePath.replace(".ts", ".js"));
    if (!existsSync(outputFilePath)) {
      await promises.mkdir(dirname(outputFilePath), {
        recursive: true,
      });
    }

    // compile file with swc (from next.js)
    const fileContent = await compileFile(filePath);

    // write compiled file to output directory
    return promises.writeFile(outputFilePath, fileContent);
  });
}
