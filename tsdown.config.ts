import { defineConfig } from "tsdown"

export default defineConfig([
  {
    // The build emits only modules reachable from an entry, so every
    // subpath-only module (not re-exported from the root) needs its own entry.
    entry: [
      "src/index.ts",
      "src/components/sonner.tsx",
      "src/hooks/use-highlighted-code.ts",
      "src/hooks/use-mobile.ts",
    ],
    format: "esm",
    // Emitted by TS 6: `typescript` is aliased to @typescript/typescript6 for
    // typescript-eslint, and the dts plugin's TS 7.0 backend only runs when
    // `typescript` itself is 7.0. Union member order differs from TS 7; types don't.
    dts: true,
    // One output file per source file, so each file keeps its own "use client".
    unbundle: true,
    // Emit .js / .d.ts (not .mjs / .d.mts) to match the exports map.
    fixedExtension: false,
  },
  {
    // The earth-ui bin: one Node file, stdlib only. clean: false keeps the library output above.
    entry: { cli: "cli/earth-ui.mts" },
    format: "esm",
    platform: "node",
    dts: false,
    clean: false,
    fixedExtension: false,
  },
])
