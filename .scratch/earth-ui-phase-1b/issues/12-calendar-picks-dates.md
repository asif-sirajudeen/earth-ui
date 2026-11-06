# 12 — Calendar picks dates with react-day-picker

**What to build:** An app developer can pick dates with Calendar, built on react-day-picker. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 11 — Toast notifications and the Sidebar layout join the package

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls calendar from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift.
- [ ] Dependencies: `react-day-picker` is added as a regular dependency, with the range that the spec's ranges rule gives, replacing the registry's `@latest`. `date-fns` is not added, because nothing imports it; if the CLI adds it, it is removed.
- [ ] Every built file for calendar starts with `"use client"`, as upstream's source does. The root entry does not.
- [ ] New public subpath: `/calendar`. The root entry re-exports the new components and their prop types.
- [ ] Calendar moves between months, selects single dates and ranges, and shows today's date and the selected dates in both themes.
- [ ] Spec 1b's per-ticket release checklist passes (Testing Decisions).
