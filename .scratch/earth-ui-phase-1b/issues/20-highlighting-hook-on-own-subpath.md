# 20 — Code highlighting hook is available from its own subpath

**What to build:** An app developer who wants syntax highlighting in Code Block can install shiki and use the shadcn code-highlighting hook from its own subpath. Apps that do not want highlighting never install or resolve shiki. Code Block itself shipped in ticket 06 and never imports the hook. This ticket starts with the maintainer's ship-or-drop decision. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 19 — Sonner Toaster is available from its own subpath

**Status:** done (commits d64e260); batch C scratch-app check passed on 2026-11-06; shipped in 0.2.0. Maintainer decided on 2026-11-06 to ship the hook.

- [x] The maintainer decides whether to ship the hook (spec, open decision (c)). If they drop it, this ticket closes, the spec is updated, and nothing below applies.
- [x] The shadcn CLI `add` command pulls use-highlighted-code from shadcn's `base-nova` style, which also writes its highlighter lib; nothing is copied by hand. Afterwards, `add --diff` shows no drift.
- [x] Dependencies: `shiki` is added as an optional peer dependency, with the range that the spec's ranges rule gives. It is also a dev dependency for local builds, and is kept out of regular dependencies.
- [x] Neither the hook nor the highlighter lib has `"use client"`, as in upstream's source. The hook is called only from client components. The root entry does not have the directive.
- [x] New public subpath: `/use-highlighted-code`, an explicit export listed before the component wildcard. The root entry does not re-export it, and the highlighter lib is reachable only through it.
- [x] The hook gets its own build entry, as the spec requires for subpath-only modules. The built hook file appears in the dry-run pack.
- [x] The built hook and highlighter keep their shiki imports external. tsdown does not bundle shiki into them.
- [x] A scratch app without shiki still builds from the root entry. A scratch app with shiki renders highlighted code through the hook, in both themes.
- [x] Spec 1b's per-ticket release checklist passes (Testing Decisions).
