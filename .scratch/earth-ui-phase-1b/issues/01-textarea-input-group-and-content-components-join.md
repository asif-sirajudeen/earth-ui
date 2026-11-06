# 01 — Textarea, Input Group and six content components join the package

**What to build:** An app developer can build simple content and form layouts from the package: Textarea, Input Group, Alert, Badge, Card, Kbd, Skeleton and Empty. These need nothing new, so this ticket proves that the phase 1 pipeline scales to a batch of eight. Phase 1b starts only after phase 1's exit checks pass, so this ticket waits for phase 1's last ticket, in `.scratch/earth-ui-phase-1/issues/`. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** phase 1 — 07 — CI publishes 0.1.1 through trusted publishing

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls textarea, input-group, alert, badge, card, kbd, skeleton, empty from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [ ] No new dependencies.
- [ ] Built files start with `"use client"` only where upstream's source does: input-group has it; textarea, alert, badge, card, kbd, skeleton, empty do not. The root entry does not.
- [ ] New public subpaths: `/textarea`, `/input-group`, `/alert`, `/badge`, `/card`, `/kbd`, `/skeleton`, `/empty`. The root entry re-exports the new components and their prop types.
- [ ] Input Group's addons render around Input and Textarea, and its button addon uses the shipped Button.
- [ ] Spec 1b's per-ticket release checklist passes (Testing Decisions).
