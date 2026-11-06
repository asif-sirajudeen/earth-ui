# 03 — Drawer, right-to-left direction and chat message parts join the package

**What to build:** An app developer can use the Base UI Drawer, set text direction for the whole package with the Direction provider, and lay out chat messages with Bubble, Marker and Message. This completes batch A. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 02 — Avatar, Aspect Ratio, Progress, Table, Toggle and Collapsible join the package

**Status:** done (commits 39a5f21); scratch-app browser check passed on 2026-11-06 (batch A). Open: the right-to-left Drawer check was not run.

- [x] The shadcn CLI `add` command pulls drawer, direction, bubble, marker, message from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [x] No new dependencies.
- [x] Built files start with `"use client"` only where upstream's source does: drawer, direction have it; bubble, marker, message do not. The root entry does not.
- [x] New public subpaths: `/drawer`, `/direction`, `/bubble`, `/marker`, `/message`. The root entry re-exports the new components and their prop types.
- [x] Drawer opens, can be swiped or dismissed, and closes, using only Tailwind's built-in data-attribute variants.
- [x] The Direction subpath re-exports exactly Base UI's direction provider and hook, and nothing else. The ticket notes that this subpath now follows Base UI's API.
- [ ] Wrapping the page in the Direction provider set to right-to-left flips Drawer's side.
- [x] Spec 1b's per-ticket release checklist passes (Testing Decisions).
