import { transformSync } from "next/dist/build/swc/index.js";
import { existsSync, promises } from "node:fs";
import { join as pathJoin, sep as pathSep } from "node:path";
import { type Compiler } from "webpack";

async function compileDirectory(inputDir: string, outputDir: string) {
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

      // write compiled file to output directory
      const outputFilePath = pathJoin(outputDir, file.replace(".ts", ".js"));
      await promises.writeFile(outputFilePath, transformed.code);
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

  apply(compiler: Compiler) {
    if (!this.enabled) {
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
            await Promise.all(
              this.inputDir.map(async (inputDir) => {
                return compileDirectory(inputDir, this.outputDir);
              })
            );
          }
        );
      }
    );
  }
}

export { NextPublicTsPlugin };
