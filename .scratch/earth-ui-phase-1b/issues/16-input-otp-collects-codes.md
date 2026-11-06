# 16 — Input OTP collects one-time codes

**What to build:** An app developer can collect one-time codes with Input OTP. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 15 — Command menu filters items with cmdk

**Status:** done (90a1ef9); batch C scratch-app check passed on 2026-11-06 (light and dark); shipped in 0.2.0

- [x] The shadcn CLI `add` command pulls input-otp from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift.
- [x] Dependencies: `input-otp` is added as a regular dependency, with the range that the spec's ranges rule gives.
- [x] Every built file for input-otp starts with `"use client"`, as upstream's source does. The root entry does not.
- [x] New public subpath: `/input-otp`. The root entry re-exports the new components and their prop types.
- [x] Typing fills the slots and moves the caret. The fake caret blinks through tw-animate-css. Pasting a code fills every slot. The `cn-input-otp` class is kept as an unstyled upstream hook.
- [x] Spec 1b's per-ticket release checklist passes (Testing Decisions).
