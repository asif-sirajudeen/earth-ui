import { defineConfig } from "tsdown";

export default defineConfig({
  // The build emits only modules reachable from an entry, so every
  // subpath-only module (not re-exported from the root) needs its own entry.
  entry: [
    "src/index.ts",
    "src/components/sonner.tsx",
    "src/hooks/use-highlighted-code.ts",
  ],
  format: "esm",
  dts: true,
  // One output file per source file, so each file keeps its own "use client".
  unbundle: true,
  // Emit .js / .d.ts (not .mjs / .d.mts) to match the exports map.
  fixedExtension: false,
});
