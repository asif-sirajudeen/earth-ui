# 10 — Stop the minimum-release-age exclusions from going stale

**What to build:** The temporary entries in the workspace's `minimumReleaseAgeExclude` list are removed once they are no longer needed, without anyone having to remember. Today the list pins `lucide-react`, Next 16.4.6 (and its SWC binaries) and the fumadocs packages, with a comment asking someone to drop them later.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] Remove every entry that has already aged past the limit, and confirm `pnpm install --frozen-lockfile` still passes.
- [x] Add an automated reminder or check (for example in the weekly scheduled workflow) that flags entries older than the release-age limit.
- [x] The comment in the workspace file explains how the list is maintained.

## Resolution

Removed all 13 exclusions (all >1 day old; verified by re-resolving from scratch with none, and that a 2-day limit does fail). Set `minimumReleaseAge: 1440` explicitly and documented maintenance in `pnpm-workspace.yaml`. Added `scripts/check-release-age.mts` (+ test) and a step in the weekly `upstream-check.yml`.
Verified: `pnpm install --frozen-lockfile` passes; re-adding `lucide-react@1.70.0` makes the script exit 1.
