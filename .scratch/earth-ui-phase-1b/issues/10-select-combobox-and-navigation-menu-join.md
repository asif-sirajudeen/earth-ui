# 10 — Select, Combobox and Navigation Menu join the package

**What to build:** An app developer can use Select, Combobox and Navigation Menu from the package. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 09 — Dropdown Menu, Context Menu and Menubar join the package

**Status:** code done (commits b2da2c5); scratch-app browser check pending (batch B); unchecked items need it.

- [x] The shadcn CLI `add` command pulls select, combobox, navigation-menu from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [x] No new dependencies.
- [x] Built files start with `"use client"` only where upstream's source does: select, combobox have it; navigation-menu does not. The root entry does not.
- [x] New public subpaths: `/select`, `/combobox`, `/navigation-menu`. The root entry re-exports the new components and their prop types.
- [ ] Select and Combobox open, filter where relevant, select with the keyboard, and show the selected item. Combobox's input uses the package's Input Group.
- [ ] Navigation Menu opens its content panels with an animation and marks the active link.
- [ ] Spec 1b's per-ticket release checklist passes (Testing Decisions).
