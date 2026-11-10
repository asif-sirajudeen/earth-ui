# Generated registry metadata

earth-ui does not generate `registry/metadata.ts`. Every entry (title, description, `meta.links`) is written and maintained by hand.

## Why this is out of scope

Only part of an entry can be derived, and the derived part is not always the value we want:

- `description` is our own writing. shadcn's registry items (`https://ui.shadcn.com/r/styles/base-nova/<name>.json`) publish no `title` or `description`.
- `title` is the title-cased file name for most items, but not for all (`Input OTP`, `useHighlightedCode`, `useIsMobile`).
- `meta.links` matches shadcn's `meta.links` for most components, but some entries differ on purpose or have no upstream links at all:
  - `attachment`, `bubble`, `marker`, `message` and `message-scroller` have no upstream links, so their `docs` link is ours.
  - `hover-card` points `api` at Base UI's `preview-card.md`, `carousel` uses a different Embla URL, and `label` has no `api` link.

A generator, or a scaffold that fetches links from shadcn, would overwrite these choices or hide them behind a network call. Hand-written entries keep each link a deliberate decision, and `pnpm registry` already fails when a component or hook has no entry.

After `shadcn add <name>`, add the entry for `<name>` by hand. `src/index.ts` is generated (`pnpm index`); `registry/metadata.ts` is not.

## Prior requests

- Declined in a local working session (2026-11-10): "generate metadata.ts from shadcn".
