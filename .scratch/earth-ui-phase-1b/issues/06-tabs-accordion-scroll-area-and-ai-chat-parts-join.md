# 06 — Tabs, Accordion, Scroll Area, Attachment, Trace and Code Block join the package

**What to build:** An app developer can use Tabs, Scroll Area and Accordion, plus the AI chat parts Attachment, Trace and Code Block, the first components that use shadcn's shimmer and scroll-fade utilities. Code Block ships as a component only; the code-highlighting hook is open decision (c) and ticket 20. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 05 — Field, Slider, Pagination and five more grouped controls join the package

**Status:** code done (commits fe4aa27, cc72e45); scratch-app browser check pending (batch B); unchecked items need it. Code Block landed after ticket 12, with its own changeset.

- [x] The shadcn CLI `add` command pulls tabs, scroll-area, accordion, attachment, trace, code-block from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [x] No new dependencies.
- [x] Built files start with `"use client"` only where upstream's source does: tabs, scroll-area, code-block have it; accordion, attachment, trace do not. The root entry does not.
- [x] New public subpaths: `/tabs`, `/scroll-area`, `/accordion`, `/attachment`, `/trace`, `/code-block`. The root entry re-exports the new components and their prop types.
- [ ] Accordion panels animate their height open and closed, using shadcn's accordion keyframes and not the tw-animate-css ones.
- [ ] Tabs show the active tab style in both orientations. Scroll Area shows horizontal and vertical scrollbars.
- [ ] Attachment's scroll fade and shimmer render. Trace's shimmer stops when reduced motion is on, and Trace expands through the package's Collapsible.
- [x] `shadcn add code-block` also writes the `use-highlighted-code` hook and its highlighter lib and adds `shiki`, although Code Block never imports them. They are removed and not shipped, and `add --diff` is judged on Code Block's own file.
- [ ] Code Block's copy button and its horizontal and vertical scroll fades work, with no shiki installed.
- [ ] Spec 1b's per-ticket release checklist passes (Testing Decisions).
