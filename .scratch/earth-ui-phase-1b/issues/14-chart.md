# 14 — Chart

**What to build:** An app developer can build charts with the shadcn Chart wrapper on recharts, using the theme's chart colours. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 13 — Carousel

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls chart from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift.
- [ ] Dependencies: `recharts` is added as a regular dependency at the upstream pin's minor (`~3.8.0`) until a newer minor is checked. Its required `react-is` peer is installed automatically, and the install shows no peer warnings. Every range is set explicitly in the manifest, and no runtime library is a dev dependency only.
- [ ] Every built file for chart starts with `"use client"`, as upstream's source does. The root entry does not.
- [ ] New public subpath: `/chart`. The root entry re-exports the new components and their prop types. The ticket records that renaming or removing it is a breaking change.
- [ ] A bar chart and a line chart render with the five chart colour tokens, and the tooltip and legend render in both themes.
- [ ] A dry-run pack still lists only allowed files: build output, the stylesheet, README, licence and the package manifest.
- [ ] The packed tarball installs into the scratch Next.js App Router app, and a production build succeeds with no missing-module or peer warnings. A client component page renders every new component.
- [ ] Every new component is checked in the browser in light mode and under the `.dark` class, with readable text. Interactive ones are operated with mouse and keyboard.
- [ ] Phase 1's server-component checks still pass: Button, Input, Label and `buttonVariants()` on a link.
- [ ] A changeset requests a minor release and names the components added.
