# 01 — Content and form basics

**What to build:** An app developer can build simple content and form layouts from the package: Textarea, Input Group, Alert, Badge, Card, Kbd, Skeleton and Empty. These need nothing new, so this ticket proves that the phase 1 pipeline scales to a batch of eight. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 07 — CI publishes 0.1.1 through trusted publishing (phase 1 ticket, in the phase 1 issues folder). This edge crosses folders: phase 1b starts only after phase 1's exit checks pass.

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls textarea, input-group, alert, badge, card, kbd, skeleton, empty from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [ ] Dependencies: no new dependencies. The manifest still matches what the source imports: Base UI, class-variance-authority, `cn`. Any extra dependency the CLI adds is removed. Every range is set explicitly in the manifest, and no runtime library is a dev dependency only.
- [ ] Built files start with `"use client"` only where upstream's source does: input-group has it; textarea, alert, badge, card, kbd, skeleton, empty do not. The root entry does not.
- [ ] New public subpaths: `/textarea`, `/input-group`, `/alert`, `/badge`, `/card`, `/kbd`, `/skeleton`, `/empty`. The root entry re-exports the new components and their prop types. The ticket records that renaming or removing any of them is a breaking change.
- [ ] Input Group's addons render around Input and Textarea, and its button addon uses the shipped Button.
- [ ] A dry-run pack still lists only allowed files: build output, the stylesheet, README, licence and the package manifest.
- [ ] The packed tarball installs into the scratch Next.js App Router app, and a production build succeeds with no missing-module or peer warnings. A client component page renders every new component.
- [ ] Every new component is checked in the browser in light mode and under the `.dark` class, with readable text. Interactive ones are operated with mouse and keyboard.
- [ ] Phase 1's server-component checks still pass: Button, Input, Label and `buttonVariants()` on a link.
- [ ] A changeset requests a minor release and names the components added.
