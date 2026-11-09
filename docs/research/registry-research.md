# Research: shadcn registry distribution model for earth-ui

As of: 2026-11-09

Scope: verify three suspected defects in the generated `registry.json`, then study how eight public registries distribute code, so earth-ui can pick a distribution, versioning and update model.

Convention: this file lives in `docs/research/`, next to the other research notes. `docs/` has only `research/` and `specs/`, so `docs/registry-research.md` was not used.

Source key (used in links below):

- `UI@8ab2771` = [shadcn-ui/ui at commit 8ab27715](https://github.com/shadcn-ui/ui/tree/8ab27715521cbd4f87ae6886cd989cbb678f6de7), committed 2026-11-08.
- `CLI` = the `shadcn` package, v4.23.0 in this repo (`node_modules/shadcn/package.json`), whose registry code is `@shadcn/registry` 0.2.1 (`node_modules/shadcn/package.json` L101). Its source is `packages/registry/src` in the repo above. `packages/shadcn/src/registry/index.ts` is only `export * from "@shadcn/registry"`.
- Registry items fetched live on 2026-11-09 are cited by URL.

## Summary

| # | Checklist item | Finding |
|---|---|---|
| 0 | npm vs registry vs both | earth-ui is both: an npm package plus a registry that points at the same `src/`. The studied registries are mostly registry-only. Two ship a companion npm CLI wrapper (`ai-elements`, `kibo-ui`). None ships its components as the npm package. |
| 1 | Source of truth | In earth-ui, `src/components/*.tsx` is the source. `registry/*.ts` holds authored metadata and `scripts/derive-deps.mts` derives deps. Studied registries keep a `registry.json` or TS index next to the source and generate `public/r/*.json` from it. |
| 2 | Taxonomy | Here: 64 `registry:ui`, 2 `registry:hook`, 1 `registry:style`. Peers use `registry:ui` plus `lib`, `style`, `font`, `block`, `example`. `registry:font` is valid (1c). |
| 3 | Dependencies | `cn@~0.5.2` is correct and matches upstream shadcn (1a). `asif-sirajudeen/earth-ui/<name>` is the valid GitHub form (1b). Peers almost never pin npm versions. earth-ui pins ranges, which is stricter than the norm. |
| 4 | Tokens and theming | earth-ui ships tokens as one `registry:style` item that writes `~/styles/earth-ui.css`. @coss ships `cssVars` and `css` on style items and uses `--alpha()`. @basecn relies on the consumer's shadcn tokens. |
| 5 | Build and publish | earth-ui: `pnpm registry` then `shadcn build` to the gitignored `public/r`. No hosting. Peers host `public/r` on a site, or serve it from a route. The GitHub address needs no build at all. |
| 6 | Versioning | The item schema has no version field. Real options are git refs (`#v0.2.2`), a path, or a namespace `params.version`. Nothing is versioned today. |
| 7 | Consumer updates | No `shadcn update`. Use `add <item> --diff`, then `add <item> --overwrite`. Files are copied, so local edits conflict. |
| 8 | Access control | Public repo, so none is needed. If private: a `gh` login or `GH_TOKEN` for GitHub addresses, or `headers` with `${ENV}` for a namespace. |
| 9 | Quality gates | CI runs `pnpm test`, `registry:check`, and `registry` (validate + build). Missing: an install smoke test. |
| 10 | Consumer contract | The CLI rewrites `@/components`, `@/lib`, `@/hooks`, `@/lib/utils` to the consumer's aliases. It leaves bare imports such as `"cn"` alone. It strips `"use client"` only when `rsc` is false. |
| 11 | Docs and discovery | The directory needs a hosted `registry.json` and `/{name}.json`, and is for `@namespace` registries only. A GitHub address needs no listing. |
| 12 | Governance | Directory listing is by PR to shadcn-ui/ui. Health monitoring applies only to listed registries. Item names and tags are the only contract. |

## Step 1: verification

### 1a. `cn@~0.5.2` in `dependencies`

Verdict: correct. It is not a bug in `derive-deps.mts`. It reproduces what upstream shadcn now ships.

Why it appears:

- `src/components/accordion.tsx` L2 is `import { cn } from "cn"`. It is a bare npm import, not `@/lib/utils`.
- `deriveDeps` in `scripts/derive-deps.mts` handles an import in three ways. An `@/(components|hooks|lib)/...` import becomes a registry dependency or an error. Anything else goes through `topLevelPackage`, then looks up a range in `{...peerDependencies, ...dependencies}` of `package.json`. `react`, `react-dom` and `tailwindcss` are skipped.
- `package.json` L88 has `"cn": "~0.5.2"`, so the output is `cn@~0.5.2`. Installed `node_modules/cn/package.json` is v0.5.2, described as "compiled class-name merging for Tailwind CSS. Drop-in replacement for clsx + tailwind-merge".

Why it is not wrong:

- The official base-nova button item fetched today has `"dependencies": ["cn"]` and `import { cn } from "cn"` ([button.json](https://ui.shadcn.com/r/styles/base-nova/button.json)).
- Upstream base-nova `utils` is a `registry:lib` whose whole content is `export { cn } from "cn"` ([utils.json](https://ui.shadcn.com/r/styles/base-nova/utils.json)). The `style` item lists `"utils"` in `registryDependencies` ([registry.json](https://ui.shadcn.com/r/styles/base-nova/registry.json)).
- The CLI never rewrites a bare specifier. [`transform-import.ts` L200](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/registry/src/transformers/transform-import.ts#L200) returns it unchanged when it does not start with `@/`. The consumer therefore gets the `cn` package installed, and no `@/lib/utils` is needed.

Does `@/lib/utils` ship as a `registry:lib` item? No. `src/lib/` holds only `highlighter.tsx`. No file under `src/` imports `@/lib/utils` (`grep -rn "lib/utils" src` is empty). `registry.json` has no `registry:lib` item. The only `src/lib` file is bundled inside the `use-highlighted-code` hook item. The brief said there is 1 `registry:lib` and 1 `registry:file`. The current `registry.json` has neither (see "Discrepancies").

Residual risks (inference):

- Mixing: a consumer who also uses coss, basecn or magicui gets two `cn` implementations, one from `"cn"` and one from `@/lib/utils`. Both work. The classes they merge can differ in edge cases.
- Pinning: earth-ui pins `~0.5.2` on a 0.x package. Upstream lists bare `"cn"`, which resolves to latest. A tilde pin on 0.x prevents silent minor bumps but can clash with a consumer's own `cn` range.
- Decision: keep it. Re-check against upstream on every base-nova sync.

### 1b. `registryDependencies: "asif-sirajudeen/earth-ui/button"`

Verdict: valid in this CLI. It is the GitHub item address `owner/repo/item`. It does not mean a same-registry bare name.

Evidence:

- Official docs, [registry-item-json.mdx L162-L191](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/registry-item-json.mdx#L162-L191), list five accepted forms:
  - bare name (`button`), meaning the built-in shadcn item;
  - `@namespace/item`;
  - `owner/repo/item` (`acme/ui/button`), with `#v1.2.0` recommended for published registries;
  - a URL;
  - a local file path.
- The same page, L184-L186: "`button` means the built-in shadcn `button` item, not an item from the same GitHub repository. For same-repository GitHub dependencies, use the full GitHub item address." See also the [FAQ](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/faq.mdx#L79).
- Resolver: [`resolveItemAddress`](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/registry/src/registry/address.ts#L45) tries, in order: URL, local `.json` file, `@ns/item` (regex at [`parser.ts` L2](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/registry/src/registry/parser.ts#L2)), then [`resolveGitHubItemAddress` L124](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/registry/src/registry/address.ts#L124): at least 3 slash-separated segments, a valid owner and repo, and the rest is the item name. Anything else is a `shadcn` bare name. `resolveDependenciesRecursively` in `resolver.ts` has a dedicated branch for the `github` scheme.
- Installed CLI: `@shadcn/registry` 0.2.1 in this repo already contains the GitHub code (`grep github` hits its `dist` chunks). UNVERIFIED: no live `shadcn add asif-sirajudeen/earth-ui/<item>` was run. Run it as the smoke test in Step 4.

What this means for earth-ui:

- The form works only when the repo is public (it is: `gh repo view` reports PUBLIC) and the root `registry.json` is on the default branch. The file is untracked today (`git ls-files registry.json` is empty), so no consumer can resolve it yet. See [github.mdx "Requirements"](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/github.mdx).
- Without `#ref`, each dependency resolves to the default branch HEAD, and refs are not inherited ([github.mdx "Dependency refs"](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/github.mdx)). A consumer who installs `.../accordion#v0.2.2` would still get `button` from `main`. Fix: stamp `#v<version>` into every same-repo dependency at release time (recommendation, not tested).
- Mixed provenance: if consumers install through a hosted URL or `@earth` namespace, these dependencies still resolve through GitHub, not through that host. Choose one distribution path (see recommendations).
- Correct forms for earth-ui, by distribution path:
  - GitHub address: `asif-sirajudeen/earth-ui/button#v0.2.2`.
  - Namespace: `@earth/button`, with `@earth` configured by the consumer.
  - URL: an absolute `https://.../r/button.json`.
  - A bare `button` is wrong for any of these: it resolves to the official shadcn button.

### 1c. `registry:font`

Verdict: valid.

- Schema, [registry-item.json](https://ui.shadcn.com/schema/registry-item.json): the `type` enum includes `registry:font`. Required: `name`, `type`, `font`. `font` requires `family`, `provider` (only `"google"`), `import`, `variable`. Optional: `weight`, `subsets`, `selector`, `dependency` (npm package for non-Next projects).
- Installed package: `node_modules/shadcn/dist/schema/index.d.ts` L32 lists `"registry:font"` in the union, and L84 has a `type: "registry:font"` variant. `registry:page` and `registry:file` are accepted too. The `resolver.ts` L357 filters items of this type into `fonts`.
- In use: @shadcn ships 52 and @coss ships 3. Example: [@shadcn font-geist](https://ui.shadcn.com/r/styles/base-nova/registry.json), [@coss font-sans](https://coss.com/ui/r/registry.json).
- earth-ui uses none today. Fonts are not needed unless the style item should install one.

### Discrepancies in the brief

- `registry.json` in the working tree has 67 items: 64 `registry:ui`, 2 `registry:hook`, 1 `registry:style` (`python3` count over `items`). The brief said 136, 128 UI, and a `lib` and a `file`. The doubled count is consistent with counting each `"name"` twice, but this was not confirmed. Re-run `pnpm registry` and recount before relying on either figure.
- The `style` item's file is typed `registry:file` with `target: "~/styles/earth-ui.css"`. That may be the source of "1 file".

## Step 2: distribution model

### Options for versioning

| Option | How it works | Pros | Cons |
|---|---|---|---|
| Latest only | `main` or the deployed `/r/` is the only version. | Simplest. What @coss, @magicui and @basecn do (no version found). | A breaking change reaches every consumer at once. No reproducible installs. |
| Versioned path `/r/v1/...` | Publish each major under its own path. The consumer sets `url` to that path. | Plain static hosting. Works with `{name}`. | Needs hosting. Dependencies between items must point at the same path. Duplicates files per version. |
| `params.version` in a namespace | The consumer sets `"params": {"version": "v2"}` and the server reads `?version=v2`. | Documented ([namespace.mdx "Versioning"](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/namespace.mdx#L642)). Pins per project via `${ENV}`. | Requires a server that honors the param. Static hosts ignore it. |
| Git ref on a GitHub address | `owner/repo/item#v0.2.2` (tag, branch or full SHA). | No hosting. Free and immutable with a SHA. Docs recommend it for published registries. | Needs a release tag per version. Same-repo dependencies need explicit refs. |

Native versioning: none. The `type` and field list of [registry-item.json](https://ui.shadcn.com/schema/registry-item.json) has no `version` field: `name, type, description, title, author, dependencies, devDependencies, registryDependencies, files, tailwind, cssVars, css, envVars, meta, docs, categories, extends, style, iconLibrary, baseColor, theme, font`. `meta` is free-form. The namespace docs state that versioning is something the registry author implements with query parameters ([namespace.mdx L642-L704](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/namespace.mdx#L642)).

### Per-registry comparison

All "types" counts come from each registry's live index, fetched 2026-11-09. "No version found" means none was visible in the index, item JSON or build script I read. It does not prove none exists.

| | @shadcn | @basecn | @coss | @supabase | @clerk | @ai-elements | @magicui | @kibo-ui |
|---|---|---|---|---|---|---|---|---|
| URL scheme | `ui.shadcn.com/r/styles/{style}/{name}.json` (built in, [constants.ts L44](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/registry/src/registry/constants.ts#L44)) | `basecn.dev/r/{name}.json` | `coss.com/ui/r/{name}.json` | `supabase.com/ui/r/{name}.json` | `clerk.com/r/{name}.json` | `ai-sdk.dev/elements/api/registry/{name}.json` | `magicui.design/r/{name}` (no `.json`) | `www.kibo-ui.com/r/{name}.json` |
| Directory entry | Built in | [registries.json](https://ui.shadcn.com/r/registries.json), 56 items | Listed, 607 items | Listed, 67 | Listed, 12 | Listed, 141 (health: degraded, dry-run failures) | Listed, 260 | Listed, 41 |
| Hosting | shadcn-ui/ui `apps/v4` | Site; `public/r/registry.json` committed in [akash3444/basecn](https://github.com/akash3444/basecn) | Site; `public/r` committed in [cosscom/ui](https://github.com/cosscom/ui) `apps/ui` | Site; `public/r` committed in [supabase/supabase](https://github.com/supabase/supabase) `apps/ui-library` | Site; repo not located (UNVERIFIED) | Next.js API route `apps/docs/app/api/registry/[component]/route.ts` in [vercel/ai-elements](https://github.com/vercel/ai-elements), built per request | Site; `apps/www/public/r` committed in [magicuidesign/magicui](https://github.com/magicuidesign/magicui) | Route `apps/docs/app/r/registry.json/route.ts` in [shadcnblocks/kibo](https://github.com/shadcnblocks/kibo) |
| Item types | style, ui, example, lib, component, block, hook, font (221 items) | ui 55, item 1 | ui 59, block 531, style 2, font 3, lib 9, hook 3 | block 28, component 31, lib 7, item 1 | component 3, page 4, block 4, file 1 | component 49, block 92 | ui 79, example 179, style 1, lib 1 | ui 40, style 1 |
| npm deps declared | Bare names, e.g. `"cn"` | Bare, e.g. `@base-ui/react` | Bare | Mostly `@latest`, e.g. `@supabase/ssr@latest` | Bare, e.g. `@clerk/nextjs` | Bare; derived at request time from `packages/elements/package.json` | Bare | Bare |
| registryDependencies | Bare (602) | `@basecn/x` (24) plus bare `skeleton` (2, resolves to official shadcn) | `@coss/x` (1206), 1 bare | Bare (107) plus 13 absolute URLs | `@clerk/x` (13) plus bare (12) | None in the index; item JSON uses bare `button` (official) | `@magicui/x` (188) plus bare (27) | Bare (45), e.g. `badge` |
| Versioning | None in the item. CLI is versioned on npm. | No version found | No version found | No version found | No version found | npm `ai-elements` CLI is 1.9.1 ([npm](https://www.npmjs.com/package/ai-elements)); items unversioned | No version found | npm `kibo-ui` CLI 1.1.5 ([npm](https://www.npmjs.com/package/kibo-ui)); items unversioned |
| npm package relation | `shadcn` is the CLI, separate from items | None. npm `basecn` was unpublished 2026-02-18 (`npm view basecn`) | None. `@coss/ui` is not on npm (404). Components re-export Base UI via `@coss/ui/components/*` paths ([docs](https://coss.com/ui/docs/get-started)) | None found | Items depend on `@clerk/nextjs`, `@clerk/ui` (runtime SDK stays on npm) | Wrapper CLI `ai-elements` (`packages/cli`) | `@magicui/cli` is not on npm (404) | Wrapper CLI `kibo-ui` |
| Update story | Re-run `add --overwrite` or `--diff` | Same (UNVERIFIED: no changelog read) | Docs point to Changelog and Roadmap; UNVERIFIED beyond that | UNVERIFIED | UNVERIFIED | CLI wrapper; UNVERIFIED beyond that | UNVERIFIED | CLI wrapper; UNVERIFIED beyond that |

Observations that matter for earth-ui:

- Unpinned npm deps are the norm (about 95% of entries in the seven non-Supabase registries). Supabase writes `@latest` explicitly. earth-ui writes tilde and caret ranges. That gives reproducibility at the price of possible conflicts with a consumer's own versions.
- The catalog sizes differ by two orders of magnitude, but the contract is the same everywhere: a flat `registry.json` index plus one `{name}.json` per item with inlined `content`.
- None of the eight published a versioned path, and none used `params.version`. All eight are "latest only". UNVERIFIED for @clerk (repo not found).
- @ai-elements derives dependencies from `package.json` at request time, like earth-ui's `derive-deps.mts`. Its derivation drops the version ranges.
- @basecn and @clerk mix bare names with namespaced names. A bare name there resolves to the official shadcn item, not their own, which is a possible source of mismatched variants (inference from the CLI behavior in 1b).
- @coss `apps/ui/scripts/validate-registry-deps.mts` checks that every import maps to a declared `@coss/*` dependency ([source](https://github.com/cosscom/ui/blob/HEAD/apps/ui/scripts/validate-registry-deps.mts)). earth-ui's `derive-deps.mts` throws on the same condition instead.
- An item's `meta`, `categories` and `docs` are the only places to add a human version. @shadcn uses `meta.links`.

## Step 3: consumer contract

What the CLI does on `add` (read from `packages/registry/src`):

- Files: `updaters/update-files.ts` L184-L196 runs these transformers on each file, in order: `transformImport`, `transformRsc`, `transformCssVars`, `transformTwPrefixes`, `transformIcons`, `transformMenu`, `transformAsChild`, `transformRtl`, `transformNext` (Next only), `transformFont`, `transformCleanup`. Items typed `registry:file` or `registry:item` skip transformers.
- Imports: [`transform-import.ts`](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/registry/src/transformers/transform-import.ts#L195-L290) maps `@/lib/utils` to `aliases.utils`, `@/components/ui` to `aliases.ui`, `@/components`, `@/hooks`, `@/lib` to their aliases, and `@/registry/<style>/...` the same way. Bare npm specifiers such as `"cn"` and `"@base-ui/react/accordion"` are not touched.
- `"use client"`: [`transform-rsc.ts`](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/registry/src/transformers/transform-rsc.ts) removes the directive only when `config.rsc` is false. With `rsc: true` (earth-ui's own `components.json`) it is kept. The file notes a known regex bug (`/g` flag) that can leave the directive in some files.
- Tailwind v4 and tokens: `resolver.ts` L312-L350 sorts `registry:theme` first, then deep-merges `tailwind`, `cssVars`, `css`, `envVars`, `docs` across the dependency tree. `updaters/update-css-vars.ts` writes `light` to `:root`, other keys to `.<key>`, and `theme` to `@theme`. It only overwrites existing variables when `overwriteCssVars` is true (L316). `css` entries (at-rules, `@layer`, `@keyframes`) go through `update-css.ts`.
- Dependencies: `update-dependencies.ts` installs `dependencies` and `devDependencies` with the consumer's package manager, using the versions as written.
- Fonts: items of type `registry:font` are collected and handled by `update-fonts.ts` and `transform-font.ts`.

How same-stack registries use that contract (live items, fetched 2026-11-09):

| Aspect | @basecn | @coss | earth-ui today |
|---|---|---|---|
| Alias imports | `@/lib/utils` in source ([button.json](https://basecn.dev/r/button.json)); no `utils` item shipped | Relative registry paths; `registryDependencies: ["@coss/spinner"]` ([button.json](https://coss.com/ui/r/button.json)) | `@/components/<name>` for internal imports; `"cn"` for the merge helper; derived into `registryDependencies` |
| cssVars | One item with `cssVars` (1 of 56) | 11 items; `@coss/style` writes full light and dark palettes, sidebar vars and `--alpha()` / `color-mix()` values; adds `--info`, `--success`, `--warning` and `-foreground` tokens | One `registry:style` item that targets `~/styles/earth-ui.css` and carries tw-animate-css |
| Style layer | None. Consumer must already be on shadcn tokens. | `shadcn init @coss/style` or `add @coss/style`; also installs `@coss/fonts` and wires `layout.tsx` ([docs](https://coss.com/ui/docs/get-started)) | A copied CSS file the consumer must import. The CLI cannot do `@utility` or `@custom-variant` through `cssVars`/`css` (comment at `registry/registry-styles.ts` L4). |
| Tailwind v4 | Not stated (UNVERIFIED) | Required: "Our components are built with Tailwind CSS v4" | Required; consumer's `components.json` has `tailwind.config` empty for v4 (UNVERIFIED: not read) |
| `"use client"` | UNVERIFIED | Present at top of `button.tsx` | 40 of 64 component files carry it; 24 do not. Upstream accordion also lacks it. |
| Base UI dependency | `@base-ui/react` in `dependencies` | `@base-ui/react` in `dependencies`; also re-exported through `@coss/ui/base-ui/*` | `@base-ui/react@^1.9.0` |

Consumer-contract gaps in earth-ui (inference):

- If earth-ui ships a hand-written CSS file as `registry:file`, the CLI will not add `@import`. The consumer must. Document it, or use `css` with `@import` entries as upstream does (`"@import \"tw-animate-css\""` in [the base-nova style item](https://ui.shadcn.com/r/styles/base-nova/registry.json)).
- `rsc` is read from the consumer's `components.json`. Keep `"use client"` in source for every file that uses state or effects, because a consumer with `rsc: true` keeps what the source has.

## Step 4: operations

### `add --diff` and the update story

- [`add.ts` L75](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/shadcn/src/commands/add.ts#L75) declares `--diff [path]`. [L87](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/shadcn/src/commands/add.ts#L87) sets `isDryRun = dryRun || diff || view`. L305-L325 runs `dryRunComponents`, prints `formatDryRunResult` and returns without writing. So `--diff` resolves the item and its dependencies, applies the same transformers, and compares against existing files, with no writes.
- The separate `diff` command is marked "[DEPRECATED] Use `add [component] --diff` instead" ([diff.ts L43](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/shadcn/src/commands/diff.ts#L43)).
- Without `--overwrite`, existing files prompt for confirmation ([update-files.ts L226-L245](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/registry/src/updaters/update-files.ts#L226)). Identical files are skipped (`isContentSame`, ignoring import differences in workspaces).
- There is no `update` or `upgrade` command for items (none in `packages/shadcn/src/commands/`). The update story is: run `add <item> --diff`, review, then `add <item> --overwrite`, or merge by hand. The consumer owns the copied file.
- Pinning by ref (`#v0.2.2`) makes `--diff` meaningful, because the consumer can diff between two tags. With a floating default branch, the diff is against whatever `main` is today.

### Listing in registries.json (submission) and MCP

- Process, [registry-index.mdx L16-L24](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/registry-index.mdx#L16): add an entry to `apps/v4/registry/directory.json`, run `pnpm validate:registries`, open a PR to shadcn-ui/ui. After merge it is published immediately.
- Requirements (L26-L33): open source and public; valid against the registry schema; flat layout with `/registry.json` and `/<name>.json` at the registry root; the `files` array in the index must not carry `content`.
- A GitHub registry does not need a directory entry. The docs say: "You do not need to submit a public GitHub registry to the registry directory to use it with `owner/repo/item` addresses. The registry directory is for namespaces such as `@acme`" (L12).
- Health: monitoring applies only to listed registries, not to GitHub addresses ([health.mdx](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/health.mdx)). It runs hourly index checks, daily item samples and a weekly `add --dry-run`. It is marked experimental.
- MCP: [mcp.mdx](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/mcp.mdx) says the MCP server works with any shadcn-compatible registry and reads `registry.json` at the registry root (`https://acme.com/r/registry.json`). The consumer adds the namespace to `components.json` and runs `npx shadcn@latest mcp init --client <client>`. UNVERIFIED: whether the MCP server can browse a GitHub-address registry. The doc only describes namespaces. The CLI itself has `list`, `search` and `view` for GitHub addresses ([github.mdx](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/github.mdx)).

### Private registry authentication

- GitHub addresses ([github.mdx "Private repositories"](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/github.mdx)): the CLI tries anonymous first. If the root `registry.json` is not publicly readable it uses `gh` credentials (`gh auth login`), or `GH_TOKEN` / `GITHUB_TOKEN` in CI. A fine-grained token with Contents: read-only is recommended, and the token is only sent to `api.github.com`. The built-in `GITHUB_TOKEN` in Actions reads only the workflow's own repo. GitHub Enterprise is not supported. Source files are limited to 5 MiB.
- Namespaced registries ([authentication.mdx](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/authentication.mdx)): `components.json` takes `url` with `{name}`, plus `headers` (for example `Authorization: Bearer ${REGISTRY_TOKEN}`) and `params`. `${VAR}` is expanded from `process.env`. The registry server must verify the token and return 401 or 403. Never commit tokens.
- Consumers' CLI never prints the token. earth-ui is public, so none of this applies today.

### Recommended CI smoke tests

Current CI (`.github/workflows/ci.yml`) runs `pnpm test`, `pnpm registry:check` and `pnpm registry` (build + `shadcn registry validate` + `shadcn build`). Add, in this order of value:

1. Index validation: `shadcn registry validate` (already included). For a GitHub address, `npx shadcn@latest registry validate <owner>/<repo>[#ref]` per [github.mdx Step 3](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/github.mdx).
2. Dependency resolution: `npx shadcn@latest add <owner>/<repo>/<item>#<sha> --dry-run` for one leaf item and for the most connected item. This is the same check the shadcn Health job runs weekly.
3. Real install in a fixture app: create a minimal Next.js and Vite app with Tailwind v4 and `components.json`, run `add` for a sample of items, then `tsc --noEmit` and `build`. Catches alias rewrites, missing `"use client"`, and a missing `cn`.
4. Full matrix on release only: install every item (67 today) into one fixture and typecheck. It is slow, so keep it off the PR path.
5. Drift guard: keep `registry:check` (it already fails if `registry.json` is stale).
6. Optional diff check: `add <item> --diff` between the previous tag and the new one, to list what consumers will see. UNVERIFIED as a gate; useful as a release note input.

## Recommended decisions

1. Distribution path: use the GitHub address (`asif-sirajudeen/earth-ui/<item>`) as the primary and only path for now. It needs no hosting, matches how the repo is already laid out, and is the documented use case ([github.mdx "When to use GitHub"](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/github.mdx)). Add a hosted `@earth` namespace later only if a server, headers, or directory listing is needed.
2. Commit `registry.json` to `main` (it is untracked) and keep `registry:check` in CI. Without this, no consumer install works.
3. Keep `registryDependencies` as `asif-sirajudeen/earth-ui/<name>`, but have the build stamp `#v<package.json version>` onto every entry at release time. This makes a tagged install self-consistent. Keep the unstamped form on `main`. This is a design proposal; it was not tested.
4. Versioning: git tags that match the npm version (v0.2.1 and v0.2.2 already exist). Document "install with `#<tag>`, track `main` at your own risk". Reject `/r/v1/` paths and `params.version` until a host exists.
5. Keep `cn@~0.5.2` and `"cn"` imports as they are. Do not add a `registry:lib` for `@/lib/utils`. Re-check upstream `base-nova` on each sync. If upstream changes, update `derive-deps.mts` rather than hand-editing `registry.json`.
6. Keep deriving dependency ranges from `package.json`. This is stricter than peers, but it matches the npm package that CI already tests.
7. Style item: carry `tw-animate-css` and base tokens through `css` (with `@import` entries) where the CLI allows. Keep the `registry:file` copy only for `@utility` and `@custom-variant`, and document the one manual `@import` it needs.
8. Add the install smoke tests from Step 4 (items 2 and 3 first).
9. Do not submit to the shadcn directory yet. It requires a hosted flat registry, and listing adds the public health score. Revisit if a hosted namespace is added.
10. Consumer docs: one page that says install via `shadcn add asif-sirajudeen/earth-ui/<item>#<tag>`, review via `--diff`, update via `--overwrite`, and that a bare `button` always means the official shadcn item.

## Rejected options

- Same-registry bare names (`button`): resolve to the official shadcn item, not earth-ui ([registry-item-json.mdx L184](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/registry-item-json.mdx#L184)).
- Shipping `@/lib/utils` as a `registry:lib`: not needed, since no source file imports it and upstream moved to `"cn"`.
- Versioned `/r/v1/` paths: needs hosting that does not exist, and each version must repoint its own dependencies.
- `params.version`: needs a server that reads the query string. Static hosts ignore it.
- Latest-only with no tags: simplest, and what the peers do, but it gives consumers no stable install and no useful `--diff`.
- Removing version ranges from `dependencies` to match peers: loses the alignment with the tested npm package.
- Request-time derivation as @ai-elements does: adds a server for no gain; the build-time derivation already exists and is checked in CI.
- Mixing GitHub dependencies with a hosted namespace: an install through one path would pull dependencies through the other.

## Unverified items

- No live `shadcn add asif-sirajudeen/earth-ui/<item>` was run, because `registry.json` is not on `main`.
- @clerk: repository, update story, and `components.json` config were not found. The docs page does not describe them.
- @basecn: install docs page returned 404; Tailwind version and `"use client"` handling unchecked.
- @supabase, @magicui, @kibo-ui: update story, changelog and versioning not read beyond the index, one item, and the build script names.
- Whether the shadcn MCP server can browse GitHub-address registries.
- The exact text `shadcn add --diff` prints (`formatDryRunResult` in `packages/shadcn/src/utils/dry-run-formatter.ts` was not read).
- Item counts in the brief versus the current `registry.json` (67 found).
