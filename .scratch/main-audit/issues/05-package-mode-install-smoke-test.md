# 05 — Smoke test package mode in a fresh consumer app

**What to build:** CI packs the npm tarball, installs it into a fresh React 19 + Tailwind 4 project as a consumer would, and proves package mode works end to end. Copy mode already has this (`registry:smoke --install`); package mode has nothing equivalent.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] CI packs the package and installs the tarball (not a workspace link) into a throwaway project.
- [x] The project imports from the package root, from a component subpath (for example `/button`), and from each optional subpath (`/sonner`, `/use-highlighted-code`, `/use-mobile`), and `tsc` passes.
- [x] Tailwind compiles the consumer CSS, which imports Tailwind and then the package stylesheet, and the output contains classes used only inside package components (proving the stylesheet's `@source` reaches the installed `dist`).
- [x] The installed `earth-ui` bin runs (`list`, `docs dialog`) from the consumer project.
- [x] A deliberately broken `exports` entry makes the check fail.

## Resolution

Added `scripts/smoke-package.mts`, `pnpm package:smoke`, and a `package-install` CI job (also run in the release `verify` job). Packs the tarball, installs into a fresh React 19 + Tailwind 4 app, typechecks imports (skipLibCheck off), imports each specifier in Node, compiles Tailwind and asserts a button-only class, runs `earth-ui list` and `docs dialog`.
Verified: green; breaking `exports['./use-mobile'].default` fails with ERR_MODULE_NOT_FOUND; removing `@source` from styles.css fails the sentinel check. Note: tsc alone did NOT catch the broken `default` (TS falls back to the .js sibling's .d.ts), hence the Node import step.
