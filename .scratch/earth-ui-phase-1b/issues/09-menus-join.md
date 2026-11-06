# 09 — Dropdown Menu, Context Menu and Menubar join the package

**What to build:** An app developer can build menus from the package: Dropdown Menu, Context Menu and Menubar. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 08 — Popover, Tooltip and Hover Card float beside their triggers

**Status:** code done (commits 8bf1ac6); scratch-app browser check pending (batch B); unchecked items need it.

- [x] The shadcn CLI `add` command pulls dropdown-menu, context-menu, menubar from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [x] No new dependencies.
- [x] Every built file for dropdown-menu, context-menu, menubar starts with `"use client"`, as upstream's source does. The root entry does not.
- [x] New public subpaths: `/dropdown-menu`, `/context-menu`, `/menubar`. The root entry re-exports the new components and their prop types.
- [ ] Menus open with click, right-click or keyboard as appropriate. Arrow keys move through items, disabled items are skipped and dimmed, and submenus open.
- [ ] Checkbox and radio items show their indicator icons.
- [ ] Spec 1b's per-ticket release checklist passes (Testing Decisions).
