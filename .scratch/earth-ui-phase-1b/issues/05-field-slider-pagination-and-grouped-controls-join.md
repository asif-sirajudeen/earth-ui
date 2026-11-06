# 05 — Field, Slider, Pagination and five more grouped controls join the package

**What to build:** An app developer can build grouped controls and complete form fields: Slider, Native Select, Breadcrumb, Button Group, Item, Field, Pagination and Toggle Group. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 04 — Icons, animations and shadcn variants arrive

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls slider, native-select, breadcrumb, button-group, item, field, pagination, toggle-group from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [ ] No new dependencies.
- [ ] Built files start with `"use client"` only where upstream's source does: field, toggle-group have it; slider, native-select, breadcrumb, button-group, item, pagination do not. The root entry does not.
- [ ] New public subpaths: `/slider`, `/native-select`, `/breadcrumb`, `/button-group`, `/item`, `/field`, `/pagination`, `/toggle-group`. The root entry re-exports the new components and their prop types.
- [ ] Slider and Toggle Group work in both orientations, and Button Group and Field render their horizontal and vertical layouts.
- [ ] Field composes Label and Separator from the package, and a checked control inside it gets the checked style.
- [ ] Pagination's links use the button styles. The open `buttonVariants` border decision is noted, not fixed.
- [ ] Spec 1b's per-ticket release checklist passes (Testing Decisions).
