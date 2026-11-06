# 04 — Release pipeline opens a Version PR

**What to build:** The maintainer adds a changeset and pushes to main, and GitHub Actions opens a "Version Packages" pull request with the bumped version and changelog. Nothing publishes yet, because the package does not exist on npm until ticket 06. Source: Spec 1, `docs/specs/phase-1-package.md`.

**Blocked by:** 01 — Repo setup; 02 — Button reaches a Next.js app from a packed tarball

**Status:** done (3834ca9, b0b837e, b42b4c3)

- [x] Changesets v3 is configured with access set to `public`.
- [x] The release workflow uses the separate `changesets/action` v2 sub-actions:
  - jobs: `select-mode`, `version`, `pack`, `publish`;
  - empty top-level permissions;
  - `contents: write` and `pull-requests: write` on the version job;
  - `id-token: write` only on the publish job.
- [x] The workflow runs on GitHub-hosted runners with Node 24.5.0 or later. Checkout sets `persist-credentials: false`, and setup-node disables the package-manager cache.
- [x] No npm token secret exists in the repository.
- [x] The repository setting "Allow GitHub Actions to create and approve pull requests" is on.
- [x] The README covers install, the stylesheet import order (Tailwind first), usage of Button, Input and Label, and next-themes setup (`attribute="class"`, `suppressHydrationWarning`).
- [x] The MIT licence file names the maintainer and keeps shadcn's full copyright and permission notice.
- [x] Pushing a commit with a changeset to main opens a "Version Packages" pull request in the private repository.
- [x] A dry-run pack includes the README and licence, and still no source or config files.

Notes (2026-11-06): the first run failed in `changesets version` (`could not read Username for 'https://github.com'`), because a shallow checkout without stored credentials cannot deepen. b42b4c3 sets `fetch-depth: 0` on the version job, and the next run opened Version PR #1. PR #1 was later closed, because 0.2.0 was versioned locally (325242e).
