# 12 — Calendar picks dates with react-day-picker

**What to build:** An app developer can pick dates with Calendar, built on react-day-picker. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 11 — Toast notifications and the Sidebar layout join the package

**Status:** done (91b82c5); batch C scratch-app check passed on 2026-11-06 (light and dark); shipped in 0.2.0

- [x] The shadcn CLI `add` command pulls calendar from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift.
- [x] Dependencies: `react-day-picker` is added as a regular dependency, with the range that the spec's ranges rule gives, replacing the registry's `@latest`. `date-fns` is not added, because nothing imports it; if the CLI adds it, it is removed.
- [x] Every built file for calendar starts with `"use client"`, as upstream's source does. The root entry does not.
- [x] New public subpath: `/calendar`. The root entry re-exports the new components and their prop types.
- [x] Calendar moves between months, selects single dates and ranges, and shows today's date and the selected dates in both themes.
- [x] Spec 1b's per-ticket release checklist passes (Testing Decisions).

Notes (2026-11-06):
- Upstream defect, not a ticket criterion: keyboard focus does not follow the arrow keys. `CalendarDayButton` calls `ref.current?.focus()` but never passes `ref` to `<Button>`. Upstream base-nova has the same omission; new-york-v4 and radix-nova pass it. The inline `components={{ … }}` functions also remount the day buttons on re-render.
- For the README: under Next 16 with `cacheComponents`, prerendering fails on react-day-picker's default `new Date()`. Pass `today` or wrap the Calendar in Suspense. The `DateRange` type comes from `react-day-picker`, which the app installs itself under pnpm.
