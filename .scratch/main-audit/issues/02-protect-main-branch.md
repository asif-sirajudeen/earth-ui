# 02 — Protect the main branch

**What to build:** Nobody, including the owner, can push directly to `main`. Every change lands through a pull request whose CI checks pass. Today `main` has no branch protection and no ruleset, and several commits (`a2b33a8`, `d21c6a8`, `ff97045`) were pushed directly without a PR or CI.

**Blocked by:** 01 — Require a changeset on PRs that change the package (so the changeset check can be one of the required checks).

**Status:** skipped — needs owner approval for repo settings

- [ ] A branch ruleset (or classic protection) on `main` requires a pull request before merging.
- [ ] Every CI job (lint, format, test, typecheck, generated-file check, build, site, registry, registry install, changeset check) is a required status check.
- [ ] Force pushes and branch deletion are blocked on `main`.
- [ ] The Changesets "Version Packages" PR flow still works under the ruleset (the release bot can open and update its PR).
- [ ] Verified: a direct `git push` to `main` is rejected.

## Resolution

Skipped: changing branch rulesets or protection modifies GitHub repository settings and needs the owner's approval. Nothing was changed.
