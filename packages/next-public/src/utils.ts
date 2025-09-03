import type { Options as SwcOptions } from "@swc/core";
import crypto from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join as pathJoin } from "node:path";
import { HANDLED_GLOB_EXTENSIONS, HANDLED_REGEX_EXTENSIONS } from "./constants.ts";

/**
 * Regex pattern for public environment variables
 * Used to replace `process.env.NEXT_PUBLIC_*` with the actual value (or "" if it's not defined)
 */
const PUBLIC_ENV_REGEX = /process\.env\.NEXT_PUBLIC_([a-zA-Z\_]+)/g;

const CHECKSUM_REGEX = /%checksum%/g;

export function addLog(
  message: string,
  level: "info" | "warn" | "debug" | "error",
): void {
  console[level](`[next-public] \n${message}\n`);
}

/**
 * Calculates the SHA-1 checksum of a given string
 */
async function calculateChecksum(fileContent: string): Promise<string> {
  if ("hash" in crypto) {
    // @ts-ignore
    return crypto.hash("sha1", fileContent);
  }

  const hash = crypto.createHash("sha1");
  const checksum = hash.update(fileContent);
  return checksum.digest("hex");
}

function getEnvVar(name: string): string {
  const value = process.env[`NEXT_PUBLIC_${name}`];
  if (!value) {
    addLog(`Environment variable NEXT_PUBLIC_${name} is not defined`, "warn");
    return '""';
  }
  return `"${value}"`;
}

export async function transformFileContent(fileCntent: string): Promise<string> {
  const { transform } = await import("@swc/core");

  const transformed = await transform(fileCntent, getSwcOptions());
  // replace %checksum% with the checksum of the file
  // can be used for service worker versioning
  transformed.code = transformed.code.replace(
    CHECKSUM_REGEX,
    await calculateChecksum(transformed.code),
  );

  // replace process.env.NEXT_PUBLIC_* with the actual value
  // or an empty string if it's not defined
  transformed.code = transformed.code.replace(PUBLIC_ENV_REGEX, (_, envVar) =>
    getEnvVar(envVar),
  );

  return transformed.code;
}

/**
 * Compiles a file with swc and replace %checksum% with the SHA-1 checksum of the file
 */
async function compileFile(filePath: string): Promise<string> {
  const { transformFile } = await import("@swc/core");

  const transformed = await transformFile(filePath, getSwcOptions());
  // replace %checksum% with the checksum of the file
  // can be used for service worker versioning
  transformed.code = transformed.code.replace(
    CHECKSUM_REGEX,
    await calculateChecksum(transformed.code),
  );

  // replace process.env.NEXT_PUBLIC_* with the actual value
  // or an empty string if it's not defined
  transformed.code = transformed.code.replace(PUBLIC_ENV_REGEX, (_, envVar) =>
    getEnvVar(envVar),
  );

  return transformed.code;
}

/**
 * Get SWC options for compiling TypeScript files
 * @link https://swc.rs/docs/configuration/swcrc#compilation
 */
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
    isModule: "unknown",
    minify: true,
  };
}

/**
 * Creates a directory if it doesn't exist
 */
async function createDirectoryIfNotExists(dir: string) {
  await mkdir(dirname(dir), { recursive: true });
}

/**
 * Compiles files in a directory
 */
export async function compileDirectories(
  directories: string[],
  outputDir: string,
  shouldLog: boolean = false,
): Promise<void> {
  const { glob } = await import("glob");
  for (const directory of directories) {
    const files = await glob(`${directory}/**/*.${HANDLED_GLOB_EXTENSIONS}`);
    if (shouldLog) {
      addLog(`\nCompiling ${files.length} files\n`, "debug");
    }
    for (const file of files) {
      const [, filePath] = file.split(directory, 2);
      if (!filePath) {
        throw new Error("Invalid file path");
      }

      // create output directory if it doesn't exist
      const outputFilePath = pathJoin(
        outputDir,
        filePath.replace(HANDLED_REGEX_EXTENSIONS, ".js"),
      );
      await createDirectoryIfNotExists(outputFilePath);

      // compile file with swc (from next.js)
      const inputFilePath = pathJoin(directory, filePath);
      const fileContent = await compileFile(inputFilePath);
      if (shouldLog) {
        addLog(`\nCompiled ${outputFilePath}\n`, "debug");
      }

      // write compiled file to output directory
      await writeFile(outputFilePath, fileContent);
    }

    if (shouldLog) {
      addLog(`\nCompiled ${files.length} files\n`, "debug");
    }
  }
}

/**
 * Compiles a list of files
 */
export async function compileFiles(
  inputFiles: string[],
  shouldLog: boolean = false,
): Promise<void> {
  if (shouldLog) {
    addLog(`\nCompiling ${inputFiles.length} files\n`, "debug");
  }

  for (const file of inputFiles) {
    const [, filePath] = file.split("+public/", 2);
    if (!filePath) {
      throw new Error("Invalid file path");
    }

    // create output directory if it doesn't exist
    const outputFilePath = pathJoin(
      "public",
      filePath.replace(HANDLED_REGEX_EXTENSIONS, ".js"),
    );
    await createDirectoryIfNotExists(outputFilePath);

    // compile file with swc (from next.js)
    const fileContent = await compileFile(file);

    // write compiled file to output directory
    await writeFile(outputFilePath, fileContent);

    if (shouldLog) {
      addLog(`\nCompiled ${outputFilePath}\n`, "debug");
    }
  }

  if (shouldLog) {
    addLog(`\nCompiled ${inputFiles.length} files\n`, "debug");
  }
}
