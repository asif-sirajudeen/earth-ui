# 16 — Input OTP

**What to build:** An app developer can collect one-time codes with Input OTP. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 15 — Command

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls input-otp from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift.
- [ ] Dependencies: `input-otp` is added as a regular dependency with a caret range on 1.5. Every range is set explicitly in the manifest, and no runtime library is a dev dependency only.
- [ ] Every built file for input-otp starts with `"use client"`, as upstream's source does. The root entry does not.
- [ ] New public subpath: `/input-otp`. The root entry re-exports the new components and their prop types. The ticket records that renaming or removing it is a breaking change.
- [ ] Typing fills the slots and moves the caret. The fake caret blinks through tw-animate-css. Pasting a code fills every slot. The `cn-input-otp` class is kept as an unstyled upstream hook.
- [ ] A dry-run pack still lists only allowed files: build output, the stylesheet, README, licence and the package manifest.
- [ ] The packed tarball installs into the scratch Next.js App Router app, and a production build succeeds with no missing-module or peer warnings. A client component page renders every new component.
- [ ] Every new component is checked in the browser in light mode and under the `.dark` class, with readable text. Interactive ones are operated with mouse and keyboard.
- [ ] Phase 1's server-component checks still pass: Button, Input, Label and `buttonVariants()` on a link.
- [ ] A changeset requests a minor release and names the components added.
