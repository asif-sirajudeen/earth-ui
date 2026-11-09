# Validation: hosted `@earth` registry plan vs shadcn and peer design systems

As of: 2026-11-09

Scope: check the 13 plan claims (P1-P13) from the registry plan against shadcn-ui/ui source and against six shadcn-based design systems not covered in earlier notes. Plan text: [registry-implementation-research.md](registry-implementation-research.md) "Recommended architecture", summarised as P1-P13 below.

Related notes: [registry-research.md](registry-research.md), [registry-implementation-research.md](registry-implementation-research.md).

## Sources and method

- shadcn-ui/ui at `8ab27715521cbd4f87ae6886cd989cbb678f6de7`. `main` HEAD equals this SHA on 2026-11-09, so there is no drift. Links use `blob/8ab2771…/<path>#L`.
- CLI experiments with `shadcn` 4.23.0 against a local static server.
- Six peer design systems, shallow-cloned and read only (nothing run), each pinned:
  - @astryx `meta/astryx@bb07866`
  - @yukihi `yukihito-jokyu/design-system@8acdfd9`
  - @hextaui `preetsuthar17/hextaui@bfc8a29`
  - @ai2 `ai2design/ai2-registry@57bad40`
  - @intentui `irsyadadl/intentui@a9ee38b`
  - @cnippet `cnippet-dev/cnippet-ui@48ad983`
- Selection criteria: listed and healthy (score 96+), a coherent component set with its own tokens (not block or effect packs), a public repo, and Base UI or Tailwind v4. Only 2 of the 6 are on Base UI. Few Base UI design systems with public sources are listed. @cnippet is a coss fork, so it is a weak independent signal.
- GitHub docs (GITHUB_TOKEN, Pages limits), the `changesets/action` source, the Tailwind v4 docs, and live `curl -sI` response headers.
- Tags:
  - **[run]**: executed in this check.
  - **[source]**: read in code or docs.
  - **[inferred]**: reasoning from the above.

## Verdict summary

| # | Plan item | Verdict | Change needed |
|---|---|---|---|
| P1 | Namespace `@earth`, registry `name: "earth"` | Partly | A name mismatch costs 2.5 of 10 points in one health component. It is not a hard fail. Keep the rename. |
| P2 | Items derived from `src/`, fail-fast generator | On par | None. Peers @hextaui and @yukihi fail on the same conditions. |
| P3 | Dependency ranges from `package.json` | On par; the plan's wording was wrong | 4 of 6 peers pin versions. Fix the "peers use bare names" wording. Add a `name@range` check. |
| P4 | Internal dependencies as `@earth/x` | On par | Document the namespace setup. A direct-URL install without it fails. |
| P5 | Style item as an npm `@import` | On par | The stash still copies the file. Rewrite the style item. |
| P6 | `registry.json` committed, `public/r` gitignored | On par | None. |
| P7 | Static GitHub Pages | On par for static hosting; divergent on host | Pages is acceptable. Note the 10-minute cache on new releases. |
| P8 | `/r/v<semver>/` snapshots | No peer precedent; deploy mechanics broken as written | Adopt `/v1/` now. Decide between latest-only and snapshots deployed from a `gh-pages` branch. |
| P9 | CI gates | Stricter than 4 of 6 peers | Add a pinned CLI version, an idempotent re-add, and a dry-run in a `radix-vega` project. |
| P10 | Directory PR gates | Confirmed | Prepare an inline SVG logo, `homepage` and `description`. |
| P11 | Skip `__index__.tsx` until a preview site exists | Confirmed | None. |
| P12 | Deploy as a job in `release.yml` | Confirmed; not wired yet | Add the step `id`, job `outputs`, and Pages permissions. |
| P13 | Choose the domain before the directory PR | Confirmed | None. |

Overall: the plan is on par with, or stricter than, the best peers on authoring, dependencies, style delivery and CI. The weak point is P8. Snapshots have no precedent, and the deploy as written does not accumulate them. All other changes are small additions.

## Findings by claim

### P1. Namespace and registry name

- `normalizeRegistryName` lowercases the name, strips spaces and strips a leading `@` ([registry-directory.ts L63-L65](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/lib/registry-directory.ts#L63-L65)). `monitor.ts` L203-L206 compares the result with the namespace. [source]
- The `nameMatches` signal is one of four 2.5-point signals in the "Registry setup" hygiene component (health.mdx L85, L111). A mismatch lowers the score; it is not a failure. The earlier note said "fails". [source]
- `@earth` is not reserved and is not in the directory. [source: validate-registries.yml]

### P2. Derived items

- @hextaui `sync-registry.mjs` scans `components/ui` and throws on:
  - a missing title (L287);
  - an unshippable import (L264);
  - an import missing from its `versions` map (L271);
  - a dependency that is not an item (L460). [source]
- @yukihi `check-registry.mjs` fails on:
  - a duplicate or invalid source;
  - a cycle;
  - an unregistered import;
  - a missing import dependency;
  - a missing npm dependency (L26-L137). [source]
- No peer except @yukihi has an orphan-file check. The plan's two-way orphan check is at the strict end. [source]

### P3. Dependency ranges

- 4 of 6 peers pin versions:
  - @astryx pins exact versions (`@astryxdesign/core@0.7.11`).
  - @yukihi and @ai2 use `^` ranges.
  - @hextaui pins some dependencies.
  - Only @intentui and @cnippet use bare names. [source]
- @ai2 derives ranges from `package.json`, as the plan does. Its script header records an incident: an unpinned dependency installed `react-resizable-panels` v4 against v2-API code ([sync-registry.mjs L11-L14](https://github.com/ai2design/ai2-registry/blob/57bad40/scripts/sync-registry.mjs#L11-L14)). [source]
- Correction: the earlier statement "peers almost never pin" holds for the first eight registries studied, not for design systems.
- Add a generator check that every emitted dependency is `name@range`. [inferred]

### P4. Internal dependency form

- A bare name falls back to `@shadcn` ([builder.ts L39](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/registry/src/registry/builder.ts#L39)). Namespaced dependencies resolve through the consumer's `registries` config ([resolver.ts L46-L76, L180-L196](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/registry/src/registry/resolver.ts#L46-L76)). [source]
- Caveat: without `@earth` in the consumer's config, a namespaced dependency throws `RegistryNotConfiguredError` (resolver.ts L183-L189). So `shadcn add https://…/r/button.json` fails on a fresh project. [source]
- Peers: @ai2, @yukihi and @cnippet use the namespace form. @hextaui and @intentui use absolute URLs. @intentui's committed `registry.json` contains `http://localhost:3000/r/primitive`, rewritten by env at build time. That is fragile. [source]
- Cost of the namespace form, as seen in @yukihi: local CI must run `shadcn registry add '@yukihi=…'` so dependencies resolve against localhost. [source]

### P5. Style item

- Precedent:
  - @astryx puts `css: {"@import \"@astryxdesign/core/reset.css\"": {}, …}` plus the npm dependency on every item.
  - @hextaui's `registry:theme` imports `shadcn/tailwind.css` and `tw-animate-css`, as shadcn's own base style does.
  - @ai2 and @yukihi use a `cssVars` theme item that every UI item depends on. [source]
- earth-ui's `package.json` exports `"./styles.css"` and lists it in `files`, so the `@import` resolves. [source]
- Gap: the stashed `registry/registry-styles.ts` is still a `registry:file` copy to `~/styles/earth-ui.css`, with no `css` and no npm dependency. `build-registry.mts` hardcodes only `tw-animate-css` for the style item. The style item must be rewritten. [source]
- Consumer requirements for the npm route:
  - Install the package (the item's dependency does this).
  - Put `@import "tailwindcss";` before the earth-ui import, because `styles.css` omits it deliberately.
  - Add `@source "../node_modules/@asif-sirajudeen/earth-ui"` only if utility classes are used from inside the package. Tailwind ignores `node_modules`. Registry-copied components live in consumer source, so they need no `@source`. [source: Tailwind v4 docs]
- A shared `@earth/style` dependency is cleaner than @astryx's repeated `css` on all 982 items. [inferred]

### P6. Committed index, generated output

- @astryx, @hextaui, @ai2 and @intentui gitignore `public/r`. [source]
- @yukihi and @cnippet commit `public/r`. @yukihi gets a drift gate from it (`git status --porcelain -- public/r`), at the cost of large diffs. The plan's `registry.json` drift check gives the same safety with smaller diffs. [source], [inferred]

### P7. Hosting

- All six peers serve static JSON. None uses a route handler. Five use Vercel or Cloudflare. All six send `cache-control: max-age=0, must-revalidate`. [run: `curl -sI`]
- GitHub Pages, measured on @materialcn, serves:
  - `application/json; charset=utf-8`;
  - `access-control-allow-origin: *` (also with an `Origin:` request header);
  - `cache-control: max-age=600`. [run]
- Pages limits:
  - the site is at most 1 GB;
  - bandwidth has a soft limit of 100 GB per month;
  - a deployment times out after 10 minutes. [source: GitHub Pages limits doc]
- Directory hosts: 8 github.io, 5 raw.githubusercontent, 4 pages.dev, 69 vercel.app. [run]
- The health monitor scores JSON media type. raw.githubusercontent serves `text/plain` and loses those points, but it is not banned (monitor.ts L159-L161, L218; health.mdx L85). [source]
- Effect: Pages works. A release can be up to 10 minutes stale. Cloudflare Pages allows custom headers if that matters. [inferred]

### P8. Versioning

- Confirmed:
  - `params.version` only appends `?version=…` ([builder.ts L104-L124](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/registry/src/registry/builder.ts#L104-L124)). A static server returned the same file for `?version=9.9.9`. [source], [run]
  - `${VAR:-default}` is unsupported. The regex is `/\${(\w+)}/g` (env.ts L3-L8). The request went out literally and returned 404. [source], [run]
  - `@earth/x` dependencies follow the consumer's pinned namespace URL (resolver.ts L46-L76). [source]
- Correction: an unset `${EARTH_VERSION}` is a hard error, not an empty string. `validateRegistryConfig` throws `RegistryMissingEnvironmentVariablesError` (validator.ts L33-L41). Setting the variable in the shell or in `.env.local` works. Env vars also expand in `headers` and `params`. [source], [run] A code-only reading in this check said the opposite; the run is the deciding evidence.
- Directory count, 548 URLs:
  - 0 contain `{version}`, `?version` or "version".
  - 17 use `{style}`.
  - 1 uses a version path: @yukihi `https://design.yukihi.tokyo/v1/r/{name}.json`. [run]
- Correction to the earlier note: "no peer versions its URL" is false. @yukihi uses a major path. No peer publishes per-release snapshots. [run]
- Deploy mechanics: `actions/deploy-pages` publishes one artifact as the whole site [inferred from the Pages artifact model; no doc sentence found]. Snapshots therefore do not accumulate unless every deploy re-includes them. Pages "deploy from branch" and "deploy from Actions" are mutually exclusive. As written, the plan is ambiguous. [source], [inferred]
- The health monitor only checks the directory URL (latest). It never checks snapshots. [source]
- Peer alternatives:
  - @astryx gets reproducibility from exact npm pins and a `latest` build target that emits only released versions.
  - @yukihi uses a stable `/v1/` major path.
  - Copied source is frozen at install time, so snapshots only help reproduce a fresh `add`. [source], [inferred]

### P9. CI

- 4 of 6 peers have no install test (@hextaui, @ai2, @intentui, @cnippet). The plan is stricter than these. [source]
- @yukihi's `registry-check.yml` has:
  - a 16-target fresh Vite app install matrix;
  - `shadcn view` and `search` checks;
  - an idempotency check: re-`add --overwrite`, then compare the `shasum` of the CSS and `package.json`. [source]
- @astryx's release check installs and compiles every item as both TypeScript and JavaScript consumers. [source]
- Both pin the CLI version: @astryx `shadcn@4.19.0` in CI; @yukihi `shadcn@4.21.0` in its README. [source]
- The health monitor's weekly `add --dry-run` resolves `{style}` to `radix-vega` (monitor.ts L37-L39). Every item, including `@earth/style`, must dry-run cleanly in that project. [source]
- The CLI does not enforce HTTPS. `isUrl()` is `new URL(path)`, so a localhost registry works in CI. [source]
- The stashed `ci.yml` runs only on `pull_request`, with test, drift check and `pnpm registry`. The fuller gates are not implemented yet. [source]

### P10. Directory submission

- Process ([registry-index.mdx L18-L26](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/registry-index.mdx#L18-L26)):
  1. Add one entry to `apps/v4/registry/directory.json`.
  2. Run `pnpm validate:registries`.
  3. Open the PR. The team reviews it. [source]
- Schema ([registry-directory.ts L5-L37](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/lib/registry-directory.ts#L5-L37)): `.strict()`. [source]
  - Required: `name` (`^@[a-zA-Z0-9][a-zA-Z0-9_-]*$`), `homepage` (URL), `url` (must contain `{name}`), `description`, `logo`.
  - `author` is optional.
  - `logo` is a string. All 548 entries use an inline `<svg …>` string, not a URL.
  - Duplicate names are rejected case-insensitively.
- Signed commits:
  - `signed-commits.yml` labels a PR `blocked by: unverified commits` when any commit is unsigned.
  - `signed-commits-close.yml` runs daily at 00:20 UTC and closes the PR 14 days after the label was applied.
  - It re-checks first, and removes the label if the commits are now signed. [source]
- Health monitoring starts after the merge and does not gate publication. Status stays "Observing" until 24 index checks over at least 24 hours. A registry becomes "Unavailable" after 24 hours with no passing index check, and "Degraded" after 3 consecutive failures. [source: health.mdx]
- The monitor fetches the index at `url.replace("{name}", "registry")` (monitor.ts L372, L544). So `/r/registry.json` must exist, be valid, be served over HTTPS as JSON, and have unique item names. [source]

### P11. `__index__.tsx`

- `__index__` and `__components__` are shadcn.com's preview plumbing ([build-registry.mts L97-L105, L248-L260, L1321-L1347](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/scripts/build-registry.mts#L97-L105)). Neither the directory nor the health monitor reads them. [source]
- 5 of 6 peers have no `__index__`, including @hextaui and @astryx, which both have docs sites. Only @cnippet has one (coss lineage). [source]

### P12. Release wiring

- `GITHUB_TOKEN` events do not create workflow runs, except `workflow_dispatch` and `repository_dispatch` ([GitHub docs](https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication)). [source]
- `changesets/action` defaults to `create-github-releases: true` and `push-git-tags: true`, and outputs `published` and `published-packages`. [source]
- Gap: in the current `release.yml`:
  - the publish step has no `id`;
  - the job declares no `outputs`;
  - top-level `permissions: {}` would block a Pages deploy.
  
  A deploy job would therefore run on every push to `main`, and would fail on permissions. [source]

### P13. Domain timing

- When the consumer runs `shadcn add @earth/x`, the CLI writes the directory URL into their `components.json` (registry-index.mdx L8). A later change in `directory.json` does not update URLs consumers already saved. [source]

## Comparison with peer design systems

| | earth-ui plan | @astryx | @yukihi | @hextaui | @ai2 | @intentui | @cnippet |
|---|---|---|---|---|---|---|---|
| Authoring | derived from `src/` | generated from metadata | hand-written plus checker | derived from `components/ui` | hand-written plus sync script | generated (TS) | TS arrays |
| Tokens | `@earth/style`, npm `@import` | npm `@import` on every item | `registry:style` dependency | `registry:theme` with `@import`s | `registry:theme` from `tokens.json` | `registry:style` variants | `cssVars` per item |
| Internal deps | `@earth/x` | none | `@yukihi/x` | absolute URL | `@ai2/x` | absolute URL | `@cnippet/x` |
| npm pinning | ranges from `package.json` | exact | `^` | mixed | `^` from `package.json` | bare | bare |
| Host | GitHub Pages | Vercel | Cloudflare | Cloudflare | Cloudflare | Vercel | Vercel |
| Versioning | `/r/v<semver>/` snapshots | npm pins, `latest` target | `/v1/` path | none | none | none | none |
| `public/r` | gitignored | gitignored | committed | gitignored | gitignored | gitignored | committed |
| Install test in CI | planned | TS and JS consumers | 16-target matrix plus idempotency | no | no | no | no |
| `__index__` | later | no | no | no | no | no | yes |

## Recommended changes to the plan

1. **P8: decision needed. Adopt the `/v1/` path segment either way.** The URL is saved in consumers' `components.json`, so the major path `https://<domain>/v1/r/{name}.json` (@yukihi precedent) is cheap insurance. Then choose:
   - **(a) `/v1/r/` holds latest only.** This is the peer norm. A single `actions/deploy-pages` deploy replaces the site. Cost: no reproducible fresh `add` and no host-side `--diff` between releases.
     - earth-ui items carry the full component source. npm ranges pin only third-party dependencies, not the copied `button.tsx`.
     - @astryx's npm-pin approach works only because its items are thin wrappers.
   - **(b) Per-release snapshots `/v1/r/<semver>/`.** Deploy from a `gh-pages` branch that keeps old files, not from `actions/deploy-pages`. Document `${EARTH_VERSION}` as required, because the CLI hard-errors when it is unset. Cost: novel (no peer does it) and more release machinery.
2. **P12: wire `release.yml`.**
   - Give the publish step `id: publish`.
   - Add job outputs `published` and `published-packages`.
   - Add a `deploy` job with `needs: publish` and `if: needs.publish.outputs.published == 'true'`.
   - Give the deploy job `pages: write`, `id-token: write` and the `github-pages` environment.
3. **P5: rewrite the style item** from the stashed `registry:file` copy to `css: {"@import \"@asif-sirajudeen/earth-ui/styles.css\"": {}}` plus the npm dependency. Document `@import "tailwindcss";` first.
   - The package is neither in its own `dependencies` nor in its `peerDependencies`, so `derive-deps` cannot find a range for it. The generator needs a special case that stamps `@asif-sirajudeen/earth-ui@<package.json version>`. [inferred]
4. **P9: add four CI checks.**
   - Pin the `shadcn` CLI version.
   - `add --dry-run` of every item in a `radix-vega` fixture, to match the health monitor.
   - An idempotent re-add: `add --overwrite` twice, then compare the CSS and `package.json` checksums.
   - A JavaScript-consumer leg on release.
   
   The real-install checks (idempotent re-add, fixture builds) must run after publish in `release.yml`, or install the package from a `pnpm pack` tarball. Reason: on a version-bump PR, the style item's pinned version is not on npm yet, so a real install fails. A dry-run is safe in PR CI. [inferred]
5. **P3: add a generator check** that every emitted dependency is `name@range`. Correct the earlier "peers use bare names" wording.
6. **P4 and consumer docs:** show the `components.json` `registries` snippet and `shadcn registry add @earth`. A direct-URL install fails without it.
7. **P10: prepare the directory assets** before the PR: inline SVG `logo`, `homepage`, `description`, and signed commits.
8. **P1: keep `name: "earth"`.** Describe the mismatch as a lost score signal, not a failure.

## Not covered by this validation

- **Phase 1 restore list is incomplete.** Besides `registry/`, `scripts/`, `registry.json` and `ci.yml`, the stash changes:
  - `package.json` (the `registry*` scripts are not on `main`);
  - `tsconfig.json`;
  - `.gitignore`.
  
  Leaving out the lockfile means running `pnpm install` afterwards. [source: `git stash show --stat`]
- **`git stash apply` will refuse.** `docs/research/registry-research.md` exists untracked in the working tree and is also in the stash's untracked tree. Restore per path instead: `git checkout 'stash@{0}' -- <paths>`. [inferred]
- **Not checked:** the `ts.preProcessFile` parser swap and the "~75 s for 67 items" dry-run estimate.

## Unverified

- Certificate provisioning time for a custom domain on Pages.
- Whether `actions/deploy-pages` replaces the whole site. The Pages model implies it, but no doc sentence was found.
- The exact output of `shadcn add --dry-run`, in the CI context.
- Whether Pages' `max-age=600` causes a stale read in the health monitor right after a release.
- The other DS-like registries whose public repos were not located: @ballmac, @tealmac, @lema-ds, @spaceui, @uiable, @preskok, @odysseyui.
