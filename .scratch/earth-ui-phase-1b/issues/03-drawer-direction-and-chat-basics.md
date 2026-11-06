# 03 — Drawer, direction and chat basics

**What to build:** An app developer can use the Base UI Drawer, set text direction for the whole package with the Direction provider, and lay out chat messages with Bubble, Marker and Message. This completes batch A. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 02 — Display and state primitives

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls drawer, direction, bubble, marker, message from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [ ] Dependencies: no new dependencies. The manifest still matches what the source imports: Base UI, class-variance-authority, `cn`. Any extra dependency the CLI adds is removed. Every range is set explicitly in the manifest, and no runtime library is a dev dependency only.
- [ ] Built files start with `"use client"` only where upstream's source does: drawer, direction have it; bubble, marker, message do not. The root entry does not.
- [ ] New public subpaths: `/drawer`, `/direction`, `/bubble`, `/marker`, `/message`. The root entry re-exports the new components and their prop types. The ticket records that renaming or removing any of them is a breaking change.
- [ ] Drawer opens, can be swiped or dismissed, and closes, using only Tailwind's built-in data-attribute variants.
- [ ] The Direction subpath re-exports exactly Base UI's direction provider and hook, and nothing else. The ticket notes that this subpath now follows Base UI's API.
- [ ] Wrapping the page in the Direction provider set to right-to-left flips Drawer's side.
- [ ] A dry-run pack still lists only allowed files: build output, the stylesheet, README, licence and the package manifest.
- [ ] The packed tarball installs into the scratch Next.js App Router app, and a production build succeeds with no missing-module or peer warnings. A client component page renders every new component.
- [ ] Every new component is checked in the browser in light mode and under the `.dark` class, with readable text. Interactive ones are operated with mouse and keyboard.
- [ ] Phase 1's server-component checks still pass: Button, Input, Label and `buttonVariants()` on a link.
- [ ] A changeset requests a minor release and names the components added.
