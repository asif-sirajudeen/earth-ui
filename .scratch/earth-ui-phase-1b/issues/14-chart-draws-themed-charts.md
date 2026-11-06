# 14 — Chart draws recharts charts in theme colours

**What to build:** An app developer can build charts with the shadcn Chart wrapper on recharts, using the theme's chart colours. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 13 — Carousel slides content with embla

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls chart from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift.
- [ ] Dependencies: `recharts` is added as a regular dependency, with the range that the spec's ranges rule gives (it names recharts as its one exception). Its required `react-is` peer is installed automatically, and the install shows no peer warnings.
- [ ] Every built file for chart starts with `"use client"`, as upstream's source does. The root entry does not.
- [ ] New public subpath: `/chart`. The root entry re-exports the new components and their prop types.
- [ ] A bar chart and a line chart render with the five chart colour tokens, and the tooltip and legend render in both themes.
- [ ] Spec 1b's per-ticket release checklist passes (Testing Decisions).
