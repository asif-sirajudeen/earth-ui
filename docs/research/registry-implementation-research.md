# Research: production-grade hosted `@earth` shadcn registry for earth-ui

As of: 2026-11-09

Scope: how to implement a hosted, directory-listed `@earth` registry (shadcn-compatible) for earth-ui, which is also an npm package. Covers shadcn's own pipeline, peer pipelines, directory listing (from code), hosting, versioning, the item model, and hybrid npm + registry drift control. Out of scope: provenance/signing, llms.txt, other DX extras.

Cross-links: [registry-research.md](registry-research.md) (prior note, partly superseded, see "Supersedes prior doc"), [coss-registry-lazy-loading.md](coss-registry-lazy-loading.md) (read, conclusions kept, see Q7).

Tags: **[verified]** = I ran it (2026-11-09). **[source]** = read in code/docs at a pinned SHA or fetched URL. **[inferred]** = my reasoning.

## Source key

- `UI@8ab2771` = [shadcn-ui/ui @ 8ab27715521cbd4f87ae6886cd989cbb678f6de7](https://github.com/shadcn-ui/ui/tree/8ab27715521cbd4f87ae6886cd989cbb678f6de7) (2026-11-08). Same key as the prior note. CLI `shadcn` 4.23.0, `@shadcn/registry` 0.2.1 (`packages/shadcn/package.json` L3, `packages/registry/package.json` L3). All live runs used the repo's installed `shadcn` 4.23.0, the same version.
- `cosscom/ui@fe6ffa8` = [cosscom/ui @ fe6ffa81f434a4afe1c01564c13bb237564c42e2](https://github.com/cosscom/ui/tree/fe6ffa81f434a4afe1c01564c13bb237564c42e2) (2026-11-08). `origin-space/originui` redirects here (`gh api repos/origin-space/originui` returns `cosscom/ui`) [verified]. This is the SHA used in the prior notes.
- `basecn@346484e` = [akash3444/basecn @ 346484e1e9141462fdec072a831a568bdae1f29c](https://github.com/akash3444/basecn/tree/346484e1e9141462fdec072a831a568bdae1f29c).
- `materialcn@2628445` = [guillermo-rebolledo/materialcn @ 26284459f542e62645314726e2735ecffd58fa5d](https://github.com/guillermo-rebolledo/materialcn/tree/26284459f542e62645314726e2735ecffd58fa5d).
- `template@906f859` = [shadcn-ui/registry-template @ 906f859db0125965cba71c51da1707c0a4c6d045](https://github.com/shadcn-ui/registry-template/tree/906f859db0125965cba71c51da1707c0a4c6d045).
- Directory data = `https://ui.shadcn.com/r/registries.json`, fetched 2026-11-09 (HTTP 200, 548 entries). Local copy used for the counts below.
- Stash = `git stash@{0}` ("On main: registry"). Correction to the brief: the registry code (`registry/*.ts`, `scripts/*.mts`, `registry.json`, `ci.yml`, `package.json`, `.gitignore`, `tsconfig.json`) is in the stash commit itself (`git show stash@{0}:<path>`). `stash@{0}^3` holds only the two untracked docs. The stash does contain `.github/workflows/ci.yml` (PR job: `pnpm test`, `registry:check`, `registry`); main has only `release.yml`.
- Scratch: `/private/tmp/claude-502/-Users-asif-sirajudeen-learnings-earth-ui/6f0fcb78-4275-4255-8711-097bd8a56d7d/scratchpad/` (`reg/` registry fixture, `app*/` consumer fixtures, `health/` replica of the directory dry-run fixture, `poc/css2obj.mjs`, `server.mjs`). Nothing in the repo was modified; the local server was stopped.

## Summary

| # | Question | Finding | Confidence |
|---|---|---|---|
| 1 | shadcn's pipeline | TS/CSS authored under `apps/v4/registry/bases/{base,radix}` and `registry/styles`; one 1,840-line `build-registry.mts` writes temp per-style `registry-<style>.json`, then spawns `shadcn build` per style into `public/r/styles/<style>`. Output is gitignored and rebuilt on every Vercel deploy. No item versioning. Official starter exists (`registry-template`) but is stale (shadcn ^3, Radix, no CI). | [source] |
| 2 | Peers | By criteria (Base UI, healthy, directory-listed): @coss (generator, Vercel, no registry CI gate), @materialcn (derived items, GitHub Pages, CI gate, npm+registry hybrid: closest analog). @basecn fits the first three criteria but has a trivial build; kept as baseline. | [source]+[verified] |
| 3 | Directory | Listing is a PR adding one object to `apps/v4/registry/directory.json`. Hard gates in code: strict zod schema, reserved-namespace job, signed-commit check (auto-close after 14 days), maintainer review. The registry itself is not fetched at PR time; health monitoring starts after merge and checks `{url}` with `{name}=registry`, item JSON, and a CLI dry-run. | [source] |
| 4 | Hosting | GitHub Pages recommended: `application/json`, `access-control-allow-origin: *`, `cache-control: max-age=600` (observed on a live listed peer), free, 8 listed peers, all healthy. `raw.githubusercontent.com` serves `text/plain` and costs 2.5 health points (observed). Route handler only if dynamic behavior is needed. | [verified]+[source] |
| 5 | Versioning | `params` are appended to every fetch, dependencies included, but a static host ignores them (silent no-op). A versioned path (`/r/v0.3.0/{name}.json`) or `${ENV}` in the URL pins the whole dependency tree. All 548 directory URLs are latest-only except one `/v1/` path. | [verified] |
| 6 | Item model | `@earth/x` dependencies resolve through the consumer's configured URL (so pins carry over). Bare names resolve to the consumer's style, so never use them for UI built-ins. `css` on `registry:theme`/`style` carries `@utility`, `@custom-variant`, `@import`; but `@theme` declarations must go to `cssVars.theme`, and nested at-rules duplicate on re-add. | [verified] |
| 7 | Hybrid | The stash's derive-deps approach is sound. Needs: `@earth/` form, registry name `earth`, titles/descriptions (1 of 67 have them), orphan and cycle checks, release-coupled deploy, directory-parity CI. Lazy-load index conclusion stands (no docs site, no consumer). | [verified]+[inferred] |

## Q1. shadcn's own pipeline (UI@8ab2771)

**Authoring.** [source]
- Per-base authored registries in TS: `apps/v4/registry/bases/base/registry.ts` aggregates `blocks`, `components`, `examples`, `hooks`, `internal`, `lib`, `ui` `_registry.ts` files ([registry.ts L1-L40](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/registry/bases/base/registry.ts#L1-L40)). Style tokens are CSS in `apps/v4/registry/styles/style-*.css`. The base style item uses `css: {'@import "tw-animate-css"': {}, '@import "shadcn/tailwind.css"': {}, ...}` plus `devDependencies: ["tw-animate-css", "shadcn"]` (same file, L8-L30). So shadcn does not copy its Tailwind utilities; it imports them from an npm package.
- `apps/v4/registry.json` also exists (legacy `index`/`style` items, `registry:style` with `cssVars: {}`).

**Generation.** [source] `apps/v4/scripts/build-registry.mts` ([header L25-L66](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/scripts/build-registry.mts#L25-L66)) is "the single v4 registry pipeline". Steps: base indexes, temporary styled trees `registry/<base-style>`, lazy `__index__` files (docs-only), `public/r/*` via CLI, format, clean temp files. Per style it writes `registry-<style>.json` with paths rewritten to `registry/<style>/...`, adds `cn` to `dependencies` when a file imports `"cn"` ([L1346-L1428](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/scripts/build-registry.mts#L1346-L1428)), validates with `registrySchema`, then spawns `node packages/shadcn/dist/index.js build registry-<style>.json --output public/r/styles/<style>` ([L1430-L1457](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/scripts/build-registry.mts#L1430-L1457)). The generator validates against the CLI's own schema before the CLI builds: same pattern as the stash.

**Serving and versioning.** [source]+[verified]
- `public/r/styles/*` is gitignored except frozen `default/`, `new-york/` and `index.json`; "rebuilt by registry:build on every deploy" ([.gitignore L51-L58](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/.gitignore#L51-L58); `apps/v4/package.json` L8, L18: `build` = `registry:build && next build`).
- `https://ui.shadcn.com/r/styles/base-nova/button.json` returns `application/json; charset=utf-8`, `access-control-allow-origin: *`, `cache-control: public, max-age=0, must-revalidate`, ETag, served by Vercel [verified: `curl -sD -`, 2026-11-09].
- No version field or versioned path. The CLI is versioned on npm; items are latest. The only variant dimension is `{style}` ([constants.ts L44-L46](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/registry/src/registry/constants.ts#L44-L46)).

**CI around the registry.** [source] `code-check.yml` L146-L152 builds all styles then typechecks. `templates.yml` runs on PRs touching `apps/v4/registry/**` and installs the built registry into real templates across next/vite/astro/start/react-router and pnpm/bun/npm/yarn. That is an install smoke test, which the stash lacks.

**Official starter.** Yes: [`shadcn-ui/registry-template`](https://github.com/shadcn-ui/registry-template) (GitHub template repo, linked from [getting-started.mdx L10-L20](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/getting-started.mdx#L10-L20)). Read at `template@906f859`: Next 15 app, hand-authored `registry.json` (`name: "acme"`), `"registry:build": "shadcn build"`, `shadcn ^3.0.0`, Radix deps, no `.github/` workflows. README says it "includes a route handler", but my tree listing found no route file (listing excluded `public/`). It is a skeleton, not a pipeline. Do not adopt it.

## Q2. Peer pipelines

**Selection criteria (stated before choosing).** [verified on registries.json]
1. Listed in the directory.
2. Base UI (approximate filter: description matches `/base ?ui/i`, 45 entries; this under-counts registries whose description omits it).
3. `health.status == "healthy"`.
4. Non-trivial build script (a generator that derives something, beyond bare `shadcn build`).

| Registry | Directory data | Criteria |
|---|---|---|
| @coss (`cosscom/ui`) | healthy 96.44, 607 items | all 4 |
| @materialcn | healthy 98.765, 66 items | all 4; hybrid npm+registry on GitHub Pages |
| @basecn | healthy 98.674, 56 items | 1-3 only. Hand-authored `registry.json`, build = `shadcn build`. Kept as the baseline, not as a model. |

I did not review the other ~40 matches; the three are the largest healthy one, the closest structural analog, and the baseline. Selection is partly judgment.

| | @coss (`cosscom/ui@fe6ffa8`) | @materialcn (`materialcn@2628445`) | @basecn (`basecn@346484e`) |
|---|---|---|---|
| Authoring | TS arrays `apps/ui/registry/registry-*.ts` (hand-declared deps) | Items **derived from the source tree** (`scripts/lib/registry-items.mjs`); only titles/descriptions hand-written (`registry-metadata.mjs`) | Hand-written `registry.json` |
| Generator | `scripts/build-registry.mts` (index, `registry.json`, `shadcn build`) ([L86-L135](https://github.com/cosscom/ui/blob/fe6ffa81f434a4afe1c01564c13bb237564c42e2/apps/ui/scripts/build-registry.mts#L86-L135)) | `generate-registry.mjs` + `css-to-registry.mjs` (postcss, 168 lines) then `shadcn build` ([generate-registry.mjs L82-L203](https://github.com/guillermo-rebolledo/materialcn/blob/26284459f542e62645314726e2735ecffd58fa5d/scripts/generate-registry.mjs#L82-L203)) | `shadcn build` only (`package.json` `registry:build`) |
| Deps | Declared by hand; `validate-registry-deps.mts` checks imports vs declarations (not run in CI) | Derived from imports; versions from `package.json` `dependencies`; import-graph owner assignment; cycle detection ([registry-items.mjs L188-L286](https://github.com/guillermo-rebolledo/materialcn/blob/26284459f542e62645314726e2735ecffd58fa5d/scripts/lib/registry-items.mjs#L188-L286)) | Bare names, hand-written |
| Internal deps | `@coss/x` (1,206 uses, prior note) | **Absolute URLs**, with a documented reason (bare = official shadcn; relative = consumer cwd; `@ns/x` breaks `add <url>`) ([L59-L80](https://github.com/guillermo-rebolledo/materialcn/blob/26284459f542e62645314726e2735ecffd58fa5d/scripts/generate-registry.mjs#L59-L80)) | `@basecn/x` |
| Theme | `registry:style` with `cssVars` | `registry:theme` with `css` + `cssVars`; every rendering item depends on it ([L103-L141](https://github.com/guillermo-rebolledo/materialcn/blob/26284459f542e62645314726e2735ecffd58fa5d/scripts/generate-registry.mjs#L103-L141)) | per-item `cssVars`/`css` |
| Hosting | Next site on Vercel; `public/r` committed (609 files) | **GitHub Pages**, workflow `registry.yml` builds then deploys | Next site on Vercel; `public/r` committed |
| CI gates | build, test, typecheck only; no registry gate (grep of workflows) | `registry.yml`: `registry:build` -> `test:registry` (CLI zod schemas: registry valid, items valid, flat, no `content` in index, absolute internal deps exist, theme dependency, titles present) -> deploy. `publish.yml`: tag `v*`, tag == package version, typecheck, lint, tests, build, `npm publish` via trusted publishing ([registry.test.mjs](https://github.com/guillermo-rebolledo/materialcn/blob/26284459f542e62645314726e2735ecffd58fa5d/scripts/registry.test.mjs)) | none (tree has no `.github/`) |
| Response headers (live) | `application/json; charset=utf-8`, ACAO `*`, `max-age=0, must-revalidate`, Vercel | `application/json; charset=utf-8`, ACAO `*`, `max-age=600`, GitHub.com | same as coss |

Header rows [verified: `curl -sD -` of each `/r/registry.json`, 2026-11-09].

Takeaways [inferred from the above]:
- materialcn is the model to copy for structure: derived items, CI schema gate, Pages hosting, npm publish from tag. It still has gaps (no install smoke test, no versioned snapshots).
- Namespace-form internal dependencies are the norm at scale (coss, basecn). materialcn's absolute-URL choice trades pinning for direct-URL installs; see Q6.

## Q3. Directory listing, from code (UI@8ab2771)

"Uploading to the shadcn registry" = a PR to `shadcn-ui/ui` adding one object to `apps/v4/registry/directory.json`. Process per [registry-index.mdx L16-L33](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/registry-index.mdx#L16-L33).

### What must pass at PR time (hard gates)

| Gate | Source | Detail |
|---|---|---|
| `directory.json` schema | [`lib/registry-directory.ts` L3-L37](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/lib/registry-directory.ts#L3-L37) | Entry is `.strict()`: `name` matches `^@[a-zA-Z0-9][a-zA-Z0-9_-]*$`; `homepage` URL; `url` URL containing `{name}`; `description` string; `logo` string (**required**, an SVG string); `author` optional. Unknown keys rejected. Namespaces unique case-insensitively. |
| `validate:registries` | [`scripts/validate-registries.mts` L10-L48](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/scripts/validate-registries.mts#L10-L48), workflow `validate-registries.yml` (runs only when `directory.json` changes) | Validates the JSON file and the public `/r/registries.json` payload. **It does not fetch your registry.** |
| Reserved namespaces | `validate-registries.yml` L36-L38: `@shadcn,@ui,@blocks,@components,@block,@component,@util,@utils,@registry,@lib,@hook,@hooks,@theme,@themes,@chart,@charts` | `@earth` is not reserved, and is not in the 548 current entries [verified: `jq` on registries.json]. Open PRs claiming it were not checked. |
| Signed commits | `signed-commits.yml` L42-L43 (flags `reason == "unsigned"`, adds label `blocked by: unverified commits`), `signed-commits-close.yml` L31 (`maxAgeDays = 14`, daily close) | Unsigned commits get the PR auto-closed after 14 days. |
| Human review | [registry-index.mdx L22](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/registry-index.mdx#L22) | Example: PR #11710 (`@afterglow`, Base UI) opened 2026-08-29T22:50Z, approved and merged by `shadcn` 2026-08-30T07:32Z, one file changed, one approval [source: `gh pr view`]. |
| Not gates | `code-check.yml` L61-L100 `format:check` runs `apps/v4` prettier on `**/*.{ts,tsx,mdx}` only; `check-registry-changeset.js` concerns `@shadcn/registry` source | The `prettier --check` line in PR #11710's body was the author's habit, not a gate. |

Docs' stated requirements (open source, valid registry schema, flat layout with `/registry.json` and `/<name>.json`, no `content` in index `files`) are enforced by reviewers and by post-merge health, not by `validate:registries`.

### What the health monitor checks after merge (determines score and status)

Code: `lib/registry-health/{monitor,network,dry-run}.ts`; workflow `monitor-registries.yml` (hourly cron `17 * * * *`). Docs: [health.mdx](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/health.mdx).

- **Index URL** = your `url` with `{name}` -> `registry` and `{style}` -> `radix-vega` (`monitor.ts` `replaceRegistryItem`, L371-L373; call at L544). So `https://<host>/r/registry.json` must exist. [source]
- **Fetch behavior** ([network.ts L10-L13, L379-L387](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/lib/registry-health/network.ts#L10-L13)): `Accept: application/json`, UA `shadcn-registry-health/1.0`, 10 s timeout, 10 MiB body cap, manual redirects (max 5), 3 attempts with backoff on 5xx/408/429/transport errors, private/loopback IPs refused, credentials in URL refused. Cloudflare/Vercel challenge pages are detected and counted as `monitoringLimited`, not as outages (L282-L313). [source]
- **Index** must pass `registrySchema` from `shadcn/schema`; setup ("hygiene", 4 x 2.5 pts): HTTPS, JSON media type (`application/json`, `text/json` or `+json`; `monitor.ts` L159-L166), no duplicate item names, and **registry `name` equals the namespace after `normalizeRegistryName`** (lowercase, spaces removed, leading `@` stripped; L203-L208). [source]
- **Items** (daily rotating sample): `/r/{item}.json` must pass `registryItemSchema` and `parsed.data.name === item` (L562-L569). [source]
- **CLI** (weekly rotating item): `add <ns>/<item> --dry-run --yes` in a blank project with `style: "radix-vega"`, `rsc: true`, empty `app/globals.css`, `package.json` `{"private":true}`, only your namespace configured and no `params` ([dry-run.ts L19-L184](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/lib/registry-health/dry-run.ts#L19-L184)). [source]
- **Score**: reliability 45, correctness 25, installability 20, setup 10 (docs table). Degraded if index fails 3 times in a row, schema invalid, <90% of sampled items pass after >=10 checks, or two latest CLI checks fail. Directory ordering adds an item-count bonus capped at 500 items. [source]

Evidence from live data [verified, 548 entries]: all 5 entries on `raw.githubusercontent.com` show `hygiene` below 10 (four at 7.5, `@vectorstudio-ir` at 5), consistent with losing the JSON-type point (cause not isolated per entry); `@materialcn` on Pages shows `hygiene: 10`.

I replicated the dry-run fixture (`scratchpad/health/`, same `components.json`, empty CSS, `radix-vega`, scrubbed env) against the local fixture registry: `add @earth/{alert-dialog,needs-builtin,style,theme} --dry-run --yes --cwd .` all succeeded. [verified]

### Pre-PR checklist (derived)

1. `registry.json` `name` = `earth` (see Open question 1).
2. `https://<host>/r/registry.json` and every `/r/<item>.json` return 200 with a JSON media type; no redirects beyond 5; no bot-challenge page.
3. Every item has `title` and `description` (shown by `shadcn search`/`list`) [verified: output of `list @earth`].
4. Dry-run of every item in the health fixture passes.
5. Draft entry (needs a real `logo` SVG):

```json
{
  "name": "@earth",
  "homepage": "https://asif-sirajudeen.github.io/earth-ui",
  "url": "https://asif-sirajudeen.github.io/earth-ui/r/{name}.json",
  "description": "Base UI components on Tailwind v4, shadcn-compatible.",
  "author": "...",
  "logo": "<svg ...>"
}
```

6. Signed commits; PR title convention seen in merged PRs: `feat(registry): add @earth to the registry directory`; run `pnpm --filter=v4 validate:registries` locally in a shadcn-ui/ui checkout.

## Q4. Hosting decision

Requirement: stable `https://.../r/{name}.json` that never moves (the URL is stored in `directory.json` and **persisted into each consumer's `components.json`** by `ensureRegistriesInConfig`, [registries.ts L106-L130](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/shadcn/src/utils/registries.ts#L106-L130)). A host move therefore needs a directory PR and leaves existing consumers on the old URL. [source]

What the CLI requires of a response [source: [fetcher.ts L44-L106](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/registry/src/registry/fetcher.ts#L44-L106)]:
- Sends `Accept: application/vnd.shadcn.v1+json, application/json;q=0.9`, `User-Agent: shadcn` [verified in server log].
- Success = HTTP ok then `response.json()`. **Content-type is not checked on success** (so `text/plain` works for the CLI). On error it maps 401/403/404/410 to typed errors and reads an RFC 7807-style JSON body if `content-type` includes `application/json`.
- Cache is an in-process `Map` per run; no disk cache. `Cache-Control` matters only for CDNs/browsers. CORS matters only for browser consumers (docs sites, v0), not the Node CLI [inferred].

| Option | Fit | Evidence |
|---|---|---|
| **GitHub Pages** (recommended) | `https://asif-sirajudeen.github.io/earth-ui/r/{name}.json`. Free for public repos. Actions deploy. `application/json; charset=utf-8`, ACAO `*`, `cache-control: max-age=600`. 8 of 548 directory entries use `github.io`, all healthy (avg 97.6, min 95.944) | Headers [verified] on a live peer; limits [source: GitHub Pages limits doc, fetched 2026-11-09]: site <=1 GB, 100 GB/month soft bandwidth, 10 builds/hour soft limit (does not apply to custom Actions workflows), 10 min deploy timeout, not for commercial SaaS. earth-ui's registry is ~0.3 MB. |
| Cloudflare Pages / Netlify / Vercel static | Same shape; custom domain and header files available. 7 listed entries on `pages.dev`/`netlify.app`, all healthy except one degraded | [verified] directory URLs. Not tested here. Bot-protection features could trigger the monitor's challenge detection (`monitoringLimited`). [inferred] |
| Route handler (Next on Vercel) | Only if you need request-time logic (auth, analytics, content negotiation on the `vnd.shadcn.v1+json` Accept). Adds a server, cold starts, cost | @ai-elements does this and is `degraded` (88.843); the cause was not investigated, so no inference. |
| `raw.githubusercontent.com` | Zero setup, but `text/plain`, serves the live branch (unreleased changes go public) | [verified] `content-type: text/plain; charset=utf-8`; 4 of 5 listed raw entries sit at `hygiene: 7.5` (one at 5). Rate limits unverified. |

Recommended: GitHub Pages now; if AnywhereWorks has a domain, put a CNAME in front **before** the directory PR so the URL never has to change (Open question 2). Effort: one workflow (~40 lines), enable Pages with source "GitHub Actions" or a branch, and a one-line entry PR. No server.

## Q5. Versioning and updates

**What the CLI does with `params`** [verified, `scratchpad/app`, local server log]:

```text
components.json: "@earth": {"url": ".../r/{name}.json", "params": {"version": "v1.2.0"}}
$ shadcn add @earth/alert-dialog --dry-run --yes
GET /r/alert-dialog.json?version=v1.2.0
GET /r/button.json?version=v1.2.0        <- the @earth/button dependency also carries it
```

Source: [builder.ts L58-L124](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/registry/src/registry/builder.ts#L58-L124) (`appendQueryParams`), docs [namespace.mdx "Versioning"](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/namespace.mdx#L642-L704). A static host ignores the query string and returns the latest (GitHub Pages `.../button.json?version=zzz` returned 200 [verified]). So `params.version` on Pages is a **silent no-op**: a consumer believes they are pinned and are not. Do not document it for `@earth`.

**Versioned path** [verified]:

```text
"@earth": "http://localhost:4100/r/v1/{name}.json"
GET /r/v1/alert-dialog.json
GET /r/v1/button.json                    <- dependency stays on v1
```

**Env in URL** [verified]: `"@earth": ".../r/${EARTH_VER}/{name}.json"` with `EARTH_VER=v1` fetched `/r/v1/...`. Two doc-vs-code gaps: `${VAR:-default}` (recommended by namespace.mdx "best practices") is **not supported** at 4.23.0: it was sent literally (`/r/$%7BEARTH_VER:-v1%7D/...`, 404). An unset `${VAR}` expands to an empty string (`/r//name.json`, from `env.ts` L3-L8, not run). [verified/source]

**Consumer config sources** [verified+source]: `package.json` top-level `"registries": {...}` is a fallback; `components.json` wins per key ([api.ts L219-L244](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/registry/src/registry/api.ts#L219-L244)). Tested: package.json-only config resolves; adding a different URL in `components.json` took precedence.

**What large registries do.** [verified on registries.json] Of 548 directory URLs, none uses a version placeholder; 17 use `{style}`; one (`@yukihi`) has `/v1/` in the path. shadcn itself, @coss, @basecn, @materialcn are latest-only (Q1, Q2). The update story everywhere is copy-and-own.

**`add --diff` flow** [verified]:
- `shadcn add @earth/button --diff` prints a unified diff against the local file with no writes (`(overwrite)` + `---/+++`). `add` without `--overwrite` prompts per existing file (non-interactive run stalled at the prompt). `add --overwrite --yes` replaces it.
- Observed oddities: a leading `//` comment in the source never reached the consumer file (`--view` shows the file without it, and `--diff` reported "No changes"; cause not traced). The diff also showed quote normalization (`[class*="size-"]` became `'size-'`); the CLI rewrites files on write. Release notes should therefore describe changes by item, not rely on raw source diffs.
- `registry:theme`/`registry:style` re-add updates values in place without `--overwrite` ([add-components.ts L436-L455](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/registry/src/add-components.ts#L436-L455) forces `overwriteCssVars` when a requested item is theme/style/font/base): changing `brand` and an `@utility` value in the item and re-adding updated both [verified].

**Recommended versioning (see architecture):** `/r/` = latest; immutable `/r/v<semver>/` snapshots equal to the npm version. Consumers pin by editing the URL (or `${EARTH_VERSION}`); dependencies follow automatically. Pages replaces the whole site on each deploy, so snapshots must be accumulated (a `gh-pages` branch) or rebuilt per tag. v0.2.1 and v0.2.2 predate the registry, so snapshots start at the first registry release. [inferred]

## Q6. Item model

**Dependency forms** (all behaviors [verified] unless marked):

| Form in `registryDependencies` | Resolved through | Result |
|---|---|---|
| `@earth/button` | Consumer's `registries["@earth"]` URL, **including `params`** and path pins | Works; pin carries to dependencies (Q5). Fails with `Unknown registry "@earth"` if the namespace is unconfigured and unlisted. |
| bare `button` / `tooltip` | `@shadcn` with the **consumer's** `style` | Base UI `tooltip` for `base-nova`, Radix `tooltip` for `radix-vega` (checked via `--view`: `@base-ui/react/tooltip` vs `radix-ui`). Never use for UI built-ins in a Base UI registry. earth-ui's stash uses none (0 of 67). |
| `https://.../x.json` (materialcn) | Direct fetch ([resolver.ts L99-L110](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/registry/src/registry/resolver.ts#L99-L110)) [source] | Always latest; works without namespace config. Not tested. |
| `asif-sirajudeen/earth-ui/x#tag` (GitHub) | GitHub API, bypasses the host; refs not inherited by dependencies ([registry-item-json.mdx L175-L190](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/registry-item-json.mdx#L175-L190)) [source] | Mixed paths pull dependencies through a second channel. |

**Namespace handling at install** [verified+source]:
- `add http://localhost:4100/r/alert-dialog.json` (its dependency is `@earth/button`) with no `@earth` configured -> `Unknown registry "@earth"`. A dependency-free item by direct URL works. So before listing, direct-URL and GitHub installs of items with `@earth/` dependencies fail; after listing, `ensureRegistriesInConfig` discovers the namespace from `registries.json`, including namespaces found only in dependencies ([registries.ts L12-L75](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/shadcn/src/utils/registries.ts#L12-L75), [namespaces.ts L8-L63](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/registry/src/registry/namespaces.ts#L8-L63)). Verified with a live listed namespace: `add @materialcn/button --dry-run` in a project with no `registries` resolved it; the real `add` persists the URL into `components.json` (source: L109-L130).
- Dependency graph is topologically sorted and `registry:theme` items are moved first ([resolver.ts L310-L322](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/registry/src/registry/resolver.ts#L310-L322)).

**Why namespace form for earth-ui** [inferred from the table]: it pins with the URL, matches the scale norm (coss, basecn), and works once listed. Its cost is the pre-listing window (use the local/`--cwd` smoke tests, or pass `registries` explicitly). The GitHub-address fallback is not a second distribution path once dependencies are `@earth/`.

**Types.** [source] `registry:style` / `registry:theme` / `registry:base` / `registry:font` all force `overwriteCssVars`. `extends` is read only by the `init` preset flow (`installStyleIndex: item?.extends !== "none"`, [presets.ts L277](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/shadcn/src/preset/presets.ts#L277)). A `registry:style` item with `extends: "none"` and only `registryDependencies` added as a plain `add` target and installed its dependency tree [verified]. `registry:base` (`config` field: style, iconLibrary, aliases, registries, ...) is for whole design systems used by `init`; documented in [examples.mdx](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/examples.mdx); **not tested here**. Item-level version metadata belongs in `meta` (docs example `"version": "2.0.0"`).

**CSS: what the item fields can and cannot carry** (this refutes the stash comment at `registry/registry-styles.ts` L4 and the prior note's Step 3) [verified, `scratchpad/reg`, `app*`]:
- A `registry:theme` item with `css: {'@import "tw-animate-css"': {}, '@custom-variant data-open': {...}, '@utility earth-focus': {...}, '@layer base': {...}}` and `cssVars` wrote all of them into `app/globals.css`. Re-adding is idempotent for these; changed values update in place.
- Declarations directly inside an at-rule fail: converting `@theme inline { --x: y }` into `css` gave `Error parsing rule content: --color-sidebar-ring var(--sidebar-ring) CssSyntaxError`. They must go to `cssVars.theme` (as materialcn's converter documents, [css-to-registry.mjs L1-L30](https://github.com/guillermo-rebolledo/materialcn/blob/26284459f542e62645314726e2735ecffd58fa5d/scripts/lib/css-to-registry.mjs#L1-L30)).
- PoC: a ~30-line postcss converter (`scratchpad/poc/css2obj.mjs`) turned the repo's real 774-line `styles.css` into 54 `css` keys + 38 `cssVars.theme` vars (dropping the npm-only `@source "./dist/**/*.js"`). `shadcn registry validate`, `build`, `add` all passed; the result compiled under Tailwind 4.3.5 (`@tailwindcss/cli`, 48 `scroll-fade|shimmer` matches).
- Caveats found: (a) on a project with existing shadcn tokens, the CSS merged into the existing `:root`/`.dark`/`@theme inline` blocks (no duplicate blocks; user-only variable `--my-own` preserved) but an overlapping user value (`--primary: red`) was **overwritten** by the item's value; (b) **re-adding the item is not idempotent**: nested `@supports` blocks inside `@utility scroll-fade*` were appended again (diff showed duplicated blocks); (c) comments are dropped; (d) removal of a token on re-add was not tested.
- Option that avoids all of this [verified]: item `css: {'@import "@asif-sirajudeen/earth-ui/styles.css": {}}` plus `dependencies: ["@asif-sirajudeen/earth-ui@^0.2.2"]` wrote one `@import` into `globals.css`, installed the package (npm 0.2.2 exists), and compiled (127 `scroll-fade|shimmer|data-open` matches). This is how shadcn's own base style uses `shadcn/tailwind.css` (Q1). It keeps one stylesheet (the npm one) at the cost of a CSS-only runtime dependency.

**Auto-dependency on the style item.** 18 of 64 components use classes defined by `styles.css` (`data-open:`, `data-closed:`, `animate-in`, `no-scrollbar`, `scroll-fade`, `shimmer`; `grep`, [verified]). Without the style item they render wrong without an error. materialcn makes every rendering item depend on its theme item and tests it. Recommended: every `registry:ui` item gets `@earth/style` (CLI dedupes; for dependency items `overwriteCssVars` is not forced, only for requested top-level items [source: add-components.ts L439-L452]).

## Q7. Hybrid npm + registry: one source of truth

**Baseline reviewed** (stash `stash@{0}`): `registry/registry-{ui,hooks,styles}.ts` (authored: name, type, files, `meta.links`), `scripts/derive-deps.mts` (imports -> `dependencies` with ranges from `package.json`, `@/components/x` -> `registryDependencies`, throws on unknown alias or a `src/lib` file not listed), `scripts/build-registry.mts` (writes `registry.json`), tests, CI (`test`, `registry:check`, `registry`). Output: 67 items (64 ui, 2 hooks, 1 style), 21 with registry deps, 15 distinct npm deps [verified: `jq` on stash `registry.json`].

**What is right and should stay:**
- `src/` is the only source; npm build (`tsdown`) and registry read the same files [source].
- Dependency ranges derived from `package.json`, so the registry installs what CI tests [source].
- Throwing on unresolved aliases (materialcn does the same, [registry-items.mjs L98-L111](https://github.com/guillermo-rebolledo/materialcn/blob/26284459f542e62645314726e2735ecffd58fa5d/scripts/lib/registry-items.mjs#L98-L111)).
- Unit tests for the pure helper; `shadcn registry validate` + `build` in CI.

**What to change (ordered by impact):**
1. **Namespace form and name.** `REPO/<name>` -> `@earth/<name>`; registry `name` `"earth-ui"` -> `"earth"`. With `earth-ui` the health name check fails (`normalizeRegistryName("earth-ui") != "earth"`) and costs 2.5 points [source: monitor.ts L203-L208; my scratch registry used `earth`, so my live runs did not exercise this].
2. **Titles and descriptions.** 1 of 67 items has them [verified]. `search`/`list` print them. Make the generator fail without them (materialcn's `registry-metadata.mjs` pattern).
3. **Drift in the item list.** Items are authored; a new `src/components/foo.tsx` with no entry ships on npm and silently not in the registry (no check catches it; a missing file does fail). Either derive items from `src/components/*.tsx` (one item per file, author only metadata) or add an orphan check in both directions. Also check `src/index.ts` exports against items if the barrel is public API [inferred].
4. **Cycle detection** (materialcn `findCycle`): a cycle makes `add a` drag in `b` [source].
5. **Style item.** Replace the `registry:file` copy (the consumer must import it by hand; `add` does not) with the npm `@import` item, or the converter route with its caveats (Q6). Add `@earth/style` as a dependency of all `registry:ui` items.
6. **Parser.** Regex import scan (own `ponytail:` note) skips dynamic `import()`. `typescript` is already a dev dependency, and `ts.preProcessFile` returns static and dynamic imports without a hand-rolled regex [inferred; not run]. Add a fixture test for the highlighter's dynamic imports.
7. **`registry:check`** uses `git diff --exit-code registry.json`, which cannot detect an untracked file (git semantics) [inferred]; fine once the file is committed. Committing `registry.json` is no longer needed for distribution (the deploy builds from source) but it gives a reviewable diff of dependency changes; keep it.
8. **Install smoke** (shadcn does it: `templates.yml`). Dry-run all items against the built registry in the health-style fixture. Measured: one `add a b c d e --dry-run` of 5 items took 1.1 s; separate runs ~1.1 s each [verified], so 67 items fit in a PR job in about 75 s [inferred]. Add a real install + `tsc` + Tailwind compile for a sample on release.
9. **Deploy coupling.** Deploy `/r/` from the changesets publish job, not on every push to `main`, so `/r/` latest always equals npm latest and the snapshot path equals the npm version. A tag pushed with the default `GITHUB_TOKEN` does not trigger other workflows (GitHub behavior, not re-verified here), so run the deploy as a job in `release.yml` after publish rather than a separate tag-triggered workflow [inferred].
10. **`@shadcn/react@~0.3.1`** is a runtime dependency of `message-scroller` and `questionnaire` items [verified in stash registry.json; exists on npm 0.3.1]. Consumers get it via `add`; keep, but it is a dependency to track.

**On [coss-registry-lazy-loading.md](coss-registry-lazy-loading.md).** Its conclusion holds and I found nothing contradicting it: `__index__.tsx` is a docs-preview artifact, not an input to `shadcn build`; shadcn's own script header lists it as a separate output ([build-registry.mts L25-L45](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/scripts/build-registry.mts#L25-L45)). earth-ui has no docs site, so do not build it. Revisit when a preview site exists. The directory's health checks never touch it.

## Supersedes prior doc

Prior note: [registry-research.md](registry-research.md), "Recommended decisions" (numbers as in that note) and "Rejected options".

| Prior item | Status | Why |
|---|---|---|
| #1 GitHub address as primary and only path | **Superseded** | User pivot to hosted `@earth` + directory. The GitHub address stays only as a secondary channel and, with `@earth/` dependencies, works only after listing (Q6). |
| #2 Commit `registry.json`, keep `registry:check` | **Kept**, reason changed | No longer required for distribution; kept for reviewable dependency diffs. |
| #3 Stamp `#v<version>` on GitHub-form `registryDependencies` at release | **Superseded** | Dependencies are `@earth/x`; pins come from the namespace URL (`/r/v<ver>/`), and they carry to dependencies [verified]. |
| #4 Versioning by git tags only; reject `/r/v1/` and `params.version` until a host exists | **Partly superseded** | Tags kept (changesets). A host will exist, so `/r/v<semver>/` snapshots are adopted. `params.version` stays rejected, now with evidence (static hosts ignore it) [verified]. |
| #5 Keep `cn@~0.5.2` and `"cn"` imports | **Kept** | Dry-runs list `cn@~0.5.2`; shadcn's own generator also adds `cn` when a file imports `"cn"` (build-registry.mts L1411-L1428). |
| #6 Derive ranges from `package.json` | **Kept** | Q7. |
| #7 Style item via `css` where allowed; `registry:file` for `@utility`/`@custom-variant` | **Superseded** | The CLI can carry those in `css` [verified]; the better options are the npm `@import` item or a converter, with caveats (Q6). The prior Step 3 statement that `cssVars`/`css` cannot carry `@utility`/`@custom-variant` is wrong. |
| #8 Add install smoke tests (dry-run, fixture) | **Kept, expanded** | Q7 item 8 and CI gates below. |
| #9 Do not submit to the directory | **Superseded** | User pivot. Submission steps and gates in Q3. |
| #10 Consumer docs | **Modified** | New text: `shadcn add @earth/<item>` (auto-adds the namespace once listed), pin via URL, update via `--diff` then `--overwrite`; a bare `button` is the official shadcn item. |
| Rejected: versioned `/r/v1/` paths ("needs hosting that does not exist") | **Superseded** | Hosting is now part of the plan. |
| Rejected: `params.version` | **Kept** | Stronger evidence. |
| Rejected: mixing GitHub dependencies with a hosted namespace | **Kept** | Consistent with all-`@earth/` dependencies. |
| Rejected: bare same-registry names, `@/lib/utils` lib item, removing ranges, request-time derivation | **Kept** | Unchanged by this research (bare names re-verified, Q6). |
| Health note ("monitoring applies only to listed registries; experimental") | **Kept** | Now directly relevant; code detail in Q3. |

## Recommended architecture for earth-ui

1. **Authoring format.** `src/` stays the single source. Item list derived from `src/components/*.tsx`, `src/hooks/*`, `src/lib/*` (stash's explicit `registry/registry-*.ts` kept only for authored metadata: title, description, categories, `meta.links`, extra files such as a lib riding with a hook). Generator fails on: missing title/description, unlisted `src` file, unresolved alias, cycle, dependency not in `package.json`.
2. **Generator.** Keep `scripts/build-registry.mts` + `derive-deps.mts` (Node type stripping, tested). Changes: `@earth/` dependency form, registry `name: "earth"`, auto `@earth/style` dependency for `registry:ui`, style item from the npm `@import` (fallback: postcss converter). Output `registry.json` (committed), then `shadcn build` -> `public/r/` (gitignored).
3. **Hosting.** GitHub Pages, `https://asif-sirajudeen.github.io/earth-ui/r/{name}.json` (or a custom domain decided before the directory PR). Static files; `/r/` latest and `/r/v<semver>/` immutable snapshots accumulated on a `gh-pages` branch by a job in `release.yml` that runs after npm publish.
4. **Versioning.** One version (changesets) for npm and registry snapshot. Pin by URL path or `${EARTH_VERSION}`; never `params.version`. Optional `meta.version` per item.
5. **Directory submission.** After the first deploy is live and the pre-PR checklist (Q3) passes: PR `feat(registry): add @earth to the registry directory` with signed commits, one object appended to `apps/v4/registry/directory.json`, `validate:registries` run locally.
6. **CI gates.**
   - PR (`ci.yml`): `pnpm test` (helpers + registry rules: schema via `shadcn/schema`, flat index, no `content`, titles present, all `@earth/` deps exist, no cycles, orphan check); `registry:check` drift; `shadcn registry validate`; `shadcn build`; local static server + one batched `add @earth/<all items> --dry-run` in the health-style fixture; typecheck.
   - Release (`release.yml` after publish): rebuild, write `r/` and `r/v<ver>/` (fail if the version dir exists), deploy, then post-deploy checks by `curl`: `/r/registry.json` JSON media type, HTTPS, name == `earth`, no duplicate names, and `add @earth/button --dry-run` against the live URL (`registry validate` accepts paths and GitHub sources, not URLs).
   - Release only (slow): real install of a sample into a Next and a Vite fixture, then `tsc --noEmit`, `next build`/`vite build`.

### Decision matrix (rejected alternatives)

| Alternative | Rejected because |
|---|---|
| GitHub address only (prior #1) | User wants directory listing and `@earth`; no health/ranking exposure; `#ref` pins do not propagate to dependencies. |
| `raw.githubusercontent.com` as host | `text/plain`; listed raw entries score below 10 on hygiene [verified]; serves unreleased branch state. |
| Route handler (Next/Vercel) | No dynamic need; adds server, cost, cold starts; @ai-elements (route-based) is degraded, cause unknown. |
| Cloudflare/Netlify/Vercel static | Viable but adds an account and bot-challenge risk for no gain over Pages; revisit if a custom domain with headers is required. |
| `params.version` pinning | Silent no-op on static hosts [verified]. |
| `${VAR:-default}` in URLs | Not implemented by the CLI [verified]. |
| Absolute-URL internal dependencies (materialcn) | Always latest, so a pinned install mixes versions; `@earth/x` follows the consumer's pinned URL [verified]. Only advantage: direct-URL install before listing. |
| Bare `registryDependencies` for UI built-ins | Resolve by consumer style (Radix for Radix projects) [verified]. |
| `registry:file` copy of `styles.css` | Consumer must add the `@import` by hand; no idempotent update path. |
| Converter-based `css` for the full stylesheet | Works [verified] but overwrites overlapping tokens, is not idempotent for nested at-rules, drops comments. Fallback only. |
| Latest-only with no snapshots | Peers do this, but no reproducible new-project installs and no `--diff` between releases from the host. Snapshots cost ~0.3 MB per release. |
| Per-tag rebuild of old snapshots | Old tags lack the build scripts; accumulate on a branch instead. |
| Build `__index__.tsx` lazy map | No consumer without a docs site ([coss-registry-lazy-loading.md](coss-registry-lazy-loading.md)). |
| Starter `registry-template` | Stale (shadcn ^3, Radix), no CI, hand-authored. |

## Unverified items

- `shadcn init @earth/<style|base>` and `registry:base` flow: read in docs/source only, not run.
- Removal of a token on re-add of a `css`/`cssVars` item (does the consumer's file lose it): not tested.
- Real (non-dry-run) installs of earth-ui components into a Next/Vite app, followed by typecheck/build: not run. Only dry-runs, a real add of a few fixture items, and a Tailwind compile of the CSS.
- The health monitor itself was read, not run. The dry-run fixture was replicated by hand.
- No deploy to GitHub Pages was performed: Pages enablement permissions, branch-vs-Actions source behavior for the accumulating `gh-pages` flow, and that GITHUB_TOKEN-pushed tags do not trigger workflows (GitHub behavior) are not verified here.
- Whether the changesets setup in `release.yml` creates GitHub releases or only tags; not checked.
- Cloudflare Pages / Netlify / Vercel response headers and bot-challenge behavior: not fetched.
- `raw.githubusercontent.com` rate limits: not verified.
- Open PRs in shadcn-ui/ui claiming `@earth`: not checked (only merged directory data).
- Selection of peers used a description regex over 45 entries; the other ~40 were not reviewed. @coss details reuse the prior notes at the same SHA plus a re-read of its generator and workflows; @basecn and @materialcn were read through `gh api` at the pinned SHAs, not cloned.
- `registry-template` `public/r` contents and whether any route handler exists (tree listing excluded `public/`).
- Compatibility of `@earth` with CLI versions older than 4.x; only 4.23.0 was tested.
- Cause of the leading-comment stripping and quote normalization seen on write.

## Open questions for the user

1. Namespace vs registry name: use `@earth` with `registry.json` `name: "earth"` (recommended; matches the directory name check) or `@earth-ui` to match the repo/package name?
2. Host and URL: GitHub Pages at `asif-sirajudeen.github.io/earth-ui` now, or a company domain (CNAME to Pages) before the directory PR? The URL is persisted into consumers' `components.json` and cannot move without a new directory PR.
3. Is the repo staying under the personal account `asif-sirajudeen`, or moving to an organization? A move changes the Pages URL and the npm trusted-publisher config.
4. CSS delivery: npm `@import` of `@asif-sirajudeen/earth-ui/styles.css` (one stylesheet, runtime CSS dependency) or fully copied styles (converter route, caveats in Q6)?
5. Should every `registry:ui` item depend on `@earth/style`, so a single `add @earth/button` always yields a working component?
6. Snapshot retention: keep every `/r/v<semver>/` forever (about 0.3 MB each) or only the latest N?
7. Is a docs/preview site planned? It changes the host decision and re-opens the `__index__` question.
8. Directory entry content: description, `author`, and an SVG `logo` (required by the schema).
