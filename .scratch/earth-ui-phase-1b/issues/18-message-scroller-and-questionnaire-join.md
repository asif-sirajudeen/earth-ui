# 18 — Message Scroller and Questionnaire join the package

**What to build:** An app developer can build chat views with Message Scroller and Questionnaire, which build on shadcn's own React package. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 17 — Resizable panels resize by drag and keyboard

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls message-scroller, questionnaire from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [ ] Dependencies: `@shadcn/react` is added as a regular dependency, with the range that the spec's ranges rule gives.
- [ ] Every built file for message-scroller, questionnaire starts with `"use client"`, as upstream's source does. The root entry does not.
- [ ] New public subpaths: `/message-scroller`, `/questionnaire`. The root entry re-exports the new components and their prop types.
- [ ] Message Scroller sticks to the bottom as messages arrive and shows its bottom scroll fade. Questionnaire options show checked and disabled states.
- [ ] Spec 1b's per-ticket release checklist passes (Testing Decisions).
