# 08 — Floating overlays

**What to build:** An app developer can show floating content from the package: Popover, Tooltip and Hover Card. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 07 — Modal overlays

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls popover, tooltip, hover-card from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [ ] Dependencies: no new dependencies. The manifest still matches what the source imports: Base UI, class-variance-authority, `cn`. Any extra dependency the CLI adds is removed. Every range is set explicitly in the manifest, and no runtime library is a dev dependency only.
- [ ] Every built file for popover, tooltip, hover-card starts with `"use client"`, as upstream's source does. The root entry does not.
- [ ] New public subpaths: `/popover`, `/tooltip`, `/hover-card`. The root entry re-exports the new components and their prop types. The ticket records that renaming or removing any of them is a breaking change.
- [ ] The scratch app wraps its layout in the Tooltip provider, as upstream requires, and the ticket records this for the future README.
- [ ] Each overlay animates in and out from the side it is placed on, and stays readable in dark mode.
- [ ] A dry-run pack still lists only allowed files: build output, the stylesheet, README, licence and the package manifest.
- [ ] The packed tarball installs into the scratch Next.js App Router app, and a production build succeeds with no missing-module or peer warnings. A client component page renders every new component.
- [ ] Every new component is checked in the browser in light mode and under the `.dark` class, with readable text. Interactive ones are operated with mouse and keyboard.
- [ ] Phase 1's server-component checks still pass: Button, Input, Label and `buttonVariants()` on a link.
- [ ] A changeset requests a minor release and names the components added.
