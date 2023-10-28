import type { Options as SwcOptions } from "@swc/core";
import { transform } from "@swc/core";
import { subtle } from "node:crypto";
import { existsSync, promises } from "node:fs";
import { dirname, join as pathJoin, sep as pathSep } from "node:path";

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
export async function compileFile(filePath: string) {
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
export async function compileDirectory(
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

      // write compiled file to output directory
      const fileContent = await compileFile(filePath);
      const outputFilePath = pathJoin(outputDir, file.replace(".ts", ".js"));
      await promises.writeFile(outputFilePath, fileContent);
    }
  }
}

/**
 * Compiles a list of files
 */
export async function compileFiles(inputFiles: string[]): Promise<void> {
  for (const file of inputFiles) {
    const [, filePath] = file.split("+public/", 2);
    if (!filePath) {
      throw new Error("Invalid file path");
    }

    const outputFilePath = pathJoin("public", filePath.replace(".ts", ".js"));
    // create output directory if it doesn't exist
    if (!existsSync(outputFilePath)) {
      await promises.mkdir(dirname(outputFilePath), {
        recursive: true,
      });
    }

    // compile file with swc (from next.js)
    const fileContent = await compileFile(filePath);

    // write compiled file to output directory
    await promises.writeFile(outputFilePath, fileContent);
  }
}
