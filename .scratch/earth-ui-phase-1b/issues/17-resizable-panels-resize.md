# 17 — Resizable panels resize by drag and keyboard

**What to build:** An app developer can build resizable panel layouts with Resizable. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 16 — Input OTP collects one-time codes

**Status:** done (873f1e6); batch C scratch-app check passed on 2026-11-06 (light and dark); shipped in 0.2.0

- [x] The shadcn CLI `add` command pulls resizable from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift.
- [x] Dependencies: `react-resizable-panels` is added as a regular dependency, with the range that the spec's ranges rule gives.
- [x] Every built file for resizable starts with `"use client"`, as upstream's source does. The root entry does not.
- [x] New public subpath: `/resizable`. The root entry re-exports the new components and their prop types.
- [x] Dragging the handle resizes the panels horizontally and vertically, and the handle is keyboard-operable.
- [x] Spec 1b's per-ticket release checklist passes (Testing Decisions).

Note (2026-11-06): react-resizable-panels v4 sets an inline `height:100%` on the group, so size the parent rather than the `ResizablePanelGroup`.
