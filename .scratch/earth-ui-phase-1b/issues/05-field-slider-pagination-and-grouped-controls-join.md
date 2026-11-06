# 05 — Field, Slider, Pagination and five more grouped controls join the package

**What to build:** An app developer can build grouped controls and complete form fields: Slider, Native Select, Breadcrumb, Button Group, Item, Field, Pagination and Toggle Group. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 04 — Icons, animations and shadcn variants arrive

**Status:** code done (35d5c4d); batch B scratch-app check passed on 2026-11-06 (Next.js PostCSS plugin, pnpm, light and dark). Open: vertical Toggle Group keyboard navigation (upstream)

- [x] The shadcn CLI `add` command pulls slider, native-select, breadcrumb, button-group, item, field, pagination, toggle-group from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [x] No new dependencies.
- [x] Built files start with `"use client"` only where upstream's source does: field, toggle-group have it; slider, native-select, breadcrumb, button-group, item, pagination do not. The root entry does not.
- [x] New public subpaths: `/slider`, `/native-select`, `/breadcrumb`, `/button-group`, `/item`, `/field`, `/pagination`, `/toggle-group`. The root entry re-exports the new components and their prop types.
- [ ] Slider and Toggle Group work in both orientations, and Button Group and Field render their horizontal and vertical layouts.
- [x] Field composes Label and Separator from the package, and a checked control inside it gets the checked style.
- [x] Pagination's links use the button styles. The open `buttonVariants` border decision is noted, not fixed.
- [ ] Spec 1b's per-ticket release checklist passes (Testing Decisions).

Open (2026-11-06): Slider, Button Group and Field pass in both orientations. Toggle Group's vertical layout and pressed style are right, but upstream's wrapper never passes `orientation` to Base UI, so arrow keys stay horizontal and the ARIA orientation is wrong. The package file has no drift from upstream; fixing it is an upstream-quirk decision.
