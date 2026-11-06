# 11 — Toast notifications and the Sidebar layout join the package

**What to build:** An app developer can show notifications with the Base UI Toast and lay out an app with Sidebar. This completes batch B. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 10 — Select, Combobox and Navigation Menu join the package

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls toast, sidebar from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [ ] No new dependencies.
- [ ] Every built file for toast, sidebar starts with `"use client"`, as upstream's source does. The root entry does not.
- [ ] New public subpaths: `/toast`, `/sidebar`. The root entry re-exports the new components and their prop types.
- [ ] The root entry's `Toaster` comes from Toast.
- [ ] Sidebar's mobile-breakpoint hook is shipped but internal. It is not re-exported from the root, and no subpath reaches it.
- [ ] Sidebar collapses and expands, shows tooltips when collapsed, and becomes a Sheet below the mobile breakpoint.
- [ ] A toast can be triggered, stacks, and can be dismissed.
- [ ] Spec 1b's per-ticket release checklist passes (Testing Decisions).
