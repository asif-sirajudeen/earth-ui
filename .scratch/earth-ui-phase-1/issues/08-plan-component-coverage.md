# 08 — Plan component coverage (Spec 1b)

**What to build:** A written plan for shipping the rest of shadcn's `base-nova` components through the proven pipeline, in release batches. Each batch is its own ticket, sized for one context window. This ticket plans; it does not add components.

**Blocked by:** 07 — CI publishes 0.1.1 through trusted publishing

**Status:** done (32c735c, 2886803); the tickets were rewritten later in d8c0c4c. Phase 1b was implemented ahead of this ticket's blocker (07)

- [x] Every item in shadcn's `base-nova` registry is inventoried from the registry JSON and source. For each item, record:
  - what it actually imports (the registry under-declares dependencies);
  - whether it needs `data-open`-style variants, animations (`tw-animate-css`, `shadcn/tailwind.css`) or icons (`lucide-react`);
  - its `"use client"` status;
  - its peer-dependency ranges.
- [x] Items are grouped into release batches:
  - A: no new dependencies or CSS;
  - B: needs variants, animations or icons;
  - C: needs third-party libraries such as date pickers, charts, carousels, command menus, toasts or drawers.
- [x] Every `base-nova` item is in exactly one batch, or is listed as excluded with a reason.
- [x] For each batch, the plan states the changes to dependencies, the stylesheet and the pre-release check. It also notes the public-API cost, because every component file becomes a public subpath.
- [x] Spec 1b is written with the same template as Spec 1.
- [x] One ticket per batch is written in this folder's format, with blocking edges (A before B before C unless the inventory shows otherwise).
- [x] The plan doc gains a "Phase 1b: component coverage" entry that links Spec 1b.
