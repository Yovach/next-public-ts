import type { Compiler } from "webpack";
import { HANDLED_GLOB_EXTENSIONS } from "./constants";
import { PluginOptions } from "./types";
import { addLog } from "./utils";

class NextPublicTsPlugin {
  #input?: string[];
  #output: string;

  #enabled: boolean;
  #autoDetect: boolean = false;
  #shouldLog: boolean = false;
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
      this.#autoDetect = true;
      this.#output = "public";
    }

    this.#shouldLog = options.shouldLog ?? false;
  }

  async compilationPromises() {
    const { compileFiles, compileDirectories } = await import("./utils.js");
    if (this.#autoDetect) {
      const { glob } = await import("glob");
      const files = await glob(`**/+public/**/*.${HANDLED_GLOB_EXTENSIONS}`);
      if (this.#shouldLog) {
        addLog(`Detected ${files.length} files`, "debug");
      }
      return compileFiles(files, this.#shouldLog);
    }

    if (!this.#input) {
      addLog(`No input files detected :/`, "debug");
      return;
    }

    return compileDirectories(this.#input, this.#output, this.#shouldLog);
  }

  apply(compiler: Compiler) {
    if (!this.#enabled) {
      return;
    }

    compiler.hooks.compilation.tap("NextPublicTsPlugin", (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: "NextPublicTsPlugin",
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        async () => {
          try {
            await this.compilationPromises();
          } catch (e) {
            console.error(e);
          }
        },
      );
    });
  }
}

export { NextPublicTsPlugin };
