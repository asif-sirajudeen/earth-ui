# 13 — Carousel slides content with embla

**What to build:** An app developer can show a carousel built on embla. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 12 — Calendar picks dates with react-day-picker

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls carousel from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift.
- [ ] Dependencies: `embla-carousel-react` is added as a regular dependency, with the range that the spec's ranges rule gives.
- [ ] Every built file for carousel starts with `"use client"`, as upstream's source does. The root entry does not.
- [ ] New public subpath: `/carousel`. The root entry re-exports the new components and their prop types.
- [ ] The previous and next buttons move the carousel and disable at the ends. Arrow keys work. Horizontal and vertical orientations both work.
- [ ] Spec 1b's per-ticket release checklist passes (Testing Decisions).
