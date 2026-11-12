# 11 — Silence the Prettier unknown-option warnings

**What to build:** `pnpm format:check` and `pnpm format:write` run without warnings. Today every run prints `Ignored unknown option { importOrder: ... }` and `importOrderParserPlugins`, because the generated-barrel override removes the sort-imports plugin but keeps its options. The warnings are harmless but train people to ignore Prettier output.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] Formatting the generated barrel (`src/index.ts`) no longer prints warnings, and its import/export grouping stays intact.
- [x] All other files still get import sorting.
- [x] `pnpm format:check` output contains no `[warn]` lines.

## Resolution

Sort-imports plugin and its `importOrder*` options now live in one override (`excludeFiles: src/index.ts`), so the barrel never sees them. `src/index.ts` still passes; a scrambled import in another file is still sorted.
Verified: `pnpm format:check` has no warnings on tracked files. The only remaining `[warn]` lines come from the untracked stale `.claude/worktrees/` copy with its own old config (not in CI).
