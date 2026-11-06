# 14 — Chart draws recharts charts in theme colours

**What to build:** An app developer can build charts with the shadcn Chart wrapper on recharts, using the theme's chart colours. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 13 — Carousel slides content with embla

**Status:** done (70ed327); batch C scratch-app check passed on 2026-11-06 (light and dark); shipped in 0.2.0

- [x] The shadcn CLI `add` command pulls chart from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift.
- [x] Dependencies: `recharts` is added as a regular dependency, with the range that the spec's ranges rule gives (it names recharts as its one exception). Its required `react-is` peer is installed automatically, and the install shows no peer warnings.
- [x] Every built file for chart starts with `"use client"`, as upstream's source does. The root entry does not.
- [x] New public subpath: `/chart`. The root entry re-exports the new components and their prop types.
- [x] A bar chart and a line chart render with the five chart colour tokens, and the tooltip and legend render in both themes.
- [x] Spec 1b's per-ticket release checklist passes (Testing Decisions).

For the README: apps import recharts primitives (`BarChart` and others) themselves, so under pnpm they install `recharts@~3.8.0`; it dedupes to the package's copy.
