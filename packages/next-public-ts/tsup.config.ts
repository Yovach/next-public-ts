import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src"],
  format: ["cjs", "esm"],
  splitting: false,
  clean: true,
  dts: true,
  minify: true,
});
