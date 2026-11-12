# 03 — Run CI on pushes to main

**What to build:** The full CI suite also runs on every push to `main`, so `main` always shows a green or red status for its own head commit. Today CI runs only on `pull_request`, so nothing re-verifies `main` after a merge, after a merge queue result, or after an admin bypass.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] The CI workflow triggers on `push` to `main` as well as on `pull_request`.
- [ ] The latest `main` commit shows the CI result in the GitHub UI and in `gh run list --branch main`.
- [x] The workflow stays read-only (no new permissions are added).

## Resolution

`ci.yml` now also triggers on `push` to `main`; permissions unchanged (`contents: read`). The changeset job is PR-only.
Not verifiable locally: the GitHub UI / `gh run list --branch main` result appears after merge.
