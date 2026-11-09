# Research: can the earth-ui registry be the foundation for a docs site and a custom CLI?

As of: 2026-11-09

Scope: (A) a documentation site built from registry data, (B) a custom CLI. Both read-only research against primary sources. Prior notes in this folder are not repeated: `registry-research.md`, `registry-implementation-research.md`, `registry-plan-validation.md`, `coss-registry-lazy-loading.md` (preview index).

Claim tags: [source] read in code or docs, [verified] I ran it, [inferred] my reasoning.

## Source key

Shallow clones made 2026-11-09. Links use these SHAs.

| Short | Repo | SHA |
|---|---|---|
| `UI@8ab2771` | [shadcn-ui/ui](https://github.com/shadcn-ui/ui/tree/8ab27715521cbd4f87ae6886cd989cbb678f6de7) | `8ab27715521cbd4f87ae6886cd989cbb678f6de7` |
| `coss@fe6ffa8` | [origin-space/originui](https://github.com/origin-space/originui/tree/fe6ffa81f434a4afe1c01564c13bb237564c42e2) (@coss, `apps/ui`) | `fe6ffa81f434a4afe1c01564c13bb237564c42e2` |
| `basecn@346484e` | [akash3444/basecn](https://github.com/akash3444/basecn/tree/346484e1e9141462fdec072a831a568bdae1f29c) | `346484e1e9141462fdec072a831a568bdae1f29c` |
| `materialcn@2628445` | [guillermo-rebolledo/materialcn](https://github.com/guillermo-rebolledo/materialcn/tree/26284459f542e62645314726e2735ecffd58fa5d) | `26284459f542e62645314726e2735ecffd58fa5d` |
| `intentui@a9ee38b` | [intentui/intentui](https://github.com/intentui/intentui/tree/a9ee38b4cf134e3727630c2d664770edec18aa91) | `a9ee38b4cf134e3727630c2d664770edec18aa91` |
| `kibo@3d63cdb` | [haydenbleasel/kibo](https://github.com/haydenbleasel/kibo/tree/3d63cdb15b79d972e3dc38a10997987672f9b263) | `3d63cdb15b79d972e3dc38a10997987672f9b263` |
| `aie@ca8be60` | [vercel/ai-elements](https://github.com/vercel/ai-elements/tree/ca8be600bfd01b3131f9bf6134b51602a71f4374) | `ca8be600bfd01b3131f9bf6134b51602a71f4374` |
| `magicui@1ac985a` | [magicuidesign/magicui](https://github.com/magicuidesign/magicui/tree/1ac985adca3cdfab9b1739253fd14209687c4e9c) | `1ac985adca3cdfab9b1739253fd14209687c4e9c` |
| CLI | `shadcn` 4.23.0 in this repo (`node_modules/shadcn`), registry code in `@shadcn/registry` 0.2.1 | |

Namespace used below is `@earth-ui` (as in `README.md` and `registry.json` `name: "earth-ui"`). The earlier notes say `@earth`; that is superseded.

## TL;DR

| Question | Verdict | Effort | Smallest first step |
|---|---|---|---|
| A1. Can the registry feed a docs site? | **Yes, partly.** It can supply title, description, install command, dependencies, `registryDependencies`, and the source-code tab. It cannot supply demos, prose or props tables. No peer uses it as the only source: all hand-write title and description in MDX frontmatter. | Small | Add `site/` (Fumadocs on Next.js) that renders one page per item from `public/r/*.json`. |
| A2. Examples location | **Plain docs files first** (`site/examples/*.tsx`, shadcn's `examples/` pattern). Promote to `registry:example` items later if you want the shadcn MCP to find them. | Small now, medium later | Write 1 demo per component in `site/examples/`. |
| A3. Monorepo restructure? | **No.** Minimum is one extra workspace member, `site/`, plus `packages:` in `pnpm-workspace.yaml`. basecn and intentui are single-package Next apps. | Small | Add `site/package.json`; list it in `pnpm-workspace.yaml`. |
| A4. One deploy for site and `/r/*.json`? | **Yes.** Static export plus `shadcn build -o site/public/r`. materialcn already does this on GitHub Pages. | Small | One `pages.yml` workflow modelled on materialcn's `registry.yml`. |
| B. Custom CLI | **Not recommended now.** `npx shadcn@latest add @earth-ui/x` already does the job. A zero-config path needs the directory listing, which needs a stable host. Until then, one `shadcn registry add` line replaces the manual `components.json` edit. | None | Document `npx shadcn@latest registry add @earth-ui=<url>`. |
| B-fallback. If a wrapper is wanted anyway | Option 2, a ~20 line `spawnSync` wrapper (what kibo-ui ships). Not option 3. | Tiny | Defer until the host is fixed. |
| Does the directory listing make a CLI redundant? | **Yes, for install.** The CLI looks the namespace up in `registries.json` and writes it into `components.json` itself. A wrapper would only add branding. | n/a | Submit the directory PR after the host is final. |

## A. Documentation site

### A1. How shadcn and peers build docs from registry data

| Repo | Framework | Where title and description come from | Where install command comes from | Where source tab comes from |
|---|---|---|---|---|
| shadcn `apps/v4` | Next.js 16 + Fumadocs (`fumadocs-core`, `fumadocs-mdx`, `fumadocs-ui` 16.10.5; [package.json L69-L72](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/package.json#L69-L72)) | Hand-written MDX frontmatter ([accordion.mdx L1-L8](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/components/base/accordion.mdx#L1-L8)) [source] | Hand-written in MDX (`npx shadcn@latest add accordion`) [source] | `<ComponentSource name="accordion">` reads `item.files[0].content` from `getRegistryItem` ([component-source.tsx L38-L41](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/components/component-source.tsx#L38-L41)). That item is built from an `__index__` entry plus the file read from disk, not from `public/r` ([lib/registry.ts L142-L182](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/lib/registry.ts#L142-L182)) [source] |
| @coss `apps/ui` | Next.js 16 + Fumadocs (`fumadocs-core`, `fumadocs-mdx`; [package.json L13-L14](https://github.com/origin-space/originui/blob/fe6ffa81f434a4afe1c01564c13bb237564c42e2/apps/ui/package.json#L13-L14)) | Hand-written frontmatter [source] | Hand-written `npx shadcn@latest add @coss/accordion` [source] | `ComponentSource` reads `item.files[0].content` ([L31](https://github.com/origin-space/originui/blob/fe6ffa81f434a4afe1c01564c13bb237564c42e2/apps/ui/components/component-source.tsx#L31)) [source] |
| @basecn | Next.js 16 + Fumadocs, single package, no workspace ([package.json L10, L28-L33](https://github.com/akash3444/basecn/blob/346484e1e9141462fdec072a831a568bdae1f29c/package.json#L10)) | Hand-written frontmatter, plus a `links` field in the zod schema ([source.config.ts](https://github.com/akash3444/basecn/blob/346484e1e9141462fdec072a831a568bdae1f29c/source.config.ts)) [source] | `<CodeBlockCommand component="accordion" />` builds `pnpm dlx shadcn@latest add <name>` per package manager ([code-block-command.tsx](https://github.com/akash3444/basecn/blob/346484e1e9141462fdec072a831a568bdae1f29c/src/components/code-block-command.tsx)) [source] | n/a |
| @intentui | Next.js + Fumadocs, single package ([package.json L47](https://github.com/intentui/intentui/blob/a9ee38b4cf134e3727630c2d664770edec18aa91/package.json#L47)) | Hand-written MDX | `<PackageCommand command="npx shadcn@latest add @intentui/date-field"/>` in each MDX [source] | Prebuild step `extract-components-from-registry.ts` filters `registry.json` to `public/r/index.json` ([script](https://github.com/intentui/intentui/blob/a9ee38b4cf134e3727630c2d664770edec18aa91/src/scripts/extract-components-from-registry.ts)). This is the only peer I found that reads registry data into the docs build. [source] |
| @materialcn | Vite playground + Storybook, **no docs framework** ([package.json](https://github.com/guillermo-rebolledo/materialcn/blob/26284459f542e62645314726e2735ecffd58fa5d/package.json)) | n/a | README | n/a |

Preview rendering. Docs render live demos through a generated `__index__.tsx` (React.lazy map). That file is docs-only and never reaches `public/r` (covered in `coss-registry-lazy-loading.md`). `ComponentPreview name="..."` looks the demo up in that index ([shadcn component-preview.tsx L1-L50](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/components/component-preview.tsx#L1-L50)) [source]. earth-ui needs its own, but with 64 components a hand-listed or glob-based map in the docs app is enough [inferred].

Import display. shadcn post-processes the source before showing it, for example `code.replaceAll("@/registry/<style>/", "@/components/")` ([format-code.ts L84-L92](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/lib/format-code.ts#L84-L92)) [source]. earth-ui's `public/r/alert-dialog.json` content holds `import { Button } from "@/components/button"`. The CLI rewrites that to `@/components/ui/button` at add time [verified: `shadcn add @earth-ui/alert-dialog --dry-run --view` into a project with `ui: "@/components/ui"`]. So a source tab built from `public/r` shows a path the consumer will not get. Rewrite it in the docs component [inferred].

"Open in v0". shadcn builds the link as `${V0_URL}/chat/api/open?url=${APP_URL}/r/styles/<style>/<name>.json` ([open-in-v0-button.tsx L24](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/components/open-in-v0-button.tsx#L24)) [source]. The official docs say Open in v0 "does not support `cssVars`, `css`, `envVars`, namespaced registries" ([open-in-v0.mdx](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/open-in-v0.mdx)) [source]. Every earth-ui item has `registryDependencies: ["@earth-ui/style"]`, and that item has `cssVars` [verified: `public/r/accordion.json`, `style` item]. **Skip Open in v0.** Install-command blocks (npm/pnpm/yarn/bun tabs, as basecn does) are enough [inferred].

### A2. Can `registry.json` / `public/r/*.json` be the single source of truth?

What the data holds today [verified: node over `public/r/registry.json`]:

- 67 items: 64 `registry:ui`, 2 `registry:hook`, 1 `registry:style`. Index has no `content`; each item file does.
- Keys in use: `name, type, title, description, dependencies, devDependencies, registryDependencies, files, meta, cssVars, css`.
- `meta.links` (`docs`, `examples`, `api`) is present on 59 of 67 items; 8 have none. All `docs`/`examples` links point at `ui.shadcn.com` (placeholder from `registry/metadata.ts`).
- Total `public/r` size 380 KB.

| Docs need | In registry data? | Notes |
|---|---|---|
| Title, description | Yes (`title`, `description`) | Peers duplicate in frontmatter. For earth-ui, generating from the registry avoids drift, since `registry/metadata.ts` is already the hand-written source [inferred]. |
| Install command | Derivable | `npx shadcn@latest add @earth-ui/<name>`. Needs the namespace set up first (see B). |
| npm dependencies | Yes (`dependencies`, with versions derived by `scripts/derive-deps.mts`) | Peers hand-write `npm install @base-ui/react` in each MDX. Rendering it from the registry is strictly better. |
| Other items it pulls in | Yes (`registryDependencies`) | |
| Source code tab | Yes (`files[].content`) | Same data shadcn and coss show. Rewrite import aliases (above). |
| CSS tokens, `@earth-ui/style` | Yes (`cssVars`, `css`) | Good for one "Theming" page. |
| Demos, usage prose, props tables, a11y notes | **No** | Need MDX and example files. |
| Grouping, ordering, sidebar | **No** | The registry has no `categories` on items (basecn and coss add them; `registry:ui` items accept `categories` in the schema [inferred]). Use Fumadocs `meta.json`, or add a field in `registry/metadata.ts`. |
| Links to Base UI API docs | Partly (`meta.links.api`) | Keep. Replace the `docs` and `examples` links with the new site URLs. |

Programmatic read. `shadcn/registry` exports `getRegistryItems`. It works on the built local files [verified: `getRegistryItems(['./public/r/button.json'])` returned `name`, `title`, `files[0].content` as a string, `dependencies`, `registryDependencies`, `meta.links`]. `shadcn/schema` exports `registrySchema` and `registryItemSchema`, which shadcn's own docs use to parse items ([lib/registry.ts L167](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/lib/registry.ts#L167)) [source]. For the docs site, plain `JSON.parse` of `public/r/<name>.json` is simpler than either [inferred].

Design. One page route per item, backed by registry data, with optional hand-written MDX for prose [inferred]:

- `site/app/docs/components/[name]/page.tsx` reads `public/r/<name>.json` (header, install tabs, dependencies, source tab).
- If `site/content/components/<name>.mdx` exists, render it between the header and the source (Usage, Examples, props).
- Sidebar and index page come from `registry.json` `items` filtered by `type === "registry:ui"`.

The alternative is generating one MDX file per item at prebuild (intentui has `build-stubs.ts`, `generate-llms.ts` in `src/scripts`). That is simpler for Fumadocs search and `llms.txt`, but generated files are noise in git. Pick generated-and-gitignored [inferred].

### A3. Where examples should live

| Option | Peer evidence | Pros | Cons |
|---|---|---|---|
| Plain docs files (`site/examples/<name>-demo.tsx`) | shadcn `apps/v4/examples/base/accordion-demo.tsx`, indexed by a generated `examples/__index__.tsx` ([source](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/examples/__index__.tsx)). `https://ui.shadcn.com/r/styles/base-nova/accordion-demo.json` returns an HTML page, so demos are not served as registry items [verified: `curl`]. | Do not appear in `registry.json`; no health-monitor surface; no `registryDependencies` bookkeeping. | Not visible to the shadcn MCP or `shadcn add`. |
| `registry:example` items | shadcn also ships `accordion-example` as `registry:example` with `registryDependencies: [accordion, button, card, example]` ([registry/bases/base/examples/_registry.ts](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/registry/bases/base/examples/_registry.ts)); `https://ui.shadcn.com/r/styles/base-nova/accordion-example.json` returns 200 and type `registry:example` [verified]. | The shadcn MCP tool `get_item_examples_from_registries` searches registries for names like `accordion-demo` ([mcp/index.ts L335-L388](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/shadcn/src/mcp/index.ts#L335-L388)). So `registry:example` items are the only way an agent finds your examples [source]. | Each is an extra item to build, smoke-test and list. @coss does this at scale: 1061 `registry:block` "particles" in `apps/ui/registry.json` [verified: `grep -c`]. |
| Neither (basecn) | basecn keeps demos in `src/components/demo` and has 0 `registry:example` items [verified: `grep`]. | Cheapest. | Same limits as plain files. |

**Recommendation:** start with plain docs files. Add `registry:example` for a handful of flagship components only if AI-agent discovery matters. Keep the demo file name `<component>-demo.tsx` so the later promotion is mechanical [inferred].

One catch: demos import components. In the docs app, import from the source tree (`@/components/button` resolved to the repo's `src/components`) so demos run against the code being edited. The visible snippet should show the consumer path (`@/components/ui/button`). Do a string replace when rendering the snippet, as shadcn does [inferred].

### A4. Monorepo vs same repo: minimum layout

Facts about this repo [verified]:

- `package.json` `files` is `["dist", "styles.css"]`, so a `site/` folder never reaches the npm tarball.
- `pnpm-workspace.yaml` has only `minimumReleaseAgeExclude`; no `packages:` today.
- `docs/` already holds `research/` and `specs/`, so the site must live elsewhere. Use `site/`.
- The registry build reads `src/components/*.tsx` relative to the repo root and writes `public/r` (gitignored).
- `shadcn build` accepts `-o, --output <path>` ([verified: `shadcn build --help`]), so it can write straight into `site/public/r`.

How peers lay it out:

| Repo | Layout | Source |
|---|---|---|
| shadcn | pnpm workspace, `apps/*` + `packages/*` | [pnpm-workspace.yaml](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/pnpm-workspace.yaml) [source] |
| magicui | workspace, `apps/www` | [pnpm-workspace.yaml](https://github.com/magicuidesign/magicui/blob/1ac985adca3cdfab9b1739253fd14209687c4e9c/pnpm-workspace.yaml) [source] |
| kibo | workspace, `apps/docs` + `packages/*` | [pnpm-workspace.yaml](https://github.com/haydenbleasel/kibo/blob/3d63cdb15b79d972e3dc38a10997987672f9b263/pnpm-workspace.yaml) [source] |
| basecn | single package, Next app at root | [package.json](https://github.com/akash3444/basecn/blob/346484e1e9141462fdec072a831a568bdae1f29c/package.json) [source] |
| intentui | single package, Next app at root | [package.json](https://github.com/intentui/intentui/blob/a9ee38b4cf134e3727630c2d664770edec18aa91/package.json) [source] |
| materialcn | single package; Vite playground at root; Storybook | [package.json](https://github.com/guillermo-rebolledo/materialcn/blob/26284459f542e62645314726e2735ecffd58fa5d/package.json) [source] |

earth-ui cannot copy the basecn/intentui layout, because its root is the published library (`tsdown`, peer deps, `exports`). Putting Next.js and Fumadocs in the root `devDependencies` would drag the docs toolchain into the library's lockfile and typecheck [inferred]. So use one extra workspace member:

```
earth-ui/
  package.json             # library, unchanged
  pnpm-workspace.yaml      # + packages: ["site"]
  src/  registry/  scripts/
  site/                    # new
    package.json           # next, fumadocs-*, "@asif-sirajudeen/earth-ui": "workspace:*" only if demos use the package
    next.config.mjs        # output: "export", basePath for Pages
    content/               # optional hand-written MDX per component
    examples/              # <name>-demo.tsx
    app/
    public/r/              # generated by `shadcn build -o site/public/r`, gitignored
```

This is not a restructure: no file in `src/`, `scripts/` or `registry/` moves [inferred]. Cost to check before committing: the changesets release flow and the `registry-install` CI job assume a single package. Add `site` to the changesets `ignore` list [inferred, not read: `.changeset` config not inspected].

### A5. One deploy for site and `/r/*.json`

Yes. Order: `pnpm registry` (build `registry.json`, then `shadcn build -o site/public/r`), then `next build` with `output: "export"`, then upload `site/out`. Next copies `public/r/*` to `out/r/*`, so `https://<host>/r/<name>.json` and `/r/registry.json` resolve, which is what the directory health monitor requests ([monitor.ts](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/lib/registry-health/monitor.ts), per `registry-implementation-research.md` Q3) [source].

- Fumadocs supports static export: set `output: 'export'`; built-in search needs the static Orama configuration, or use a cloud search ([Fumadocs static build](https://www.fumadocs.dev/docs/deploying/static.mdx)) [source]. I did not run a build [not verified].
- materialcn already ships this shape on GitHub Pages: one workflow publishes the playground at the root and the registry under `/r` ([registry.yml L1-L58](https://github.com/guillermo-rebolledo/materialcn/blob/26284459f542e62645314726e2735ecffd58fa5d/.github/workflows/registry.yml#L1-L58)); it uses `actions/upload-pages-artifact` + `actions/deploy-pages` [source]. Pages serves `application/json`, `access-control-allow-origin: *` and `cache-control: max-age=600` on its JSON (measured in `registry-plan-validation.md` P7) [verified earlier].
- On a project Pages URL (`asif-sirajudeen.github.io/earth-ui`) the site needs `basePath: "/earth-ui"`, and the registry URL becomes `https://asif-sirajudeen.github.io/earth-ui/r/{name}.json` [inferred]. A custom domain removes the base path; decide the domain before the directory PR (P13).
- Vercel works the same way and drops the base path question. Static export is optional there [inferred].
- Run the existing `registry:smoke` against the exported `out/r` before deploy, since `smoke-registry.mts` already serves `public/r` over HTTP [source: `scripts/smoke-registry.mts` L18-L31].

Alternative with lower effort: Storybook static build or a Vite playground (materialcn). It gives demos and props but no registry-driven pages; install and source tabs would be manual [inferred]. Not recommended unless a Fumadocs site is too heavy.

### A6. Verdict

- **Feasible: yes. Recommended: yes.** Effort: about 2 to 4 days for a first usable site (scaffold, index and item page from registry JSON, 10 demos, Pages workflow) [inferred estimate].
- The registry is the source for the reference half of each page. The demos and prose are a separate, hand-written half. Do not try to put them in `registry.json`.
- Smallest first step: scaffold `site/` with Fumadocs, one dynamic route reading `public/r/button.json`, and a Pages workflow that builds the registry into `site/public/r`. Then replace `meta.links.docs` in `registry/metadata.ts` with the site URL.

## B. CLI

### B1. What `shadcn` 4.23.0 exposes

Package exports ([node_modules/shadcn/package.json](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/shadcn/package.json)) [verified]: `.`, `./registry`, `./schema`, `./mcp`, `./utils`, `./icons`, `./preset`, `./tailwind.css`. `bin` is `./dist/index.js`.

`shadcn/registry` re-exports `@shadcn/registry` ([dist/registry/index.d.ts](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/shadcn/src/registry/index.ts)). Public functions [verified: `.d.ts` in `@shadcn/registry@0.2.1`]:

| Export | Signature (abridged) |
|---|---|
| `addRegistryItems` | `(items: string[], { cwd?, config?, overwrite?, overwriteCssVars?, silent?, skipFonts?, path? }) => Promise<void>` |
| `getRegistryItems` | `(items: string[], { config?, useCache? })`. Works on a local file path [verified]. |
| `resolveRegistryItems` | `(items, options)`. Resolves the dependency tree. |
| `getRegistry` | `(name, { searchParams? })` |
| `searchRegistries` | `(registries, { query?, types?, limit?, offset?, config?, ... })` |
| `loadRegistry`, `loadRegistryItem` | Read a `registry.json` source tree. Call shape `loadRegistry({ cwd, registryFile })`; my call without `registryFile` returned a value without `.registry`, so check the return shape before using it. |
| `getRegistriesConfig`, `getRegistriesIndex`, `getRegistries` | Namespace config and the directory index. |
| Error classes | `RegistryNotConfiguredError`, `RegistryItemNotFoundError`, and others. |

Also: `shadcn/schema` (zod schemas), `shadcn/mcp` (`createServer()`).

Stability. The package.json maps `./internal/*` in `@shadcn/registry`, and `shadcn/registry` is documented only as source. I found no semver promise for `addRegistryItems` in the official docs [inferred: absence of evidence]. Pin `shadcn` exactly if you depend on it (this repo already pins 4.23.0).

CLI commands relevant here [verified: `shadcn --help`]: `add`, `search|list`, `view`, `docs`, `registry add`, `registry validate`, `build`, `mcp`.

- `shadcn registry add '@earth-ui=https://<host>/r/{name}.json'` edits `components.json` for the user. I ran it in a blank project and it wrote the `registries` entry [verified].
- `shadcn docs <names>` only looks names up in the **official** shadcn index and exits with "not found in the shadcn registry" otherwise ([docs.ts L37-L58](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/shadcn/src/commands/docs.ts#L37-L58)) [source]. So `meta.links` on earth-ui items is not read by `shadcn docs`.
- `shadcn mcp` is a ready MCP server with 7 tools: `get_project_registries`, `list_items_in_registries`, `search_items_in_registries`, `view_items_in_registries`, `get_item_examples_from_registries`, `get_add_command_for_items`, `get_audit_checklist` ([mcp/index.ts](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/shadcn/src/mcp/index.ts)) [source]. The docs say it "works out of the box with any shadcn-compatible registry" ([mcp.mdx L6](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/mcp.mdx#L6)) [source]. The MCP needs a registered namespace and good `title`/`description`, which earth-ui already has [verified: `list @earth` earlier note].

### B2. The three options

| | (1) No CLI | (2) Thin wrapper | (3) Fully custom CLI |
|---|---|---|---|
| What | `npx shadcn@latest add @earth-ui/button` | `npx earth-ui add button` spawns `shadcn add` | Own fetch, resolve, write, install |
| Work | 0 | ~20 lines + an npm package to publish and version | Weeks. Must re-implement import rewrite, CSS var merge (`cssVars` plus `css` at-rules), dependency install per package manager, `--diff`/`--overwrite`, `rsc` handling, fonts ([registry-research.md Step 3](registry-research.md)) |
| Gain | Zero maintenance; new CLI features come free (`--dry-run`, `--diff`, `--view`, MCP, `search`) | Branding; skips the `components.json` step | Full control of file layout and prompts |
| Cost | Needs the namespace entry until the directory lists it | A second package and release train; lags `shadcn@latest` | Drifts from shadcn on every release; breaks MCP and `--diff` parity |
| Verdict | **Recommended** | Acceptable fallback | **Reject** |

The namespace constraint. Every earth-ui item depends on `@earth-ui/style`. A namespaced dependency needs the consumer's `registries` entry, or the CLI throws `RegistryNotConfiguredError` ([resolver.ts L183-L189](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/packages/registry/src/registry/resolver.ts#L183-L189), per `registry-plan-validation.md` P4) [source]. So a wrapper that just runs `shadcn add <url>` (what kibo-ui does) would fail on a fresh project. A wrapper must register the namespace first, and that is exactly what `shadcn registry add` already does [verified above].

### B3. How peers do it

| Registry | Own CLI? | What it does | Evidence |
|---|---|---|---|
| @coss | No (`@coss/cli` and `@coss/ui` 404 on npm) | Plain `npx shadcn@latest add @coss/accordion` | [accordion.mdx](https://github.com/origin-space/originui/blob/fe6ffa81f434a4afe1c01564c13bb237564c42e2/apps/ui/content/docs/components/accordion.mdx) [source], `npm view` [verified] |
| @basecn | No (npm `basecn` unpublished 2026-02-18) | Plain shadcn | `npm view basecn` [verified] |
| @materialcn | No | `npx shadcn add @materialcn/button`, on Pages | [registry.yml L1-L8](https://github.com/guillermo-rebolledo/materialcn/blob/26284459f542e62645314726e2735ecffd58fa5d/.github/workflows/registry.yml#L1-L8) [source] |
| @magicui | No (`@magicui/cli` 404) | Plain shadcn | `npm view` [verified] |
| @intentui | Had one: `@intentui/cli` 3.1.11, last published 2025-07-01, ships its own `shadcnClone` bin | Docs now say `npx shadcn@latest add @intentui/date-field` ([date-field.mdx L15](https://github.com/intentui/intentui/blob/a9ee38b4cf134e3727630c2d664770edec18aa91/src/content/docs/components/date-and-time/date-field.mdx#L15)) | `npm view` [verified], [source] |
| kibo-ui | Wrapper, `kibo-ui` 1.1.5 | 646-byte `dist/index.js`: `spawnSync("npx -y shadcn@latest add https://www.kibo-ui.com/r/<name>.json")` per name | `npm pack kibo-ui` [verified] |
| ai-elements | Wrapper, `ai-elements` 1.9.1 | 63-line `index.js`, `spawnSync` of `<pm> shadcn@latest add https://elements.ai-sdk.dev/api/registry/<name>.json`. It prints that it **will be deprecated at the end of November 2026** because "AI Elements is moving to shadcn/ui" ([index.js L28-L31, L44-L52](https://github.com/vercel/ai-elements/blob/ca8be600bfd01b3131f9bf6134b51602a71f4374/packages/cli/index.js#L28-L31)) | [source] |

What the wrappers gained: a shorter command and package-manager detection (`npx`/`bunx`/`pnpm dlx` in ai-elements). Both predate or avoid namespaces (they pass raw URLs). The one custom CLI that did more (intentui) was abandoned for plain shadcn. The shadcn team is also absorbing a wrapper registry (AI Elements) into `ui.shadcn.com` [source]. The trend is away from custom CLIs [inferred].

### B4. Does the `registries.json` directory make a CLI redundant?

Mostly yes. The official docs: "When you run `shadcn add` or `shadcn search`, the CLI will automatically check the registry index for the registry you are looking for and add it to your `components.json` file" ([registry-index.mdx L7-L9](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/registry-index.mdx#L7-L9)) [source]. Once `@earth-ui` is in `apps/v4/registry/directory.json`, `npx shadcn@latest add @earth-ui/button` works on a project with no prior setup [source; not verified, since the registry is not listed and not hosted].

Caveats:

- Listing needs a public, final host and a PR reviewed by the shadcn team ([registry-index.mdx L16-L33](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/registry-index.mdx#L16-L33)); not a gate you control [source].
- The CLI writes the URL into the consumer's `components.json` at first use, so a later host change does not reach existing consumers (`registry-plan-validation.md`, line 190) [source].
- Until listing, the README's step 1 (hand-edit `components.json`) is the friction. Replace it with `npx shadcn@latest registry add '@earth-ui=https://<host>/r/{name}.json'` [verified].
- The GitHub form `owner/repo/item` works without the directory ([registry-index.mdx L13-L15](https://github.com/shadcn-ui/ui/blob/8ab27715521cbd4f87ae6886cd989cbb678f6de7/apps/v4/content/docs/registry/registry-index.mdx#L13-L15)) [source]. `registry-research.md` 1b covers it.

### B5. Verdict

- **Option 1 (no custom CLI): recommended.** Effort: none beyond docs. Smallest first step: change the README install step 1 to the `shadcn registry add` one-liner once the host URL is known.
- **Option 2 (wrapper): not now.** If you want `npx earth-ui add button` later, build it as: run `shadcn registry add @earth-ui=<url>` if the namespace is missing, then spawn `shadcn add @earth-ui/<name>`. Keep it under 50 lines. Don't use raw-URL form (fails without the namespace). It adds a package to publish, and the docs and MCP will still show the shadcn command [inferred].
- **Option 3 (fully custom): reject.** No peer does it today; the one that tried (intentui) abandoned it.
- **Revisit when:** you need something shadcn cannot do, for example installing from a tagged version across items or a `earth-ui init` that also edits CSS imports (the style layer needs a manual `@import` today, see `registry-research.md` Step 3). Even then, call `addRegistryItems` from `shadcn/registry` instead of re-implementing, and pin `shadcn` [inferred].

## Recommended order

1. Pick the host and domain (blocks the directory PR, the README one-liner and the `basePath`).
2. README: replace the `components.json` hand-edit with `shadcn registry add`.
3. Scaffold `site/` (Fumadocs, static export). One registry-driven item page. Pages workflow that builds into `site/public/r`.
4. Replace `meta.links.docs` with the new page URLs in `registry/metadata.ts`, then `pnpm registry:check`.
5. Add demos (`site/examples/<name>-demo.tsx`), then MDX prose for the 10 most used components.
6. Submit the directory PR once the host is stable.
7. Optional later: `registry:example` for flagship components (MCP discovery); a wrapper CLI only if a real need appears.

## Unverified

- No Fumadocs static export build was run for this repo. Search under static export needs the Orama static setup.
- Whether `.changeset` config and the `registry-install` CI job tolerate a second workspace member was not read.
- Zero-config `add @earth-ui/x` after directory listing is from official docs; not tested because no listing exists.
- `shadcn/registry` has no documented stability guarantee that I found; my search was `node_modules` types and the `docs/registry` MDX only.
- `loadRegistry` return shape: my call returned an object without `.registry`. Not investigated further.
- Effort estimates are mine.
- `categories` on registry items: not checked against `registryItemSchema`.
- Open PRs in `shadcn-ui/ui` claiming `@earth-ui` were not checked.
