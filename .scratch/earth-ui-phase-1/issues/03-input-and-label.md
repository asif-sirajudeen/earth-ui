# 03 — Input and Label join the package

**What to build:** An app developer can build an accessible form field from the package. Input and Label are importable from the root and from their own subpaths. They are styled and readable in light and dark mode. Source: Spec 1, `docs/specs/phase-1-package.md`.

**Blocked by:** 02 — Button reaches a Next.js app from a packed tarball

**Status:** done (0f42ba2); scratch-app checks re-run in the phase 1b batch A check on 2026-11-06

- [x] Input and Label are pulled from shadcn's `base-nova` style with the shadcn CLI `add` command. No new dependencies are added beyond those declared in ticket 02.
- [x] The root entry exports Input, Label and their prop types. Each is also importable from its own subpath.
- [x] The built Label file starts with `"use client"`, as in shadcn's source. The built Input file and root entry do not.
- [x] In the scratch Next.js app, a server component renders a labelled Input. Clicking the label focuses the input.
- [x] In dark mode, Label text and typed Input text use the theme foreground colour, not browser-default black.
- [x] A dry-run pack still lists only allowed files.
