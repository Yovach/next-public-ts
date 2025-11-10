// src/index.ts
import type { LoaderContext } from "webpack";
import type { PluginOptions } from "./types.ts";
import { transformFileContent } from "./utils.ts";
export async function loader(
  this: LoaderContext<PluginOptions>,
  source: string | Buffer,
): Promise<string> {
  if (typeof source !== "string") {
    throw new Error("Only text files are supported by `next-public`");
  }

  this.cacheable?.();

  console.log(this.getOptions(), this.rootContext, this)

  console.log('compile config')

  const transformedCode = await transformFileContent(source);
  const x = `export default {
  src: "data:application/javascript;base64,${Buffer.from(transformedCode).toString("base64")}",
}`
console.log(x);
return x;
}
