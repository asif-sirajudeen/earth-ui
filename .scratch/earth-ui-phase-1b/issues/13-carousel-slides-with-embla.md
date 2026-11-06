# 13 — Carousel slides content with embla

**What to build:** An app developer can show a carousel built on embla. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 12 — Calendar picks dates with react-day-picker

**Status:** done (2acdae2); batch C scratch-app check passed on 2026-11-06 (light and dark); shipped in 0.2.0

- [x] The shadcn CLI `add` command pulls carousel from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift.
- [x] Dependencies: `embla-carousel-react` is added as a regular dependency, with the range that the spec's ranges rule gives.
- [x] Every built file for carousel starts with `"use client"`, as upstream's source does. The root entry does not.
- [x] New public subpath: `/carousel`. The root entry re-exports the new components and their prop types.
- [x] The previous and next buttons move the carousel and disable at the ends. Arrow keys work. Horizontal and vertical orientations both work.
- [x] Spec 1b's per-ticket release checklist passes (Testing Decisions).

Note (2026-11-06): in vertical orientation the buttons move along y, but the keyboard handler still reads only ArrowLeft and ArrowRight. This matches upstream source.
