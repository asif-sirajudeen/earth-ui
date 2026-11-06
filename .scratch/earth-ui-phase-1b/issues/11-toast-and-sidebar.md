# 11 — Toast and sidebar

**What to build:** An app developer can show notifications with the Base UI Toast and lay out an app with Sidebar. This completes batch B. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 10 — Select, combobox and navigation menu

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls toast, sidebar from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [ ] Dependencies: no new dependencies. The manifest still matches what the source imports: Base UI, class-variance-authority, `cn` and `lucide-react`. Any extra dependency the CLI adds is removed. Every range is set explicitly in the manifest, and no runtime library is a dev dependency only.
- [ ] Every built file for toast, sidebar starts with `"use client"`, as upstream's source does. The root entry does not.
- [ ] New public subpaths: `/toast`, `/sidebar`. The root entry re-exports the new components and their prop types. The ticket records that renaming or removing any of them is a breaking change.
- [ ] The root entry's `Toaster` comes from Toast.
- [ ] Sidebar's mobile-breakpoint hook is shipped but internal. It is not re-exported from the root, and no subpath reaches it.
- [ ] Sidebar collapses and expands, shows tooltips when collapsed, and becomes a Sheet below the mobile breakpoint.
- [ ] A toast can be triggered, stacks, and can be dismissed.
- [ ] A dry-run pack still lists only allowed files: build output, the stylesheet, README, licence and the package manifest.
- [ ] The packed tarball installs into the scratch Next.js App Router app, and a production build succeeds with no missing-module or peer warnings. A client component page renders every new component.
- [ ] Every new component is checked in the browser in light mode and under the `.dark` class, with readable text. Interactive ones are operated with mouse and keyboard.
- [ ] Phase 1's server-component checks still pass: Button, Input, Label and `buttonVariants()` on a link.
- [ ] A changeset requests a minor release and names the components added.
