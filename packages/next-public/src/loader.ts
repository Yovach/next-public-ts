// src/index.ts
import type { LoaderContext, SourceMapDevToolPlugin } from "webpack";
import { PluginOptions } from "./types";
import { transformFileContent } from "./utils";
export async function loader(
  this: LoaderContext<PluginOptions>,
  source: string | Buffer,
  sourceMap?: null | string | any,
) {
  if (typeof source !== "string") {
    throw new Error("Only text files are supported by `next-public`")
  }
  const options = this.getOptions();
  this.cacheable?.();

  console.log(this, options);

  return await transformFileContent(source);
}
