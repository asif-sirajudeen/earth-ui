# 02 — Button reaches a Next.js app from a packed tarball

**What to build:** The tracer bullet. An app developer installs the packed package into a separate Next.js App Router app and imports the stylesheet. A server component then renders a fully styled Button in light and dark mode. Source: Spec 1, `docs/specs/phase-1-package.md`.

**Blocked by:** 01 — Repo setup

**Status:** done (d21d32c); every variant and size re-checked in a scratch app on 2026-11-06

- [x] Button is pulled from shadcn's `base-nova` style with the shadcn CLI `add` command, not copied by hand. Its dependencies are declared explicitly: `@base-ui/react ^1.9.0`, `class-variance-authority ^0.7.1`, `cn ~0.5.2`.
- [x] The root entry exports `Button`, `buttonVariants` and the prop types.
- [x] The export map is hand-written:
  - explicit stylesheet and `package.json` entries come before the `./*` component wildcard;
  - the `types` condition is listed first;
  - every path matches the emitted `.js` / `.d.ts` files.
- [x] The stylesheet is a plain file, not built by tsdown, and does not import Tailwind itself. It contains:
  - the shadcn default `base-nova` tokens on `:root` and `.dark`;
  - the `@theme inline` mapping, including the radius scale;
  - the dark custom variant;
  - the base-layer border, outline and `body` background and foreground rules;
  - an `@source` with an exact glob for the built JS files.
- [x] The built Button file and root entry have no `"use client"` directive. Base UI provides the client boundary.
- [x] A packed tarball installs into a scratch Next.js App Router app outside the repo, with Tailwind v4 imported before the package stylesheet.
- [x] In that app, a production build succeeds. A server component renders every Button variant and size, and calls `buttonVariants()` to style a link.
- [x] Every Button variant is visibly styled in light mode and under the `.dark` class, with readable text in both.
- [x] Unused-component tree-shaking is not broken: the stylesheet import is kept, and the package declares no other side effects.

Checked 2026-11-06 against the 0.1.0 tarball from 2886803: a server component renders all 6 variants × 8 sizes (49 Buttons) in a production build, styled and readable in light and dark. The outline link's missing light-mode border is the known upstream `buttonVariants` quirk (Spec 1b, open decision).
