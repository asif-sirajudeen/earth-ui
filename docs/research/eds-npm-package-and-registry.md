# Research: Shipping `@earth/ui` as an npm package with a shadcn registry

As of: 2026-11-06

## Summary

Tailwind v4 skips `node_modules` and gitignored files, so consumers need `@source "../node_modules/<pkg>"` or a package-shipped CSS entry they `@import`, which is the pattern `shadcn/tailwind.css` uses. shadcn puts tokens in `:root`/`.dark` mapped through `@theme inline`, and `shadcn init <url>` applies a `registry:base` item's `config`, `cssVars`, `css` and `dependencies` in one step. esbuild and tsup keep `"use client"` only in entry files, so ship per-file entries, `bundle: false`, or a `banner`; tsup is now unmaintained and recommends tsdown. shadcn components now depend on `cn` (which replaces `clsx` + `tailwind-merge`), `class-variance-authority`, `lucide-react`, and either the unified `radix-ui` or `@base-ui/react` (now the default), and npm 7+ and pnpm both auto-install missing peers. Changesets v3 skips `private: true` apps by default, `ignore` is for temporary use only, `changesets/action` v2 opens a "Version Packages" PR, and GitHub Packages requires a classic PAT even to install. shadcn documents only query-param versioning through namespace `params` and `#ref` pinning for GitHub source registries; versioned URL paths are not documented.

## 1. Tailwind v4 and classes inside an npm package

- Automatic detection skips "Files in the `node_modules` directory" and "Files that are in your `.gitignore` file" ([detecting-classes](https://tailwindcss.com/docs/detecting-classes-in-source-files#which-files-are-scanned)).
- The documented consumer fix uses `@source`, with a path "relative to the stylesheet" ([explicitly-registering-sources](https://tailwindcss.com/docs/detecting-classes-in-source-files#explicitly-registering-sources)):
  ```css
  @import "tailwindcss";
  @source "../node_modules/@acmecorp/ui-lib";
  ```
- The docs say this is "especially useful when you need to scan an external library that is built with Tailwind" ([same anchor](https://tailwindcss.com/docs/detecting-classes-in-source-files#explicitly-registering-sources)).
- In a monorepo, `@import "tailwindcss" source("../src");` sets the base path, and `source(none)` disables auto-detection ([setting-your-base-path](https://tailwindcss.com/docs/detecting-classes-in-source-files#setting-your-base-path), [disabling-automatic-detection](https://tailwindcss.com/docs/detecting-classes-in-source-files#disabling-automatic-detection)).
- Since v4.1.0, `@source` rules that point inside `node_modules/` "no longer consider your `.gitignore` rules" ([CHANGELOG L595-L596](https://github.com/tailwindlabs/tailwindcss/blob/0206409d5858cab6c1e4f2d847ecc30f6c505dfb/CHANGELOG.md?plain=1#L595-L596)).
- `@source` follows symlinks (v4.1.0), which matters for pnpm's symlinked `node_modules` ([CHANGELOG L585](https://github.com/tailwindlabs/tailwindcss/blob/0206409d5858cab6c1e4f2d847ecc30f6c505dfb/CHANGELOG.md?plain=1#L585)).
- **Library ships its own CSS (theme).** Tailwind documents putting `@theme` in a shared CSS file and says you can "publish them to NPM and import them just like any other third-party CSS files" ([theme#sharing-across-projects](https://tailwindcss.com/docs/theme#sharing-across-projects)).
- **Library ships its own CSS (`@source`).** The docs do not cover an `@source` inside a package stylesheet that the consumer imports. Tailwind's source code does settle it:
  - An `@import`ed stylesheet is wrapped in `context({ base: loaded.base })` ([at-import.ts L56-L62](https://github.com/tailwindlabs/tailwindcss/blob/0206409d5858cab6c1e4f2d847ecc30f6c505dfb/packages/tailwindcss/src/at-import.ts#L56-L62)).
  - `@source` records `base: ctx.context.base` ([index.ts L258-L305](https://github.com/tailwindlabs/tailwindcss/blob/0206409d5858cab6c1e4f2d847ecc30f6c505dfb/packages/tailwindcss/src/index.ts#L258-L305)).
  - So an `@source` inside a package's CSS file resolves relative to that file.
- **Precedent in shadcn itself.** The `shadcn` npm package (4.23.0) exports `"./tailwind.css": "./dist/tailwind.css"` ([package.json](https://unpkg.com/shadcn@latest/package.json)).
  - That file contains `@theme inline { @keyframes … }` and `@custom-variant data-open …` ([dist/tailwind.css](https://unpkg.com/shadcn@latest/dist/tailwind.css)).
  - shadcn's style item injects it with the `css` key `"@import \"shadcn/tailwind.css\"": {}` ([new-york-v4/style.json](https://ui.shadcn.com/r/styles/new-york-v4/style.json)).
- Tailwind does not document shipping pre-compiled utility CSS from a library.

## 2. Theme tokens

- shadcn uses three blocks:
  - `:root` holds the light values.
  - `.dark` holds the overrides.
  - `@theme inline` maps them, for example `--color-primary: var(--primary);` ([theming](https://ui.shadcn.com/docs/theming)).
- To add a token, "define it under `:root` and `.dark`, then expose it to Tailwind with `@theme inline`" ([theming](https://ui.shadcn.com/docs/theming)).
- The Tailwind v4 upgrade guide moves `:root`/`.dark` out of `@layer base` and changes `@theme` to `@theme inline` ([tailwind-v4#2-update-your-css-variables](https://ui.shadcn.com/docs/tailwind-v4#2-update-your-css-variables)).
- Use `inline` when a theme variable references another variable. Otherwise utilities may resolve the variable at the wrong element ([theme#referencing-other-variables](https://tailwindcss.com/docs/theme#referencing-other-variables)).
- `tailwind.cssVariables: true` is the default. It is an install-time choice ([theming](https://ui.shadcn.com/docs/theming)).
- `tailwindcss-animate` is deprecated in favour of `tw-animate-css` ([tailwind-v4 changelog](https://ui.shadcn.com/docs/tailwind-v4#march-19-2025---deprecate-tailwindcss-animate)).
- **`registry:base`** is "a complete design system base." It "defines the full set of dependencies, CSS variables, and configuration for a project" ([examples#registrybase](https://ui.shadcn.com/docs/registry/examples#registrybase)).
  - Its `config` field is unique to this type. Accepted keys include `style`, `iconLibrary`, `rsc`, `tailwind.baseColor`, `tailwind.css`, the `aliases.*` keys, and `registries` ([examples#custom-base](https://ui.shadcn.com/docs/registry/examples#custom-base)).
  - `extends: none` creates a base that "doesn't extend shadcn/ui defaults" ([examples#base-from-scratch](https://ui.shadcn.com/docs/registry/examples#base-from-scratch)).
- The `registry:style` example "On `npx shadcn init`" installs an npm dependency, components, a remote item, a font variable and a brand colour ([examples#registrystyle](https://ui.shadcn.com/docs/registry/examples#registrystyle)).
- `registry:theme` items carry `cssVars.light`/`cssVars.dark` ([examples#registrytheme](https://ui.shadcn.com/docs/registry/examples#registrytheme)).
- **`shadcn init` accepts an item.** Usage is `shadcn init [options] [components...]`, where components are "names, url or local path to component" ([cli](https://ui.shadcn.com/docs/cli)). `create` is an alias.
- **What init does with the first item** (source code):
  - It fetches the first component and applies `item.config` when `type === "registry:base"` ([presets.ts L228-L280](https://github.com/shadcn-ui/ui/blob/d549251bab2e57dbf72f7c909d6458c02c43f529/packages/shadcn/src/preset/presets.ts#L228-L280), [init.ts L565-L589](https://github.com/shadcn-ui/ui/blob/d549251bab2e57dbf72f7c909d6458c02c43f529/packages/shadcn/src/commands/init.ts#L565-L589)).
  - It installs shadcn's style `index` unless `extends === "none"` (`installStyleIndex: item?.extends !== "none"`, [presets.ts L277](https://github.com/shadcn-ui/ui/blob/d549251bab2e57dbf72f7c909d6458c02c43f529/packages/shadcn/src/preset/presets.ts#L277)).
  - It calls `ensureRegistriesInConfig([initUrl], …)` before fetching ([presets.ts L228-L280](https://github.com/shadcn-ui/ui/blob/d549251bab2e57dbf72f7c909d6458c02c43f529/packages/shadcn/src/preset/presets.ts#L228-L280)).
  - If the first component is a URL, init sets `?base=<base|radix|aria>` on it (`init.ts` source, same commit).
- Neither the docs nor the namespace page show `shadcn init` with a namespaced item ([namespace](https://ui.shadcn.com/docs/registry/namespace)).
- **Default primitives changed.** "Base UI is the default component library in shadcn/ui" (July 2026). Use `shadcn init -b radix` to stay on Radix ([changelog 2026-07](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default)).

## 3. React components in a package for Next.js App Router

- React says `'use client'` "must be at the very beginning of a file, above any imports" ([use-client#caveats](https://react.dev/reference/rsc/use-client#caveats)).
- It marks "the module and its transitive dependencies as client code" ([use-client](https://react.dev/reference/rsc/use-client#how-use-client-marks-client-code)).
- Library rule from React: RSC-compatible libraries "will already include `'use client'` markers of their own" ([use-client#using-third-party-libraries](https://react.dev/reference/rsc/use-client#using-third-party-libraries)).
- Next.js advice for library authors: "add the `"use client"` directive to entry points that rely on client-only features" ([server-and-client-components#third-party-components](https://nextjs.org/docs/app/getting-started/server-and-client-components#third-party-components)).
- Next.js also warns: "some bundlers might strip out `"use client"` directives." It links react-wrap-balancer's tsup config as the esbuild example (same anchor).
- That config marks the whole bundle as client:
  ```ts
  esbuildOptions(options) { options.banner = { js: '"use client"' } }
  ```
  ([react-wrap-balancer tsup.config.ts](https://github.com/shuding/react-wrap-balancer/blob/main/tsup.config.ts)).
- The second repo Next.js links (Vercel Analytics) no longer shows directive handling at the cited lines ([tsup.config.js](https://github.com/vercel/analytics/blob/main/packages/web/tsup.config.js)).
- esbuild 0.17.19 lets you "put arbitrary directives in the entry point," and esbuild "will preserve them" ([esbuild CHANGELOG-2023 0.17.19](https://github.com/evanw/esbuild/blob/main/CHANGELOG-2023.md#01719)). Before that release, the docs pointed to `--banner:js`.
- Maintainer note on esbuild issue #3115: "Unknown directives are currently stripped by the minifier… you can use the banner feature" ([issue #3115](https://github.com/evanw/esbuild/issues/3115)).
- tsup's test suite asserts that an entry file's `'use client'` survives bundling ([test/index.test.ts L16-L22](https://github.com/egoist/tsup/blob/198479b814f5981032dc0b7cd52c4b9e4b699ac3/test/index.test.ts#L16-L22)).
- tsup options:
  - `bundle?: boolean` ("Disable bundling, default to true") ([src/options.ts L178-L181](https://github.com/egoist/tsup/blob/198479b814f5981032dc0b7cd52c4b9e4b699ac3/src/options.ts#L178-L181)).
  - `banner?: BannerOrFooter` ([L193](https://github.com/egoist/tsup/blob/198479b814f5981032dc0b7cd52c4b9e4b699ac3/src/options.ts#L193)).
  - Multiple entries through `entry: [...]` or `entry: {…}` ([docs#multiple-entrypoints](https://github.com/egoist/tsup/blob/198479b814f5981032dc0b7cd52c4b9e4b699ac3/docs/README.md#multiple-entrypoints)).
- tsup excludes `dependencies` and `peerDependencies` from the bundle by default ([docs#excluding-packages](https://github.com/egoist/tsup/blob/198479b814f5981032dc0b7cd52c4b9e4b699ac3/docs/README.md#excluding-packages)).
- `--treeshake` switches tree shaking to Rollup ([docs#tree-shaking](https://github.com/egoist/tsup/blob/198479b814f5981032dc0b7cd52c4b9e4b699ac3/docs/README.md#tree-shaking)).
- **tsup status.** The README says: "This project is not actively maintained anymore. Please consider using tsdown instead" ([tsup README](https://github.com/egoist/tsup/blob/198479b814f5981032dc0b7cd52c4b9e4b699ac3/README.md)).
- tsdown replaces `bundle: false` with `unbundle: true` ([tsdown migrate](https://tsdown.dev/guide/migrate-from-tsup)).
  - Unbundle mode gives "a one-to-one mapping of your source files to output files" ([tsdown unbundle](https://tsdown.dev/options/unbundle)).
  - Neither page mentions directives.
- shadcn's own sources keep `"use client"` per file only where needed:
  - `dialog` starts with `"use client"`.
  - base-nova `button` does not ([new-york-v4/dialog.json](https://ui.shadcn.com/r/styles/new-york-v4/dialog.json), [base-nova/button.json](https://ui.shadcn.com/r/styles/base-nova/button.json)).

## 4. Peer dependencies

- **What shadcn components import today**, from the registry JSON:
  - new-york-v4 `button`: `dependencies: ["cn", "radix-ui"]`. It imports `class-variance-authority`, `cn` and `Slot` from `radix-ui` ([button.json](https://ui.shadcn.com/r/styles/new-york-v4/button.json)).
  - new-york-v4 `dialog`: `["cn", "radix-ui"]`. It imports `XIcon` from `lucide-react` ([dialog.json](https://ui.shadcn.com/r/styles/new-york-v4/dialog.json)).
  - base-nova `button`: imports `@base-ui/react/button`, `class-variance-authority` and `cn` ([base-nova/button.json](https://ui.shadcn.com/r/styles/base-nova/button.json)).
  - Style index `dependencies`: `class-variance-authority`, `cn`, `lucide-react`, plus `radix-ui` (new-york-v4) or `@base-ui/react` (base-nova). `devDependencies`: `tw-animate-css`, `shadcn` ([new-york-v4/style.json](https://ui.shadcn.com/r/styles/new-york-v4/style.json), [base-nova/style.json](https://ui.shadcn.com/r/styles/base-nova/style.json)).
- **Radix.** "The `new-york` style now uses the unified `radix-ui` package instead of individual `@radix-ui/react-*` packages." `shadcn migrate radix` converts existing code ([changelog 2026-02](https://ui.shadcn.com/docs/changelog/2026-02-radix-ui)).
- **`cn` replaces `clsx` + `tailwind-merge`.** "Every shadcn component now imports `cn` from the `cn` package." It is "a drop-in replacement for `twMerge(clsx(...))`" ([changelog 2026-09-cn](https://ui.shadcn.com/docs/changelog/2026-09-cn)).
  - `cn` "has zero dependencies."
  - The README says: "On Tailwind v3, stay with tailwind-merge v2" ([shadcn-ui/cn](https://github.com/shadcn-ui/cn)).
- Icons: examples use `lucide-react` and `@tabler/icons-react` ([components/button](https://ui.shadcn.com/docs/components/button)).
- **npm semantics.** Use `peerDependencies` to "express the compatibility of your package with a host tool or library." "As of npm v7, peerDependencies are installed by default" ([package-json#peerdependencies](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#peerdependencies)).
- `peerDependenciesMeta` can mark peers optional. "Npm will not automatically install optional peer dependencies" ([#peerdependenciesmeta](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#peerdependenciesmeta)).
- **pnpm semantics** ([peer-dependencies settings](https://pnpm.io/settings/peer-dependencies#autoinstallpeers)):
  - `autoInstallPeers` defaults to `true` and installs "any missing non-optional peer dependencies."
  - On version conflicts, pnpm "will not install any version of the conflicting peer dependency automatically."
  - `strictPeerDependencies` defaults to `false`.
  - `resolvePeersFromWorkspaceRoot` defaults to `true`.
- pnpm replaces `workspace:*`/`workspace:^` with the real version on pack or publish ([workspaces#publishing-workspace-packages](https://pnpm.io/workspaces#publishing-workspace-packages)).
- Which packages go in peers versus dependencies is not prescribed by npm, pnpm or shadcn. Section "Implications for the plan" gives a recommendation.

## 5. Changesets in a pnpm monorepo

- Latest `@changesets/cli` is 3.0.3 ([npm registry](https://registry.npmjs.org/@changesets/cli)).
- The in-repo `docs/config-file-options.md` is marked "outdated". It points to changesets.dev ([config-file-options.md](https://github.com/changesets/changesets/blob/main/docs/config-file-options.md)).
- **Private apps.** "To prevent this, make sure to set `"private": true` in the `package.json` of packages that should not be published" ([guide/cli publish](https://github.com/changesets/changesets/blob/main/site/guide/cli.md#publish)).
- `privatePackages`: "By default, Changesets will not version or tag private packages." The defaults are `{ "version": false, "tag": false }` ([changesets.dev config#privatepackages](https://changesets.dev/guide/config#privatepackages)).
- `ignore`: "designed for temporary use to allow changes to be merged without publishing them" ([config#ignore](https://changesets.dev/guide/config#ignore)).
  - Publishing fails if an ignored package shares a changeset with a non-ignored one ([config-file-options.md#ignore](https://github.com/changesets/changesets/blob/main/docs/config-file-options.md#ignore-array-of-packages)).
- `access` defaults to `"restricted"`. Override it per package with `publishConfig.access: "public"` ([config#access](https://changesets.dev/guide/config#access), [versioning-and-publishing.md](https://github.com/changesets/changesets/blob/main/site/guide/versioning-and-publishing.md)).
- `baseBranch` defaults to `"main"` on changesets.dev. The outdated repo doc says `"master"` ([config](https://changesets.dev/guide/config)).
- `publishConfig.directory` is supported in all package managers ([versioning-and-publishing.md](https://github.com/changesets/changesets/blob/main/site/guide/versioning-and-publishing.md)).
- **GitHub Action.** `changesets/action` v2 is "compatible with Changesets v3". v1 is on `maintenance/v1` for Changesets v2 ([action README](https://github.com/changesets/action)). The latest release is v2.1.2, from 2026-09-07 ([releases](https://github.com/changesets/action/releases)).
  - Sub-actions: `select-mode`, `version`, `pack`, `publish`, `pr-status`, `pr-comment`.
  - Inputs: `publish-script`, `version-script` (default `changeset version`), `commit-message` and `pr-title` (both default `Version Packages`), `create-github-releases`.
  - Outputs: `published`, `published-packages`, `has-changesets`, `pr-number` ([README API](https://github.com/changesets/action/blob/main/README.md#api)).
  - Required permissions: `contents: write` and `pull-requests: write`, plus `id-token: write` for trusted publishing.
  - Enable "Allow GitHub Actions to create and approve pull requests" in repo settings.
  - Setting `GITHUB_TOKEN` as an env var "does not configure the action". Pass `github-token` instead.
- changesets.dev shows the v2 workflow (`select-mode@v2`, `version@v2`, `pack@v2`, `publish@v2`). It calls token-based publishing "no longer recommended" ([automating#trusted-publishing](https://changesets.dev/guide/automating#trusted-publishing)).
- **Stale pnpm guide.** pnpm's guide still shows `changesets/action@v1` with `publish:`, `commit:`, `title:` and `NPM_TOKEN` env ([pnpm using-changesets](https://pnpm.io/using-changesets#integration-with-github-actions)). Treat it as v1 syntax.
- changesets.dev says a pnpm project `.npmrc` "does not support environment variables due to security reasons" ([automating#pnpm](https://changesets.dev/guide/automating#pnpm)). pnpm.io does not confirm this.
- **npm trusted publishing** needs `id-token: write`, npm CLI ≥ 11.5.1 and Node ≥ 22.14.0. It works only on GitHub-hosted runners ([trusted-publishers](https://docs.npmjs.com/trusted-publishers)).
- **GitHub Packages** ([GitHub Docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)):
  - It accepts only scoped packages, `@NAMESPACE/PACKAGE-NAME`.
  - Map the scope with `@NAMESPACE:registry=https://npm.pkg.github.com` in `.npmrc`, or set `publishConfig.registry`.
  - It "only supports authentication using a personal access token (classic)."
  - "You need an access token to publish, install, and delete private, internal, and public packages."
  - `GITHUB_TOKEN` can publish packages that belong to the workflow repo.
- changesets.dev covers GitHub Packages under token-based publishing, with `registry-url: https://npm.pkg.github.com/` and `NODE_AUTH_TOKEN` ([automating#token-based-publishing](https://changesets.dev/guide/automating#token-based-publishing)).

## 6. Registry versioning

The following versioning mechanisms are documented:

- **Query params on a namespace.** "You can implement versioning for your registry resources using query parameters," for example `?version=v2` ([namespace#versioning](https://ui.shadcn.com/docs/registry/namespace#versioning)). Env-driven versions, semver ranges and `/versions/{name}` discovery endpoints are listed as server-side practices.
- **GitHub source registries with `#ref`.** "Use `#ref` to install from a branch, tag or commit SHA." Example: `add acme/toolkit/project-conventions#v1.0.0` ([registry/github#refs](https://ui.shadcn.com/docs/registry/github#refs)).
  - "Prefer pinned refs for published install commands." "A full 40-character commit SHA is the most reproducible option" ([#review-before-installing](https://ui.shadcn.com/docs/registry/github#review-before-installing)).
  - "Refs are not inherited across dependencies." Each `registryDependencies` entry must carry its own ref ([#dependency-refs](https://ui.shadcn.com/docs/registry/github#dependency-refs)).
  - GitHub registries need no `shadcn build`. The CLI reads `registry.json` directly ([changelog 2026-06](https://ui.shadcn.com/docs/changelog/2026-06-github-registries)).
  - Private repos authenticate with `GH_TOKEN`/`GITHUB_TOKEN` ([#private-repositories](https://ui.shadcn.com/docs/registry/github#private-repositories)).
- **npm dependency versions** in items use `name@version`, for example `zod@^3.20.0` ([getting-started#guidelines](https://ui.shadcn.com/docs/registry/getting-started#guidelines)).
- **Dynamic route handlers** are a documented way to serve a registry ([getting-started#option-b-dynamic-route-handlers](https://ui.shadcn.com/docs/registry/getting-started#option-b-dynamic-route-handlers)). A server can honour `?version=` this way. Static `public/r` files cannot.

These are not documented:

- Versioned URL paths, such as `/r/v1/{name}.json`.
- `#ref` for hosted (non-GitHub) namespaced registries.
- A `version` field in `registry-item.json`.
- Any update or diff flow keyed to registry versions.

## Implications for the plan

- **CSS default.** Ship `@earth/ui/styles.css` through `exports`. It should hold `@source "./<dist dir>"`, the `@theme inline` mappings and any `@custom-variant`s.
  - Consumers then write `@import "tailwindcss"; @import "@earth/ui/styles.css";`.
  - This mirrors `shadcn/tailwind.css`. Tailwind's source confirms that `@source` resolves relative to the imported file.
  - Document a manual `@source "../node_modules/@earth/ui"` as the fallback.
  - Do not ship pre-compiled utilities. Tailwind does not document that pattern (inference).
- **`shadcn init` can replace a custom init CLI.** Host one `registry:base` item, for example `/r/base.json`. It can carry:
  - `config.registries`, which writes the `@earth` namespace into `components.json`.
  - `cssVars` (theme, light, dark).
  - A `css` key `"@import \"@earth/ui/styles.css\"": {}`.
  - `dependencies: ["@earth/ui@^x"]`.
  - Consumers run `npx shadcn@latest init https://<docs-host>/r/base.json`.
- **Set `extends: "none"` on that base (inference).** Otherwise init also installs shadcn's style index (`cva`, `cn`, `lucide-react`, `radix-ui`/`@base-ui/react`, `tw-animate-css`, `utils`), which duplicates what `@earth/ui` provides. Test both modes.
- **Pick a primitive library explicitly.** The plan must choose between Base UI (shadcn's default since July 2026) and Radix. If it chooses Radix, use the unified `radix-ui` package, not `@radix-ui/react-*`, and pass `-b radix` to `init`.
- **Drop `clsx` and `tailwind-merge`** from the plan in favour of `cn`. Keep `tailwind-merge` only if the package must support Tailwind v3.
- **Recommended dependency split (recommendation, not documented):**
  - `peerDependencies`: `react`, `react-dom`. These are the "host library" case in npm's definition.
  - Consider `tailwindcss` (v4) as a peer, since consumers compile the CSS.
  - `dependencies`: `radix-ui` (or `@base-ui/react`), `class-variance-authority`, `cn`, and `lucide-react` if primitives render icons internally.
  - tsup externalises all of these by default.
  - Blocks that import icons or primitives directly should list them in their registry item `dependencies`.
- **`"use client"`.** Do not use a single bundled entry without a strategy. Choose one:
  - (a) One entry per component file. Entry directives are preserved.
  - (b) `bundle: false` in tsup, or `unbundle: true` in tsdown.
  - (c) A `banner` that marks the whole package client-only.
  - (a) or (b) keeps server-safe components such as Button RSC-friendly.
  - Verify the built output with a grep in CI.
- **Reconsider tsup.** It is unmaintained and its README recommends tsdown. The plan should either accept that risk or prototype tsdown `unbundle`.
- **Changesets.**
  - Set `private: true` on every app, including docs. Keep the default `privatePackages: { version: false, tag: false }`.
  - Do not use `ignore` for apps.
  - Set `publishConfig.access: "public"` if the package goes to public npm.
  - Use `changesets/action@v2` (or its sub-actions), not the `@v1` syntax from pnpm's guide.
- **Registry: npm or GitHub Packages.**
  - npm gives trusted publishing (no long-lived token).
  - GitHub Packages forces every consumer, plus every machine running `shadcn add`/`init`, to hold a classic PAT in `.npmrc`, even for public packages.
  - Prefer npm (private org scope or public) unless GitHub-only access is a hard requirement.
- **Registry versioning.** Static `/r/*.json` hosting has no documented versioning. Options:
  - Accept "latest only". Express compatibility through `@earth/ui@^x` ranges in item `dependencies`.
  - Serve `/r` from a route handler that honours `?version=` through namespace `params`.
  - Expose the repo as a GitHub source registry and pin with `#vX.Y.Z` tags. This conflicts with a private repo unless consumers have `GH_TOKEN`.

## Not found / unverified

- `shadcn init @earth/base` (namespaced, fresh project, no `components.json`): not documented. The source calls `ensureRegistriesInConfig`, but resolution for a private, unindexed namespace is not confirmed. Use the URL form.
- Whether the `?base=…` query that init appends to a URL harms static hosting: inferred harmless, not verified.
- Whether `extends: "none"` on a `registry:base` produces a working project with only `@earth/ui` deps: not tested.
- Tailwind docs do not say how `@source` resolves inside an imported package stylesheet. This is confirmed from source code only.
- esbuild/tsup handling of `"use client"` in non-entry modules and shared chunks: not documented. Only a user report exists in esbuild #3115.
- Effect of tsup `--treeshake` (Rollup) on directives: not checked.
- tsdown handling of `"use client"` in `unbundle` mode: not documented. `tsdown.dev/recipes/react` returned 404.
- Why `lucide-react` and `class-variance-authority` are absent from per-component `dependencies` (they are in the style index): observed, not documented.
- Manual-install npm commands on shadcn component pages did not render. Package names come from the registry JSON instead.
- The pnpm project-`.npmrc` env-var limitation is stated only by changesets.dev, not pnpm.io.
- npm trusted publishing for private packages or GitHub Packages: not documented.
- How the shadcn CLI authenticates dependency installs from GitHub Packages: not documented. It presumably relies on the package manager's `.npmrc` (inference).
- The `pnpm change` / `pnpm version -r` built-in release flow on pnpm's workspaces page: not investigated.
- The Vercel Analytics tsup example that Next.js links no longer shows `"use client"` handling at the cited lines.

## Sources

Inline `github.com/.../blob/<sha>/...` links are SHA-pinned views of the raw, tarball and API URLs listed here.

Tailwind
- https://tailwindcss.com/docs/detecting-classes-in-source-files
- https://tailwindcss.com/docs/functions-and-directives
- https://tailwindcss.com/docs/theme
- https://raw.githubusercontent.com/tailwindlabs/tailwindcss/main/CHANGELOG.md
- https://raw.githubusercontent.com/tailwindlabs/tailwindcss/main/packages/tailwindcss/src/index.ts
- https://raw.githubusercontent.com/tailwindlabs/tailwindcss/main/packages/tailwindcss/src/at-import.ts
- https://api.github.com/repos/tailwindlabs/tailwindcss/commits/main

shadcn
- https://ui.shadcn.com/docs/tailwind-v4
- https://ui.shadcn.com/docs/theming
- https://ui.shadcn.com/docs/cli
- https://ui.shadcn.com/docs/components-json
- https://ui.shadcn.com/docs/registry/examples
- https://ui.shadcn.com/docs/registry/namespace
- https://ui.shadcn.com/docs/registry/registry-item-json
- https://ui.shadcn.com/docs/registry/getting-started
- https://ui.shadcn.com/docs/registry/github
- https://ui.shadcn.com/docs/registry/faq
- https://ui.shadcn.com/docs/changelog
- https://ui.shadcn.com/docs/changelog/2026-09-cn
- https://ui.shadcn.com/docs/changelog/2026-06-github-registries
- https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
- https://ui.shadcn.com/docs/changelog/2026-02-radix-ui
- https://ui.shadcn.com/docs/components/button
- https://ui.shadcn.com/docs/components/base/button
- https://ui.shadcn.com/docs/components/radix/dialog
- https://ui.shadcn.com/r/styles/index.json
- https://ui.shadcn.com/r/styles/new-york-v4/button.json
- https://ui.shadcn.com/r/styles/new-york-v4/dialog.json
- https://ui.shadcn.com/r/styles/new-york-v4/index.json
- https://ui.shadcn.com/r/styles/new-york-v4/style.json
- https://ui.shadcn.com/r/styles/base-nova/button.json
- https://ui.shadcn.com/r/styles/base-nova/dialog.json
- https://ui.shadcn.com/r/styles/base-nova/index.json
- https://ui.shadcn.com/r/styles/base-nova/style.json
- https://raw.githubusercontent.com/shadcn-ui/ui/main/packages/shadcn/src/commands/init.ts
- https://raw.githubusercontent.com/shadcn-ui/ui/main/packages/shadcn/src/preset/presets.ts
- https://api.github.com/repos/shadcn-ui/ui/commits/main
- https://unpkg.com/shadcn@latest/package.json
- https://unpkg.com/shadcn@latest/dist/tailwind.css
- https://github.com/shadcn-ui/cn

React / Next.js / bundlers
- https://react.dev/reference/rsc/use-client
- https://nextjs.org/docs/app/getting-started/server-and-client-components
- https://raw.githubusercontent.com/evanw/esbuild/main/CHANGELOG.md
- https://raw.githubusercontent.com/evanw/esbuild/main/CHANGELOG-2023.md
- https://raw.githubusercontent.com/evanw/esbuild/main/CHANGELOG-2024.md
- https://raw.githubusercontent.com/evanw/esbuild/main/CHANGELOG-2025.md
- https://api.github.com/repos/evanw/esbuild/issues/3115 (and /comments)
- https://raw.githubusercontent.com/egoist/tsup/main/README.md
- https://raw.githubusercontent.com/egoist/tsup/main/docs/README.md
- https://raw.githubusercontent.com/egoist/tsup/main/src/options.ts
- https://codeload.github.com/egoist/tsup/tar.gz/198479b814f5981032dc0b7cd52c4b9e4b699ac3 (src, test)
- https://api.github.com/repos/egoist/tsup
- https://raw.githubusercontent.com/shuding/react-wrap-balancer/main/tsup.config.ts
- https://raw.githubusercontent.com/vercel/analytics/main/packages/web/tsup.config.js
- https://tsdown.dev/guide/migrate-from-tsup
- https://tsdown.dev/options/unbundle
- https://tsdown.dev/recipes/react (404)

npm / pnpm
- https://docs.npmjs.com/cli/v11/configuring-npm/package-json#peerdependencies
- https://docs.npmjs.com/trusted-publishers
- https://pnpm.io/settings
- https://pnpm.io/settings/peer-dependencies
- https://pnpm.io/workspaces
- https://pnpm.io/using-changesets

Changesets / GitHub
- https://api.github.com/repos/changesets/changesets/contents/docs
- https://raw.githubusercontent.com/changesets/changesets/main/docs/config-file-options.md
- https://raw.githubusercontent.com/changesets/changesets/main/packages/cli/package.json
- https://registry.npmjs.org/@changesets/cli
- https://api.github.com/repos/changesets/changesets/contents/site/guide
- https://raw.githubusercontent.com/changesets/changesets/main/site/guide/cli.md
- https://raw.githubusercontent.com/changesets/changesets/main/site/guide/versioning-and-publishing.md
- https://raw.githubusercontent.com/changesets/changesets/main/site/guide/beyond-npm.md
- https://changesets.dev/guide/config
- https://changesets.dev/guide/automating
- https://github.com/changesets/action
- https://raw.githubusercontent.com/changesets/action/main/README.md
- https://raw.githubusercontent.com/changesets/action/main/publish/README.md
- https://api.github.com/repos/changesets/action/contents
- https://api.github.com/repos/changesets/action/releases
- https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry
