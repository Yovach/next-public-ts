import { defineConfig } from "tsup";

export default defineConfig({
  target: "es2022",
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  splitting: false,
  clean: true,
  dts: true,
  minify: true,
});
