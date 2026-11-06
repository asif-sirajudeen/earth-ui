# 04 — Release pipeline opens a Version PR

**What to build:** The maintainer adds a changeset and pushes to main, and GitHub Actions opens a "Version Packages" pull request with the bumped version and changelog. Nothing publishes yet, because the package does not exist on npm until ticket 06. Source: Spec 1, `docs/specs/phase-1-package.md`.

**Blocked by:** 01 — Repo setup; 02 — Button reaches a Next.js app from a packed tarball

**Status:** ready-for-agent

- [ ] Changesets v3 is configured with access set to `public`.
- [ ] The release workflow uses the separate `changesets/action` v2 sub-actions:
  - jobs: `select-mode`, `version`, `pack`, `publish`;
  - empty top-level permissions;
  - `contents: write` and `pull-requests: write` on the version job;
  - `id-token: write` only on the publish job.
- [ ] The workflow runs on GitHub-hosted runners with Node 24.5.0 or later. Checkout sets `persist-credentials: false`, and setup-node disables the package-manager cache.
- [ ] No npm token secret exists in the repository.
- [ ] The repository setting "Allow GitHub Actions to create and approve pull requests" is on.
- [ ] The README covers install, the stylesheet import order (Tailwind first), usage of Button, Input and Label, and next-themes setup (`attribute="class"`, `suppressHydrationWarning`).
- [ ] The MIT licence file names the maintainer and keeps shadcn's full copyright and permission notice.
- [ ] Pushing a commit with a changeset to main opens a "Version Packages" pull request in the private repository.
- [ ] A dry-run pack includes the README and licence, and still no source or config files.
