# 07 — Dialog, Alert Dialog and Sheet open as animated modals

**What to build:** An app developer can open modal overlays from the package: Dialog, Alert Dialog and Sheet. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 06 — Tabs, Accordion, Scroll Area, Attachment, Trace and Code Block join the package

**Status:** code done (commits 660cf03); scratch-app browser check pending (batch B); unchecked items need it.

- [x] The shadcn CLI `add` command pulls dialog, alert-dialog, sheet from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [x] No new dependencies.
- [x] Every built file for dialog, alert-dialog, sheet starts with `"use client"`, as upstream's source does. The root entry does not.
- [x] New public subpaths: `/dialog`, `/alert-dialog`, `/sheet`. The root entry re-exports the new components and their prop types.
- [ ] Each overlay animates in and out, traps focus while open, closes with Escape, and returns focus to its trigger.
- [ ] Sheet opens from each side.
- [ ] The close icons render, and the overlay backdrop is visible in both themes.
- [ ] Spec 1b's per-ticket release checklist passes (Testing Decisions).
