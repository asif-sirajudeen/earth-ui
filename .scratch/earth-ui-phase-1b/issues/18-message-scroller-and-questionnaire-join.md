# 18 — Message Scroller and Questionnaire join the package

**What to build:** An app developer can build chat views with Message Scroller and Questionnaire, which build on shadcn's own React package. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 17 — Resizable panels resize by drag and keyboard

**Status:** done (7384962); batch C scratch-app check passed on 2026-11-06 (light and dark); shipped in 0.2.0

- [x] The shadcn CLI `add` command pulls message-scroller, questionnaire from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [x] Dependencies: `@shadcn/react` is added as a regular dependency, with the range that the spec's ranges rule gives.
- [x] Every built file for message-scroller, questionnaire starts with `"use client"`, as upstream's source does. The root entry does not.
- [x] New public subpaths: `/message-scroller`, `/questionnaire`. The root entry re-exports the new components and their prop types.
- [x] Message Scroller sticks to the bottom as messages arrive and shows its bottom scroll fade. Questionnaire options show checked and disabled states.
- [x] Spec 1b's per-ticket release checklist passes (Testing Decisions).

Note (2026-11-06): `MessageScrollerProvider` from @shadcn/react defaults `autoScroll` to `false`, so sticking to the bottom is opt-in.
