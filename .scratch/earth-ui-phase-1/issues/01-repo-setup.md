# 01 — Repo setup

**What to build:** An empty, buildable package shell that every later ticket builds on. A maintainer can clone the repo, install, build and pack. The tarball contains only the files the package is allowed to ship. Source: Spec 1, `docs/specs/phase-1-package.md`.

**Blocked by:** None — can start immediately.

**Status:** done (4b2f833); pushed to the private GitHub repository on 2026-11-06

- [x] The package manifest names the package `@<npm-username>/earth-ui`, with the maintainer's real npm username. Confirm the name with the maintainer, because it can differ from the GitHub username.
- [x] The manifest is an ES module package. It declares supported engines, pins the package manager to the latest pnpm (10 or later), and sets version 0.1.0.
- [x] The manifest lists `files` (the build output and the stylesheet only), and declares CSS as the only side effect.
- [x] The manifest's `repository.url` matches the GitHub repository URL exactly, including case.
- [x] Peer dependencies are `react ^19`, `react-dom ^19` and `tailwindcss ^4`. No runtime library is a devDependency.
- [x] The build uses tsdown in `unbundle` mode with fixed extensions turned off, so it emits `.js` and `.d.ts` ESM files.
- [x] A hand-written shadcn `components.json` uses style `base-nova`, sets `rsc: true`, and points its aliases at the package's component folder. `shadcn init` is not run.
- [x] The root entry exists and exports nothing yet.
- [x] `.gitignore` excludes build output and dependencies.
- [x] A **private** GitHub repository exists under the maintainer's personal account, and the code is pushed. The repository stays private until ticket 05.
- [x] A clean install and build passes from a fresh clone.
- [x] A dry-run pack lists only the build output, the package manifest, and README or licence if present. No source or config files.

Notes (2026-11-06): the npm scope `@asif-sirajudeen` is confirmed by the 0.2.0 publish. `repository.url` matches https://github.com/asif-sirajudeen/earth-ui.
