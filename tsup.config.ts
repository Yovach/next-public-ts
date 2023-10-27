import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src'],
  splitting: true,
  format: ["cjs", "esm"],
  clean: true,
  dts: true,
  minify: true,
})