import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  dts: true,
  // One output file per source file, so each file keeps its own "use client".
  unbundle: true,
  // Emit .js / .d.ts (not .mjs / .d.mts) to match the exports map.
  fixedExtension: false,
});
