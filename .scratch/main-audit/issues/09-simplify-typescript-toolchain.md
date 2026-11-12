# 09 — Simplify the dual TypeScript toolchain

**What to build:** The repo builds and type-checks with one clearly chosen TypeScript setup. Today `typescript` is aliased to `@typescript/typescript6` for typescript-eslint, `@typescript/native` 7 sits beside it, and the build config admits the emitted declaration files differ between the two (union member order). This breaks easily on upgrades.

**Blocked by:** None — can start immediately.

**Status:** partial — documented

- [x] Decide and record which TypeScript version emits the shipped `.d.ts` and which one lint uses, and why.
- [x] Remove the alias or the second compiler if typescript-eslint and tsdown now support a single version. Otherwise, document the exit condition next to the alias.
- [x] `pnpm typecheck`, `pnpm lint` and `pnpm build` pass, and the published declaration files are unchanged or the changes are reviewed.

## Resolution

A single TypeScript is not feasible yet: typescript-eslint 8.72.2 peers `typescript <6.1.0`. Decision recorded in README 'Maintainers: TypeScript versions' (TS7 for `tsc`, TS6 for lint and the shipped .d.ts) with the exit condition, and referenced from `tsdown.config.ts`. No dependency changes, so `.d.ts` output is unchanged.
Verified: typecheck, lint and build pass.
