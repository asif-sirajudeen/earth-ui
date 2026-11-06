# 02 — Display and state primitives

**What to build:** An app developer can show avatars, fixed-ratio media, progress, tables, toggle buttons and collapsible sections from the package. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 01 — Content and form basics

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls avatar, aspect-ratio, progress, table, toggle, collapsible from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [ ] Dependencies: no new dependencies. The manifest still matches what the source imports: Base UI, class-variance-authority, `cn`. Any extra dependency the CLI adds is removed. Every range is set explicitly in the manifest, and no runtime library is a dev dependency only.
- [ ] Built files start with `"use client"` only where upstream's source does: avatar, progress, table, toggle, collapsible have it; aspect-ratio does not. The root entry does not.
- [ ] New public subpaths: `/avatar`, `/aspect-ratio`, `/progress`, `/table`, `/toggle`, `/collapsible`. The root entry re-exports the new components and their prop types. The ticket records that renaming or removing any of them is a breaking change.
- [ ] Toggle switches its pressed style when clicked, and Collapsible opens and closes its panel.
- [ ] Avatar shows its fallback when the image fails to load.
- [ ] A dry-run pack still lists only allowed files: build output, the stylesheet, README, licence and the package manifest.
- [ ] The packed tarball installs into the scratch Next.js App Router app, and a production build succeeds with no missing-module or peer warnings. A client component page renders every new component.
- [ ] Every new component is checked in the browser in light mode and under the `.dark` class, with readable text. Interactive ones are operated with mouse and keyboard.
- [ ] Phase 1's server-component checks still pass: Button, Input, Label and `buttonVariants()` on a link.
- [ ] A changeset requests a minor release and names the components added.
