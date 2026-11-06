# 13 — Carousel

**What to build:** An app developer can show a carousel built on embla. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 12 — Calendar

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls carousel from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift.
- [ ] Dependencies: `embla-carousel-react` is added as a regular dependency with a caret range on 8.6. Every range is set explicitly in the manifest, and no runtime library is a dev dependency only.
- [ ] Every built file for carousel starts with `"use client"`, as upstream's source does. The root entry does not.
- [ ] New public subpath: `/carousel`. The root entry re-exports the new components and their prop types. The ticket records that renaming or removing it is a breaking change.
- [ ] The previous and next buttons move the carousel and disable at the ends. Arrow keys work. Horizontal and vertical orientations both work.
- [ ] A dry-run pack still lists only allowed files: build output, the stylesheet, README, licence and the package manifest.
- [ ] The packed tarball installs into the scratch Next.js App Router app, and a production build succeeds with no missing-module or peer warnings. A client component page renders every new component.
- [ ] Every new component is checked in the browser in light mode and under the `.dark` class, with readable text. Interactive ones are operated with mouse and keyboard.
- [ ] Phase 1's server-component checks still pass: Button, Input, Label and `buttonVariants()` on a link.
- [ ] A changeset requests a minor release and names the components added.
