# 08 — Make the GitHub Pages deploy resilient to timeouts

**What to build:** A release reliably updates the live docs site. The Pages deploy step failed with `Timeout reached, aborting!` for #21 and #26, so the live docs lagged until a later push redeployed them.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] The cause of the timeouts is identified (GitHub-side flake, artifact size, or build output), and the finding is noted in the ticket.
- [x] The deploy step has an explicit timeout and a retry (or an equivalent re-run strategy) so one transient failure does not leave the site stale.
- [x] A failed deploy is visible (for example a failed run on `main` that is not silently superseded).

## Resolution

Cause: GitHub-side. In failed runs (#21, #26) the deploy sat in `syncing_files` until deploy-pages' default 10 min timeout; the `github-pages` artifact was ~6.6 MB in failed and green runs alike, and the build jobs succeeded.
Changed `pages.yml` deploy: `timeout-minutes: 20`, first attempt `continue-on-error` with `timeout: 300000`, one retry step; if the retry fails the job and run on main fail visibly.
Not verifiable locally: needs a real Pages stall.
