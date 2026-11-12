# 12 — Detect drift in the ejected shadcn CSS block

**What to build:** When shadcn changes its Tailwind CSS (keyframes, custom variants, utilities), earth-ui finds out automatically. Today the package stylesheet contains a block copied verbatim from `shadcn@4.23.0`, and its comment asks for a manual diff on every upgrade.

**Blocked by:** None — can start immediately.

**Status:** done — no code change

- [x] Confirm whether `upstream:check` already compares this CSS block against the pinned shadcn version. If it does, close this ticket with a note.
- [ ] If it does not, the weekly upstream check (or the existing registry end-marker check) fails when the ejected block differs from the pinned shadcn's CSS.
- [ ] Bumping the shadcn pin without refreshing the block makes the check fail.

## Resolution

`upstream:check` does not cover it, but existing checks do: `registry-items.test.mts` asserts the block equals `node_modules/shadcn/dist/tailwind.css`, and `styleItem` calls `assertShadcnPin`, failing `registry:check` (CI `generated` job) when the markers differ from `devDependencies.shadcn`. Both run in CI on every PR, so a pin bump without re-ejecting fails. Closed with this note.
