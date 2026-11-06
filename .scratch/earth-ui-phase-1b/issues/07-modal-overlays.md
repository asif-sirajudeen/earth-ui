# 07 — Modal overlays

**What to build:** An app developer can open modal overlays from the package: Dialog, Alert Dialog and Sheet. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 06 — Tabs, scroll area, accordion and AI trace pieces

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls dialog, alert-dialog, sheet from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [ ] Dependencies: no new dependencies. The manifest still matches what the source imports: Base UI, class-variance-authority, `cn` and `lucide-react`. Any extra dependency the CLI adds is removed. Every range is set explicitly in the manifest, and no runtime library is a dev dependency only.
- [ ] Every built file for dialog, alert-dialog, sheet starts with `"use client"`, as upstream's source does. The root entry does not.
- [ ] New public subpaths: `/dialog`, `/alert-dialog`, `/sheet`. The root entry re-exports the new components and their prop types. The ticket records that renaming or removing any of them is a breaking change.
- [ ] Each overlay animates in and out, traps focus while open, closes with Escape, and returns focus to its trigger.
- [ ] Sheet opens from each side.
- [ ] The close icons render, and the overlay backdrop is visible in both themes.
- [ ] A dry-run pack still lists only allowed files: build output, the stylesheet, README, licence and the package manifest.
- [ ] The packed tarball installs into the scratch Next.js App Router app, and a production build succeeds with no missing-module or peer warnings. A client component page renders every new component.
- [ ] Every new component is checked in the browser in light mode and under the `.dark` class, with readable text. Interactive ones are operated with mouse and keyboard.
- [ ] Phase 1's server-component checks still pass: Button, Input, Label and `buttonVariants()` on a link.
- [ ] A changeset requests a minor release and names the components added.
