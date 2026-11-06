# 07 — CI publishes 0.1.1 through trusted publishing

**What to build:** A visible Button fix ships as 0.1.1 from GitHub Actions through npm trusted publishing, with no stored token. The app from ticket 06 gets the fix with one upgrade command and no code change, and the release shows provenance. Source: Spec 1, `docs/specs/phase-1-package.md`.

**Blocked by:** 06 — Go public and publish 0.1.0 by hand

**Status:** needs-human — not started. The first CI release will be 0.2.1, not 0.1.1, because 0.2.0 was published by hand

Do these steps in order. A trusted-publisher configuration expires if it is not used within 2 days.

- [ ] A visible Button change and its changeset are prepared on a branch and reviewed, but not merged.
- [ ] The maintainer adds a trusted publisher in the package's npm settings: GitHub Actions, this repository, the release workflow filename. They tick **npm publish** under Allowed actions; the default since Sep 3, 2026 allows only staged publish, which Changesets cannot use.
- [ ] Within 2 days, the branch is merged, the pre-release tarball check passes, and the "Version Packages" pull request is merged.
- [ ] CI publishes 0.1.1 without errors. E404 or ENEEDAUTH means the trusted-publisher configuration does not match the workflow.
- [ ] Exit check 2: the app from ticket 06 gets the Button change after one upgrade command, with no code change.
- [ ] Exit check 3: the npm page for 0.1.1 shows provenance linked to the public repository.
- [ ] The maintainer turns on "Require two-factor authentication and disallow tokens" in the package's publishing access settings.
