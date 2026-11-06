# 17 — Resizable panels resize by drag and keyboard

**What to build:** An app developer can build resizable panel layouts with Resizable. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 16 — Input OTP collects one-time codes

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls resizable from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift.
- [ ] Dependencies: `react-resizable-panels` is added as a regular dependency, with the range that the spec's ranges rule gives.
- [ ] Every built file for resizable starts with `"use client"`, as upstream's source does. The root entry does not.
- [ ] New public subpath: `/resizable`. The root entry re-exports the new components and their prop types.
- [ ] Dragging the handle resizes the panels horizontally and vertically, and the handle is keyboard-operable.
- [ ] Spec 1b's per-ticket release checklist passes (Testing Decisions).
