# 15 — Command menu filters items with cmdk

**What to build:** An app developer can build a command menu with Command on cmdk, including the dialog form. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 14 — Chart draws recharts charts in theme colours

**Status:** done (ba39756); batch C scratch-app check passed on 2026-11-06 (light and dark); shipped in 0.2.0

- [x] The shadcn CLI `add` command pulls command from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift.
- [x] Dependencies: `cmdk` is added as a regular dependency, with the range that the spec's ranges rule gives. The ticket notes that cmdk brings Radix dialog primitives in as transitive dependencies.
- [x] Every built file for command starts with `"use client"`, as upstream's source does. The root entry does not.
- [x] New public subpath: `/command`. The root entry re-exports the new components and their prop types.
- [x] Typing filters the items. Arrow keys move the selected item and show the selected style. The dialog form opens through the package's Dialog.
- [x] Spec 1b's per-ticket release checklist passes (Testing Decisions).
