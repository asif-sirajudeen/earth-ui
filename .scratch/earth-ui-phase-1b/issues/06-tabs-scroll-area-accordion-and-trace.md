# 06 — Tabs, scroll area, accordion and AI trace pieces

**What to build:** An app developer can use Tabs, Scroll Area and Accordion, plus Attachment and Trace, the first components that use shadcn's shimmer and scroll-fade utilities. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 05 — Grouped and form controls

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls tabs, scroll-area, accordion, attachment, trace from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [ ] Dependencies: no new dependencies. The manifest still matches what the source imports: Base UI, class-variance-authority, `cn` and `lucide-react`. Any extra dependency the CLI adds is removed. Every range is set explicitly in the manifest, and no runtime library is a dev dependency only.
- [ ] Built files start with `"use client"` only where upstream's source does: tabs, scroll-area have it; accordion, attachment, trace do not. The root entry does not.
- [ ] New public subpaths: `/tabs`, `/scroll-area`, `/accordion`, `/attachment`, `/trace`. The root entry re-exports the new components and their prop types. The ticket records that renaming or removing any of them is a breaking change.
- [ ] Accordion panels animate their height open and closed, using shadcn's accordion keyframes and not the tw-animate-css ones.
- [ ] Tabs show the active tab style in both orientations. Scroll Area shows horizontal and vertical scrollbars.
- [ ] Attachment's scroll fade and shimmer render. Trace's shimmer stops when reduced motion is on, and Trace expands through the package's Collapsible.
- [ ] A dry-run pack still lists only allowed files: build output, the stylesheet, README, licence and the package manifest.
- [ ] The packed tarball installs into the scratch Next.js App Router app, and a production build succeeds with no missing-module or peer warnings. A client component page renders every new component.
- [ ] Every new component is checked in the browser in light mode and under the `.dark` class, with readable text. Interactive ones are operated with mouse and keyboard.
- [ ] Phase 1's server-component checks still pass: Button, Input, Label and `buttonVariants()` on a link.
- [ ] A changeset requests a minor release and names the components added.
