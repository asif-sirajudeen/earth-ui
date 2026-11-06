# 10 — Select, combobox and navigation menu

**What to build:** An app developer can use Select, Combobox and Navigation Menu from the package. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 09 — Menus

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls select, combobox, navigation-menu from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [ ] Dependencies: no new dependencies. The manifest still matches what the source imports: Base UI, class-variance-authority, `cn` and `lucide-react`. Any extra dependency the CLI adds is removed. Every range is set explicitly in the manifest, and no runtime library is a dev dependency only.
- [ ] Built files start with `"use client"` only where upstream's source does: select, combobox have it; navigation-menu does not. The root entry does not.
- [ ] New public subpaths: `/select`, `/combobox`, `/navigation-menu`. The root entry re-exports the new components and their prop types. The ticket records that renaming or removing any of them is a breaking change.
- [ ] Select and Combobox open, filter where relevant, select with the keyboard, and show the selected item. Combobox's input uses the package's Input Group.
- [ ] Navigation Menu opens its content panels with an animation and marks the active link.
- [ ] A dry-run pack still lists only allowed files: build output, the stylesheet, README, licence and the package manifest.
- [ ] The packed tarball installs into the scratch Next.js App Router app, and a production build succeeds with no missing-module or peer warnings. A client component page renders every new component.
- [ ] Every new component is checked in the browser in light mode and under the `.dark` class, with readable text. Interactive ones are operated with mouse and keyboard.
- [ ] Phase 1's server-component checks still pass: Button, Input, Label and `buttonVariants()` on a link.
- [ ] A changeset requests a minor release and names the components added.
