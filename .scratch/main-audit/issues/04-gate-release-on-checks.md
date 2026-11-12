# 04 — Gate the npm release on the full check suite

**What to build:** The release workflow refuses to publish to npm unless lint, typecheck, tests and the CLI smoke test pass on the exact commit it is about to publish. Today the pack job only runs the build and then publishes, so a broken commit with a pending changeset reaches npm.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] The release workflow runs typecheck, lint and tests (and the CLI smoke the build job runs in CI) before packing, or depends on a CI run that did for the same commit.
- [x] A failure in any check stops the release before anything is published.
- [x] Trusted publishing and the existing least-privilege permissions stay as they are.
- [ ] Verified by a dry run (for example on a fork or with publish disabled) where a deliberately failing test stops the release.

## Resolution

`release.yml` has a new `verify` job (lint, typecheck, test, build + `scripts/smoke-cli.sh`, package smoke); `pack` now `needs: [select-mode, verify]`, so publish cannot run on failure. CLI smoke moved from ci.yml into `scripts/smoke-cli.sh`, shared by both. Permissions unchanged.
Verified: smoke script runs green locally. Not met: a real workflow dry run with a failing test (needs GitHub Actions).
