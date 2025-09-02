// src/index.ts
import type { LoaderContext, SourceMapDevToolPlugin } from "webpack";
import { PluginOptions } from "./types";
export function loader(
  this: LoaderContext<PluginOptions>,
  source: string | Buffer,
  sourceMap?: null | string | any,
) {
  const options = this.getOptions();
  this.cacheable?.();

  console.log(this, options);

  const result = `export default ${JSON.stringify(source)};`;
  this.callback(null, result, sourceMap);
}
