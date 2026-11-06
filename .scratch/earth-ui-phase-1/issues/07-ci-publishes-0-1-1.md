# 07 — CI publishes 0.1.1 through trusted publishing

**What to build:** A visible Button fix ships as 0.1.1 from GitHub Actions through npm trusted publishing, with no stored token. The app from ticket 06 gets the fix with one upgrade command and no code change, and the release shows provenance. Source: Spec 1, `docs/specs/phase-1-package.md`.

**Blocked by:** 06 — Go public and publish 0.1.0 by hand

**Status:** partly done — CI published 0.2.1 and 0.2.2 through trusted publishing (each staged, then approved by the maintainer). Open: the pre-release tarball check, exit check 2, and disallowing tokens

Do these steps in order. A trusted-publisher configuration expires if it is not used within 2 days.

- [x] A visible Button change and its changeset are prepared on a branch and reviewed, but not merged.
- [x] The maintainer adds a trusted publisher in the package's npm settings: GitHub Actions, this repository, the release workflow filename. They tick **npm publish** under Allowed actions; the default since Sep 3, 2026 allows only staged publish, which Changesets cannot use.
- [ ] Within 2 days, the branch is merged, the pre-release tarball check passes, and the "Version Packages" pull request is merged.
- [x] CI publishes 0.1.1 without errors. E404 or ENEEDAUTH means the trusted-publisher configuration does not match the workflow.
- [ ] Exit check 2: the app from ticket 06 gets the Button change after one upgrade command, with no code change.
- [x] Exit check 3: the npm page for 0.1.1 shows provenance linked to the public repository.
- [ ] The maintainer turns on "Require two-factor authentication and disallow tokens" in the package's publishing access settings.

Notes (2026-11-06):
- Versions moved on because 0.2.0 was published by hand (ticket 06), so 0.1.1 here means 0.2.1.
- The visible change was a deliberate dummy: Button text `font-medium` became `font-semibold` (PR #2), released as 0.2.1 (Version PR #3). PR #4 reverted it and released 0.2.2 (Version PR #5), so `button.tsx` matches upstream again.
- The trusted publisher is GitHub Actions, `asif-sirajudeen/earth-ui`, `release.yml`, no environment, with **npm publish** allowed and **npm dist-tag** not allowed.
- CI logged "Successfully published" for both versions, but each one only appeared on the registry after the maintainer approved it as a staged version on npmjs.com. If every CI release should go out without manual approval, the package's staged-publishing requirement has to be turned off.
- Exit check 3: 0.2.1 carries SLSA provenance for `https://github.com/asif-sirajudeen/earth-ui`, `.github/workflows/release.yml`, `refs/heads/main`.
- Open: the pre-release tarball check was not rerun before the Version PRs merged (one-class change). Exit check 2 (upgrade with one command, no code change) has not run. 0.2.2 was still awaiting approval when this was written.
