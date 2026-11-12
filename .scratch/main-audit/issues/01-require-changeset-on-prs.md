# 01 — Require a changeset on PRs that change the package

**What to build:** A pull request that changes shipped package code (components, hooks, styles, CLI, build config) fails CI unless it includes a changeset, or is explicitly marked as not needing a release. Today a PR without a changeset merges and silently releases nothing.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] CI has a dedicated, named check that fails when a package-affecting PR has no changeset.
- [x] PRs that only touch docs, the docs site, CI, or planning files pass without a changeset.
- [x] There is a documented opt-out (for example an empty changeset or a label) for package changes that intentionally ship no release.
- [x] The PR template tells authors how to add a changeset or opt out.
- [ ] Verified on a test PR: fails without a changeset, passes with one.

## Resolution

Added `scripts/check-changeset.mts` (+ test), a `changeset` job in `ci.yml` (PRs only, exempts `changeset-release/main`), and PR-template text. Opt-out is an empty changeset (`pnpm changeset --empty`). Package paths: src/, cli/ (non-test), registry/, styles.css, tsdown.config.ts; package.json is deliberately excluded (devDependency edits would false-positive).
Verified: unit tests; in a throwaway clone a src change failed with no changeset and passed with an empty one.
Not met: 'verified on a test PR' (no PR opened; owner to confirm on the first real PR).
