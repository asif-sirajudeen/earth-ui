# 06 — Go public and publish 0.1.0 by hand

**What to build:** The package exists on public npm at 0.1.0, published from the maintainer's machine with 2FA. The GitHub repository is public. A fresh app installs 0.1.0 and renders all three components. This creates the package that trusted publishing requires. Source: Spec 1, `docs/specs/phase-1-package.md`.

**Blocked by:** 03 — Input and Label join the package; 04 — Release pipeline opens a Version PR; 05 — AnywhereWorks sign-off

**Status:** needs-human — not started; `@asif-sirajudeen/earth-ui` returns 404 on the npm registry as of 2026-11-06

- [ ] The GitHub repository is switched from private to public.
- [ ] The pre-release check passes against a packed tarball in a scratch Next.js app:
  - the production build succeeds;
  - a server component renders Button, Input and Label, and calls `buttonVariants()`;
  - light and dark mode are readable;
  - only Label carries `"use client"`;
  - the tarball contains only allowed files.
- [ ] The maintainer publishes 0.1.0 with public access, entering the 2FA one-time password when prompted.
- [ ] The npm package page shows 0.1.0 as public.
- [ ] Exit check 1: a fresh Next.js app outside the repo installs 0.1.0 from npm, imports the stylesheet, and renders all three components, styled, in light and dark mode.
