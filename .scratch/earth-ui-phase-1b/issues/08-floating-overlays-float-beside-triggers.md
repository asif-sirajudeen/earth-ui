# 08 — Popover, Tooltip and Hover Card float beside their triggers

**What to build:** An app developer can show floating content from the package: Popover, Tooltip and Hover Card. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 07 — Dialog, Alert Dialog and Sheet open as animated modals

**Status:** code done (commits ab595c4); scratch-app browser check pending (batch B); unchecked items need it.

- [x] The shadcn CLI `add` command pulls popover, tooltip, hover-card from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [x] No new dependencies.
- [x] Every built file for popover, tooltip, hover-card starts with `"use client"`, as upstream's source does. The root entry does not.
- [x] New public subpaths: `/popover`, `/tooltip`, `/hover-card`. The root entry re-exports the new components and their prop types.
- [ ] The scratch app wraps its layout in the Tooltip provider, as upstream requires, and the ticket records this for the future README.
- [ ] Each overlay animates in and out from the side it is placed on, and stays readable in dark mode.
- [ ] Spec 1b's per-ticket release checklist passes (Testing Decisions).
