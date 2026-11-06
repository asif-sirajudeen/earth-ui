# 18 — Message scroller and questionnaire

**What to build:** An app developer can build chat views with Message Scroller and Questionnaire, which build on shadcn's own React package. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 17 — Resizable

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls message-scroller, questionnaire from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [ ] Dependencies: `@shadcn/react` is added as a regular dependency pinned to its current minor (`~0.3.1`), following the `cn` precedent for 0.x packages. Every range is set explicitly in the manifest, and no runtime library is a dev dependency only.
- [ ] Every built file for message-scroller, questionnaire starts with `"use client"`, as upstream's source does. The root entry does not.
- [ ] New public subpaths: `/message-scroller`, `/questionnaire`. The root entry re-exports the new components and their prop types. The ticket records that renaming or removing any of them is a breaking change.
- [ ] Message Scroller sticks to the bottom as messages arrive and shows its bottom scroll fade. Questionnaire options show checked and disabled states.
- [ ] A dry-run pack still lists only allowed files: build output, the stylesheet, README, licence and the package manifest.
- [ ] The packed tarball installs into the scratch Next.js App Router app, and a production build succeeds with no missing-module or peer warnings. A client component page renders every new component.
- [ ] Every new component is checked in the browser in light mode and under the `.dark` class, with readable text. Interactive ones are operated with mouse and keyboard.
- [ ] Phase 1's server-component checks still pass: Button, Input, Label and `buttonVariants()` on a link.
- [ ] A changeset requests a minor release and names the components added.
