# 05 — Grouped and form controls

**What to build:** An app developer can build grouped controls and complete form fields: Slider, Native Select, Breadcrumb, Button Group, Item, Field, Pagination and Toggle Group. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 04 — Icons, animations and shadcn variants arrive

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls slider, native-select, breadcrumb, button-group, item, field, pagination, toggle-group from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [ ] Dependencies: no new dependencies. The manifest still matches what the source imports: Base UI, class-variance-authority, `cn` and `lucide-react`. Any extra dependency the CLI adds is removed. Every range is set explicitly in the manifest, and no runtime library is a dev dependency only.
- [ ] Built files start with `"use client"` only where upstream's source does: field, toggle-group have it; slider, native-select, breadcrumb, button-group, item, pagination do not. The root entry does not.
- [ ] New public subpaths: `/slider`, `/native-select`, `/breadcrumb`, `/button-group`, `/item`, `/field`, `/pagination`, `/toggle-group`. The root entry re-exports the new components and their prop types. The ticket records that renaming or removing any of them is a breaking change.
- [ ] Slider and Toggle Group work in both orientations, and Button Group and Field render their horizontal and vertical layouts.
- [ ] Field composes Label and Separator from the package, and a checked control inside it gets the checked style.
- [ ] Pagination's links use the button styles. The open `buttonVariants` border decision is noted, not fixed.
- [ ] A dry-run pack still lists only allowed files: build output, the stylesheet, README, licence and the package manifest.
- [ ] The packed tarball installs into the scratch Next.js App Router app, and a production build succeeds with no missing-module or peer warnings. A client component page renders every new component.
- [ ] Every new component is checked in the browser in light mode and under the `.dark` class, with readable text. Interactive ones are operated with mouse and keyboard.
- [ ] Phase 1's server-component checks still pass: Button, Input, Label and `buttonVariants()` on a link.
- [ ] A changeset requests a minor release and names the components added.
