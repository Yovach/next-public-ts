import type { Options as SwcOptions } from "@swc/core";
import { webcrypto } from "node:crypto";
import { existsSync, promises } from "node:fs";
import { dirname, join as pathJoin } from "node:path";
import {
  HANDLED_GLOB_EXTENSIONS,
  HANDLED_REGEX_EXTENSIONS,
  PUBLIC_ENV_REGEX,
  encoder,
} from "./constants";

type SwcCompiler = Awaited<ReturnType<typeof getSwcCompiler>>;

/**
 * Calculates the SHA-1 checksum of a given string
 */
export async function calculateChecksum(fileContent: string): Promise<string> {
  const checksum = await webcrypto.subtle.digest(
    "SHA-1",
    encoder.encode(fileContent),
  );
  const checksumStr = Array.from(new Uint8Array(checksum))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return checksumStr;
}

function getEnvVar(name: string): string {
  const value = process.env[`NEXT_PUBLIC_${name}`];
  if (!value) {
    console.warn(
      `[next-public] Environment variable NEXT_PUBLIC_${name} is not defined`,
    );
    return '""';
  }
  return `"${value}"`;
}

/**
 * Compiles a file with swc and replace %checksum% with the SHA-1 checksum of the file
 */
export async function compileFile(
  compiler: SwcCompiler,
  filePath: string,
): Promise<string> {
  let fileContent = await promises.readFile(filePath, "utf-8");

  // replace process.env.NEXT_PUBLIC_* with the actual value
  // or an empty string if it's not defined
  fileContent = fileContent.replace(PUBLIC_ENV_REGEX, (_, envVar) =>
    getEnvVar(envVar),
  );

  const transformed = await compiler.transform(fileContent, getSwcOptions());
  transformed.code = transformed.code.replace(
    /%checksum%/g,
    await calculateChecksum(transformed.code),
  );
  return transformed.code;
}

/**
 * Get SWC options for compiling TypeScript files
 * @link https://swc.rs/docs/configuration/swcrc#compilation
 */
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
    isModule: "unknown",
    minify: true,
  };
}

/**
 * Creates a directory if it doesn't exist
 */
async function createDirectoryIfNotExists(dir: string) {
  if (!existsSync(dir)) {
    await promises.mkdir(dirname(dir), { recursive: true });
  }
}

/**
 * Compiles files in a directory
 */
export async function compileDirectories(
  directories: string[],
  outputDir: string,
) {
  const swc = await getSwcCompiler();
  for (const directory of directories) {
    const files = await glob(`${directory}/**/*.${HANDLED_GLOB_EXTENSIONS}`);
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
      const fileContent = await compileFile(swc, inputFilePath);

      // write compiled file to output directory
      await promises.writeFile(outputFilePath, fileContent);
    }
  }
}

/**
 * Compiles a list of files
 */
export async function compileFiles(inputFiles: string[]) {
  const swc = await getSwcCompiler();
  for (const file of inputFiles) {
    const [, filePath] = file.split("+public/", 2);
    if (!filePath) {
      throw new Error("Invalid file path");
    }

    // create output directory if it doesn't exist
    const outputFilePath = pathJoin(
      "public",
      filePath.replace(HANDLED_REGEX_EXTENSIONS, ".js")
    );
    await createDirectoryIfNotExists(outputFilePath);

    // compile file with swc (from next.js)
    const fileContent = await compileFile(swc, file);

    // write compiled file to output directory
    await promises.writeFile(outputFilePath, fileContent);
  }
}

/**
 * Get SWC compiler from next.js
 * or @swc/core (fallback)
 */
export async function getSwcCompiler() {
  try {
    return await import("next/dist/build/swc/index.js");
  } catch (e) {
    console.warn(
      "[next-public] Failed to import `next/dist/build/swc`, fallback to `@swc/core`",
    );
  }
  // fallback to @swc/core if next/dist/build/swc is not available
  return import("@swc/core");
}

/**
 * Get compiled `glob` package from next.js
 * or glob (fallback)
 */
export async function getGlobPackage() {
  try {
    return import("next/dist/compiled/glob/glob.js");
  } catch (e) {
    console.warn(
      "[next-public] Failed to import `next/dist/compiled/glob`, fallback to `glob`",
    );
  }
  // fallback to glob if next/dist/compiled/glob is not available
  return import("glob");
}

export async function glob(pattern: string) {
  const globPkg = await getGlobPackage();

  return new Promise<string[]>((resolve, reject) => {
    globPkg.default(
      pattern,
      { ignore: ["node_modules/**", "public"] },
      (err, matches) => {
        if (err) {
          reject(err);
        } else {
          resolve(matches);
        }
      },
    );
  });
}
