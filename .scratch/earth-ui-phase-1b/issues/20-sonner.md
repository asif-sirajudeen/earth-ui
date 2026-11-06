# 20 — Sonner (optional)

**What to build:** An app developer who already uses sonner and next-themes can use the shadcn Sonner Toaster from its own subpath. The shadcn CLI hides Sonner in Base UI projects and points to Toast, so this ticket starts with the maintainer's decision to ship it or drop it. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 19 — Code block and highlighting hook

**Status:** needs-human (ship-or-drop decision); the code change can be done by an agent

- [ ] The maintainer decides whether to ship Sonner. If they drop it, this ticket closes, the spec's open decision is updated, and nothing below applies.
- [ ] The shadcn CLI `add` command pulls sonner from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift.
- [ ] Dependencies: `sonner` and `next-themes` are added as optional peer dependencies, each with a caret range on its current minor. They are peers because the app calls sonner's `toast()` and mounts the theme provider itself, so both sides must share one copy of each. Every range is set explicitly in the manifest, and no runtime library is a dev dependency only.
- [ ] Every built file for sonner starts with `"use client"`, as upstream's source does. The root entry does not.
- [ ] New public subpath: `/sonner`. The root entry does not re-export it. The ticket records that renaming or removing it is a breaking change.
- [ ] Sonner is subpath-only. The root entry keeps Toast's `Toaster`, because the names collide.
- [ ] A scratch app without sonner or next-themes still builds from the root entry.
- [ ] In a scratch app with next-themes, a toast fired with the app's own `sonner` import appears in the package's Toaster, and follows the theme in light and dark. The `cn-toast` class is kept as an unstyled upstream hook.
- [ ] A dry-run pack still lists only allowed files: build output, the stylesheet, README, licence and the package manifest.
- [ ] The packed tarball installs into the scratch Next.js App Router app, and a production build succeeds with no missing-module or peer warnings. A client component page renders every new component.
- [ ] Every new component is checked in the browser in light mode and under the `.dark` class, with readable text. Interactive ones are operated with mouse and keyboard.
- [ ] Phase 1's server-component checks still pass: Button, Input, Label and `buttonVariants()` on a link.
- [ ] A changeset requests a minor release and names the components added.
