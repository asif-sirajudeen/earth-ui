# 06 — Go public and publish 0.1.0 by hand

**What to build:** The package exists on public npm at 0.1.0, published from the maintainer's machine with 2FA. The GitHub repository is public. A fresh app installs 0.1.0 and renders all three components. This creates the package that trusted publishing requires. Source: Spec 1, `docs/specs/phase-1-package.md`.

**Blocked by:** 03 — Input and Label join the package; 04 — Release pipeline opens a Version PR; 05 — AnywhereWorks sign-off

**Status:** partly done — the maintainer published 0.2.0 (all phase 1b components) instead of 0.1.0; the repository is public; exit check 1 has not run

- [x] The GitHub repository is switched from private to public.
- [x] The pre-release check passes against a packed tarball in a scratch Next.js app:
  - the production build succeeds;
  - a server component renders Button, Input and Label, and calls `buttonVariants()`;
  - light and dark mode are readable;
  - only Label carries `"use client"`;
  - the tarball contains only allowed files.
- [ ] The maintainer publishes 0.1.0 with public access, entering the 2FA one-time password when prompted.
- [ ] The npm package page shows 0.1.0 as public.
- [ ] Exit check 1: a fresh Next.js app outside the repo installs 0.1.0 from npm, imports the stylesheet, and renders all three components, styled, in light and dark mode.

Notes (2026-11-06):
- The pre-release check passed against the 0.1.0 tarball from 2886803: a production build, a server component with Button, Input, Label and `buttonVariants()`, light and dark readable, only Label with `"use client"`, and only allowed files.
- The maintainer then chose to publish the whole repository. 325242e consumed the 21 phase 1b changesets into 0.2.0, which was published by hand as a staged publish and then approved. npm shows 0.2.0 as `latest`, public, with no provenance. 0.1.0 was never published.
- The repository was made public on 2026-11-06.
- Still open: run exit check 1 against 0.2.0.
