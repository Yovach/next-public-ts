// src/index.ts
import type { LoaderContext } from "webpack";
import type { PluginOptions } from "./types.ts";
import { transformFileContent } from "./utils.ts";
export async function loader(
  this: LoaderContext<PluginOptions>,
  source: string | Buffer,
  sourceMap?: null | string | any,
): Promise<string> {
  if (typeof source !== "string") {
    throw new Error("Only text files are supported by `next-public`");
  }

  this.cacheable?.();

  return await transformFileContent(source);
}
