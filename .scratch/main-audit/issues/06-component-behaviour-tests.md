# 06 — Add component behaviour tests (tracer bullet)

**What to build:** A component test harness that renders earth-ui components in a DOM and checks real behaviour and accessibility, proven on a first small set of components. Today the 64 components have no tests at all. The only checks are typecheck and lint (including `jsx-a11y`).

**Blocked by:** None — can start immediately.

**Status:** won't do — dropped by owner (2026-11-11)

- [ ] A test runner with a DOM environment runs component tests in CI as part of `pnpm test` or as its own named job.
- [ ] Tracer-bullet coverage: Button (variants render, `render` prop), Dialog (opens and closes, focus moves into the dialog and back), and Checkbox (toggles, label association).
- [ ] Each tested component also passes an automated accessibility check (for example axe).
- [ ] The harness pattern is documented so later tickets can add the remaining components one family at a time.
- [ ] Breaking one of the tested behaviours makes CI fail.

## Resolution

Dropped by the owner: component tests are not needed. The Vitest, jsdom, Testing Library and axe-core setup was implemented, then removed. No component test files, dependencies, config or README section remain, and the lockfile is unchanged from main.
