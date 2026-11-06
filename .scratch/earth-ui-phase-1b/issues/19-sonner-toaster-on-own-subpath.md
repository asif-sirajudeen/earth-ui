# 19 — Sonner Toaster is available from its own subpath

**What to build:** An app developer who already uses sonner and next-themes can use the shadcn Sonner Toaster from its own subpath. The shadcn CLI hides Sonner in Base UI projects and points to Toast, so this ticket starts with the maintainer's ship-or-drop decision. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 18 — Message Scroller and Questionnaire join the package

**Status:** needs-human (open decision (a): ship or drop Sonner); the code change can be done by an agent

- [ ] The maintainer decides whether to ship Sonner (spec, open decision (a)). If they drop it, this ticket closes, the spec is updated, and nothing below applies.
- [ ] The shadcn CLI `add` command pulls sonner from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift.
- [ ] Dependencies: `sonner` and `next-themes` are added as optional peer dependencies, each with the range that the spec's ranges rule gives. They are peers because the app calls sonner's `toast()` and mounts the theme provider itself, so both sides must share one copy of each. Both are also dev dependencies for local builds.
- [ ] Every built file for sonner starts with `"use client"`, as upstream's source does. The root entry does not.
- [ ] New public subpath: `/sonner`. The root entry does not re-export it.
- [ ] Sonner is subpath-only. The root entry keeps Toast's `Toaster`, because the names collide.
- [ ] Sonner gets its own build entry, as the spec requires for subpath-only modules. The built Sonner file appears in the dry-run pack and keeps the sonner and next-themes imports external.
- [ ] A scratch app without sonner or next-themes still builds from the root entry.
- [ ] In a scratch app with next-themes, a toast fired with the app's own `sonner` import appears in the package's Toaster, and follows the theme in light and dark. The `cn-toast` class is kept as an unstyled upstream hook.
- [ ] Spec 1b's per-ticket release checklist passes (Testing Decisions).
