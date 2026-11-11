## What

<!-- What changed and why. Link the issue if there is one. -->

## How to test

<!-- Steps a reviewer can follow, or screenshots for UI changes. -->

## Checklist

- [ ] Changeset added (`pnpm changeset`). CI fails without one when `src/`, `cli/`, `registry/`, `styles.css` or `tsdown.config.ts` change. If the change ships no release, add an empty one (`pnpm changeset --empty`). Docs, site, CI and planning-only PRs need neither
- [ ] `registry.json` regenerated if components changed (`pnpm registry`)
- [ ] `pnpm lint`, `pnpm typecheck` and `pnpm test` pass locally
