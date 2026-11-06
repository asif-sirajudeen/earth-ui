# 15 — Command

**What to build:** An app developer can build a command menu with Command on cmdk, including the dialog form. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 14 — Chart

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls command from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift.
- [ ] Dependencies: `cmdk` is added as a regular dependency with a caret range on 1.1. The ticket notes that cmdk brings Radix dialog primitives in as transitive dependencies. Every range is set explicitly in the manifest, and no runtime library is a dev dependency only.
- [ ] Every built file for command starts with `"use client"`, as upstream's source does. The root entry does not.
- [ ] New public subpath: `/command`. The root entry re-exports the new components and their prop types. The ticket records that renaming or removing it is a breaking change.
- [ ] Typing filters the items. Arrow keys move the selected item and show the selected style. The dialog form opens through the package's Dialog.
- [ ] A dry-run pack still lists only allowed files: build output, the stylesheet, README, licence and the package manifest.
- [ ] The packed tarball installs into the scratch Next.js App Router app, and a production build succeeds with no missing-module or peer warnings. A client component page renders every new component.
- [ ] Every new component is checked in the browser in light mode and under the `.dark` class, with readable text. Interactive ones are operated with mouse and keyboard.
- [ ] Phase 1's server-component checks still pass: Button, Input, Label and `buttonVariants()` on a link.
- [ ] A changeset requests a minor release and names the components added.
