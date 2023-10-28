import { globSync } from "fast-glob";
import type { Compiler } from "webpack";
import { compileDirectory, compileFiles } from "./utils";

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
            try {
              await Promise.all(
                this.#autoDetect
                  ? compileFiles(this.#input)
                  : this.#input.map(async (inputDir) =>
                      compileDirectory(inputDir, this.#output)
                    )
              );
            } catch (e) {
              console.error(e);
            }
          }
        );
      }
    );
  }
}

export { NextPublicTsPlugin };
