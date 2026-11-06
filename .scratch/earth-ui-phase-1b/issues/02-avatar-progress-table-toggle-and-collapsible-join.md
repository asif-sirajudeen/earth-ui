# 02 — Avatar, Aspect Ratio, Progress, Table, Toggle and Collapsible join the package

**What to build:** An app developer can show avatars, fixed-ratio media, progress, tables, toggle buttons and collapsible sections from the package. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 01 — Textarea, Input Group and six content components join the package

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls avatar, aspect-ratio, progress, table, toggle, collapsible from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [ ] No new dependencies.
- [ ] Built files start with `"use client"` only where upstream's source does: avatar, progress, table, toggle, collapsible have it; aspect-ratio does not. The root entry does not.
- [ ] New public subpaths: `/avatar`, `/aspect-ratio`, `/progress`, `/table`, `/toggle`, `/collapsible`. The root entry re-exports the new components and their prop types.
- [ ] Toggle switches its pressed style when clicked, and Collapsible opens and closes its panel.
- [ ] Avatar shows its fallback when the image fails to load.
- [ ] Spec 1b's per-ticket release checklist passes (Testing Decisions).
