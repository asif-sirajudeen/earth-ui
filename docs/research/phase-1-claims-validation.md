# Phase 1 claims validation

As of: 2026-11-06
Validates: `docs/specs/phase-1-package.md`
Method: four research passes against primary sources only (official docs, source code, npm registry metadata, first-party changelogs). Where docs were silent, claims were tested empirically in a scratch directory with the real tools: tsdown 0.23.7, rolldown 1.3.0, esbuild 0.28.2, tsup 9.0.0, Tailwind CLI 4.3.4, shadcn CLI 4.23.0, Node 24.15.0, npm 11.12.1.

## Summary

Most claims hold. Six findings change the spec:

1. **`"use client"` everywhere is wrong.** Exports of a `"use client"` module become client references, so a server component cannot call `buttonVariants()`. shadcn marks only Label. Base UI's own modules already carry the directive.
2. **The export map does not match tsdown's output.** By default tsdown emits `.mjs` and `.d.mts`, so a map pointing at `.js` and `.d.ts` fails with TS2307 and `ERR_MODULE_NOT_FOUND`.
3. **`styles.css` must include shadcn's `body` base rule.** Without it, Label, Input text and the outline and ghost Buttons render black text on a dark background in dark mode.
4. **The release workflow needs the four-job trusted-publishing shape.** It also needs `access: "public"`, and "npm publish" ticked under Allowed actions. Configurations created after Sep 3, 2026 allow only staged publish by default, and staged publish does not work with Changesets.
5. **Components should come from the shadcn CLI, not manual copies.** A hand-written `components.json` plus `shadcn add --diff` pulls upstream changes into the library.
6. **The `files` field and explicit `./styles.css` and `./package.json` exports are missing.** Without `files`, the tarball ships `src` and the config files.

## Build and package shape

| Claim | Verdict | Evidence | Source |
| --- | --- | --- | --- |
| tsup is unmaintained and recommends tsdown | Confirmed | "This project is not actively maintained anymore. Please consider using tsdown instead." | [tsup README](https://github.com/egoist/tsup#readme) |
| tsdown `unbundle` maps files 1:1 | Confirmed | "a one-to-one mapping of your source files to output files". Test: 4 sources gave 4 `.mjs` and 4 `.d.mts`. | [tsdown unbundle](https://tsdown.dev/options/unbundle), test |
| `unbundle` keeps `"use client"` per file | Confirmed | Test: every unbundled file that had the directive kept it, and `utils` without it gained none. Rolldown keeps directives when "`output.preserveModules` is enabled". tsdown sets `preserveModules: unbundle`. | [Rolldown directives](https://rolldown.rs/in-depth/directives), tsdown `src/features/rolldown.ts`, test |
| Bundled builds keep the directive only on the entry | Confirmed by test | tsdown and esbuild bundled builds: the directive survives only when the entry has it. Every build warns `[MODULE_LEVEL_DIRECTIVE]`, even when the directive is kept. | test; [esbuild 0.17.19](https://github.com/evanw/esbuild/blob/main/CHANGELOG-2023.md) is about minify only |
| Next.js tells library authors to mark entry points | Confirmed | "add the `"use client"` directive to entry points that rely on client-only features"; "some bundlers might strip out `"use client"` directives". | [Next.js third-party components](https://nextjs.org/docs/app/getting-started/server-and-client-components#third-party-components) |
| The `./*` export map with `.js`/`.d.ts` works | **Contradicted for tsdown defaults** | tsdown's default `platform: 'node'` enables `fixedExtension`, which emits `.mjs`/`.d.mts`. The claimed map gave TS2307 under bundler, node16 and nodenext resolution, and `ERR_MODULE_NOT_FOUND` in Node. It works with `fixedExtension: false`. Node docs: `types` "should always be included first". | [tsdown how it works](https://tsdown.dev/guide/how-it-works), [Node subpath patterns](https://nodejs.org/api/packages.html#subpath-patterns), [TS modules reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html#example-subpath-patterns), test |
| `"sideEffects": ["*.css"]` enables tree-shaking | Confirmed | Webpack: a CSS file imported for its side effect "needs to be added to the side effect list". Turbopack source reads `sideEffects` and prefixes slash-free globs with `**/`. The Next.js docs do not mention it. | [webpack tree shaking](https://webpack.js.org/guides/tree-shaking/), vercel/next.js `turbopack/crates/turbopack-ecmascript/src/chunk/placeable.rs` |
| Plate uses tsdown | Partly | It pins `tsdown` 0.16.6 but builds bundled (no `unbundle`), and its published packages are headless. That is weak precedent for our setup. | [plate package.json](https://github.com/udecode/plate/blob/main/package.json), [plate tsdown config](https://github.com/udecode/plate/blob/main/tooling/config/tsdown.config.ts) |

Extra findings:

- `exports: true` in tsdown rewrites `package.json` with mirrored paths (`./components/button`), string shorthand and no `types` condition. Write the export map by hand instead ([tsdown package exports](https://tsdown.dev/options/package-exports)).
- tsdown bundles devDependencies into `dist` "if they are actually imported". Runtime libraries must be in `dependencies` or `peerDependencies` ([tsdown dependencies](https://tsdown.dev/options/dependencies)).
- Without `files`, `npm pack` ships everything: 13 files in the test, against 7 with `"files": ["dist"]` ([npm package.json files](https://docs.npmjs.com/cli/configuring-npm/package-json#files)).
- `"./*"` matches any subpath, including CSS. Declare `./styles.css` and `./package.json` explicitly.
- tsdown CSS handling is experimental. Ship `styles.css` as a plain file, not through tsdown ([tsdown CSS](https://tsdown.dev/options/css)).

## Styling, theme and components

| Claim | Verdict | Evidence | Source |
| --- | --- | --- | --- |
| Tailwind v4 skips gitignored files and `node_modules` | Confirmed | Scans every file "except… Files in your `.gitignore`… Files in the `node_modules` directory". Test agrees. | [Tailwind detecting classes](https://tailwindcss.com/docs/detecting-classes-in-source-files), test |
| `@source` in a package stylesheet resolves relative to that file | Confirmed (CLI) | With `@source "./dist"`, `.bg-primary`, `.hover\:bg-primary\/90` and `.size-\[37px\]` were generated; without it, none were. Decoys outside `dist` were not picked up. In source, `at-import.ts` sets the base to the imported file's directory. | test with `@tailwindcss/cli` 4.3.4, tailwindcss `packages/tailwindcss/src/{at-import,index}.ts` |
| A wrong `@source` path fails loudly | **Contradicted** | `@source "./nope"` gave no error and scanned the whole package root. Use an exact glob. | test |
| shadcn v4 theming: `:root`/`.dark`, `@theme inline`, `@custom-variant dark (&:is(.dark *))` | Confirmed | Doc text and CLI output agree. | [shadcn theming](https://ui.shadcn.com/docs/theming), CLI run |
| Base UI has been shadcn's default since July 2026; `base-nova` exists | Confirmed | "Starting today, Base UI is the default component library in shadcn/ui" (2026-07-02). The CLI writes `"style": "base-nova"`. | [changelog 2026-07](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default), CLI run |
| Button, Input and Label sources | Confirmed, with detail | Button imports `@base-ui/react/button`, `class-variance-authority` and `cn`. Input imports `@base-ui/react/input` and `cn`. Label is a plain `<label>` that imports only `cn`. All set `data-slot`. None uses `forwardRef`. **Only Label carries `"use client"`.** | [button.json](https://ui.shadcn.com/r/styles/base-nova/button.json), [input.json](https://ui.shadcn.com/r/styles/base-nova/input.json), [label.json](https://ui.shadcn.com/r/styles/base-nova/label.json), CLI run |
| Registry `dependencies` are complete | **Contradicted** | All three items list only `["cn"]`, so the package must declare `@base-ui/react` and `class-variance-authority` itself. | registry JSON above |
| `cn` replaced clsx + tailwind-merge | Confirmed | "Every shadcn component now imports `cn` from the `cn` package." Latest is 0.5.2, MIT, `engines.node >=22`. It is Tailwind v4 only: "On Tailwind v3, stay with tailwind-merge v2." | [changelog 2026-09](https://ui.shadcn.com/docs/changelog/2026-09-cn), [cn on npm](https://registry.npmjs.org/cn) |
| React 19 ref-as-prop | Confirmed | No `forwardRef`. React 19: "New function components will no longer need `forwardRef`." So the effective React peer is `^19`, even though Base UI accepts `^17`. | [React 19 blog](https://react.dev/blog/2024/12/05/react-19) |
| `@base-ui/react` peers | Confirmed | 1.9.0: `react`/`react-dom` `^17 \|\| ^18 \|\| ^19`; `date-fns`, `@date-fns/tz` and `@types/react` optional. Its own modules ship `'use client'`. | [npm registry](https://registry.npmjs.org/@base-ui/react) |
| Base UI composes with `render`, not `asChild` | Confirmed | "Use the `render` prop to compose a Base UI part with your own React components." | [Base UI composition](https://base-ui.com/react/handbook/composition) |
| shadcn is MIT | Confirmed | "Copyright (c) 2023 shadcn… shall be included in all copies or substantial portions of the Software." | [shadcn LICENSE](https://raw.githubusercontent.com/shadcn-ui/ui/main/LICENSE.md), [OSI MIT](https://opensource.org/license/mit) |
| next-themes uses the `.dark` class | Confirmed | `attribute="class"` sets `class="dark"` on `<html>`. It needs `<html suppressHydrationWarning>`. | [next-themes README](https://registry.npmjs.org/next-themes) |
| `tw-animate-css` and `lucide-react` are unnecessary for these three | Confirmed | A grep found no animation or `data-open` variants. Builds with and without `tw-animate-css` and `shadcn/tailwind.css` produced the same component selectors. | CLI run, test |

What shadcn's generated CSS includes that the plan left out:

| Item | Impact if omitted | Decision |
| --- | --- | --- |
| `@layer base { body { @apply bg-background text-foreground } }` | **Breaks dark mode**: inherited text stays black | Ship it |
| `* { @apply border-border outline-ring/50 }` | None for these components | Ship it anyway, to match shadcn |
| Radius scale (`--radius-sm` … `--radius-4xl` as multiples of `--radius`) | Cosmetic: falls back to Tailwind defaults | Ship it |
| Geist font, `--font-sans`, `html { font-sans }` | Cosmetic | Leave out; the consumer's font applies |
| `@import "tw-animate-css"`, `@import "shadcn/tailwind.css"` | None for these three | Leave out until animated or `data-open` components arrive |
| `@import "tailwindcss"` | Double preflight if both files import it | The consumer imports it; `styles.css` does not |

## shadcn workflow

- **Pull components with the CLI.** A hand-written `components.json` (`style: base-nova`, `rsc: true`) plus `shadcn add button input label` writes the three files and adds only `cn`. Do not run `init` inside the library, because it rewrites the CSS and adds lucide, tw-animate-css and shadcn as dependencies (CLI run).
- **Check for upstream changes with `shadcn add <name> --diff`.** `diff` is "[DEPRECATED] Use `add [component] --diff`". In the test, the old command missed a local edit (`shadcn --help`, CLI run).
- **`rsc: true` keeps directives that are already in the registry source,** which here means Label only. `rsc: false` strips them. The docs' wording ("automatically adds") does not match what the CLI did ([components.json docs](https://ui.shadcn.com/docs/components-json), CLI run).
- **The `init` flag is `-b base -p nova`.** `-p base-nova` is rejected: "Invalid preset: base-nova". `base-nova` is the style name written to `components.json`.
- **Publishing to npm is our own extension.** shadcn documents only an internal monorepo: a private `@workspace/ui` exporting raw `.tsx` from `src/components`, with Turborepo and `apps/web`. It says nothing for or against npm. The intro calls shadcn "how you build your component library" ([shadcn monorepo](https://ui.shadcn.com/docs/monorepo)).

## Release and publishing

| Claim | Verdict | Evidence | Source |
| --- | --- | --- | --- |
| Changesets 3.0.x; private packages not versioned by default | Confirmed | Latest 3.0.3. "By default, Changesets will not version or tag private packages." `ignore` is "designed for temporary use". | [npm](https://registry.npmjs.org/@changesets/cli), [config](https://changesets.dev/guide/config) |
| `changesets/action` v2: Version PR, then publish | Partly | Compatible with v3. With trusted publishing, the docs say to "set up the individual sub-actions instead": `select-mode`, `version`, `pack` and `publish` jobs, with `permissions: {}` at the top and `id-token: write` only on `publish`. | [changesets/action](https://github.com/changesets/action), [automating](https://changesets.dev/guide/automating) |
| The package must exist before trusted publishing | Confirmed | `npm trust`: "Package must exist: The package you're configuring must already exist on the npm registry." | [npm trust](https://docs.npmjs.com/cli/v12/commands/npm-trust) |
| Trusted publishing requirements | Confirmed | npm ≥ 11.5.1, Node ≥ 22.14.0, GitHub-hosted runners only, workflow file must exist, first publish within 2 days, recommended "Require two-factor authentication and disallow tokens". | [trusted publishers](https://docs.npmjs.com/trusted-publishers) |
| Node 24 ships npm 11; Node 22 does not | Confirmed | 24.22.2 ships npm 11.19.1; 24.5.0 is the first Node 24 with npm ≥ 11.5.1. Every Node 22 ships npm 10.x. Node 26 became Active LTS on 2026-10-28, and Node 24 entered maintenance on 2026-10-20. | [Node index.json](https://nodejs.org/dist/index.json), [Node release schedule](https://github.com/nodejs/Release) |
| Provenance is automatic | Confirmed, with conditions | Generated with trusted publishing from a public repo for a public package; no `--provenance` flag needed. | [trusted publishers](https://docs.npmjs.com/trusted-publishers) |
| Unpublish policy | Corrected | Versions can never be reused. Within 72 hours, unpublish is allowed if nothing depends on the package. After 72 hours, all of these must hold: no dependents, fewer than 300 downloads in the last week, and a single owner. | [npm unpublish policy](https://docs.npmjs.com/policies/unpublish) |
| Peer dependencies auto-install | Confirmed | npm ≥ 7 installs peers; pnpm `autoInstallPeers` defaults to `true` (since v8). | [npm package.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-json), [pnpm settings](https://pnpm.io/settings/peer-dependencies) |
| Scoped packages need `--access public` | Partly; npm docs conflict | About scopes: "Scoped packages are private by default". The `npm publish` docs: "Default: 'public' for new packages". Changesets always passes `--access`, and its config defaults to `restricted`, so set `"access": "public"`. | [about scopes](https://docs.npmjs.com/about-scopes), [npm publish](https://docs.npmjs.com/cli/v12/commands/npm-publish), [changesets config](https://changesets.dev/guide/config) |
| Personal scope = npm username | Confirmed | "you are granted a scope that matches your user or organization name". Free public scoped packages are inferred, not stated. | [about scopes](https://docs.npmjs.com/about-scopes) |
| A manual publish with 2FA prompts for an OTP | Confirmed | npm prompts when `--otp` is not set. | [npm publish](https://docs.npmjs.com/cli/v12/commands/npm-publish) |

Extra release requirements:

- **Allowed actions:** configurations created after Sep 3, 2026 default to `npm stage publish`. Tick **npm publish**, because "Staged Publishing does not work with Changesets" ([trusted publishers](https://docs.npmjs.com/trusted-publishers), [changesets automating](https://changesets.dev/guide/automating)).
- **`repository.url`:** it "must exactly match your GitHub repository", including case.
- **Repo setting:** enable "Allow GitHub Actions to create and approve pull requests" so the action can open the Version PR ([GitHub Actions settings](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository)).
- **Workflow settings:** `persist-credentials: false` on checkout, and `package-manager-cache: false` on setup-node ([changesets automating](https://changesets.dev/guide/automating)).
- **Tool versions:** Changesets v3 requires Node `^22.11 || ^24 || >=26` and pnpm ≥ 10 ([migration](https://changesets.dev/guide/migration)).
- **pnpm publishes in a pnpm repo.** pnpm docs say provenance is attached under trusted publishing; the minimum pnpm version for OIDC is unverified ([pnpm publish](https://pnpm.io/cli/publish)).
- **Mismatches fail at publish time.** A trusted-publisher mismatch fails with E404 or ENEEDAUTH, and npm does not validate the configuration when it is saved.

## Still unverified

- `@source` resolution with `@tailwindcss/vite` and `@tailwindcss/postcss`. Only the CLI was tested.
- Directive handling of shared chunks in multi-entry bundled builds. This does not matter with `unbundle`.
- The minimum pnpm version that supports npm trusted publishing.
- That public scoped packages are free. This is inferred from npm docs, not stated.

## Housekeeping

One validation command wrote outside the scratch directory: `cp src/index.ts /tmp/x`. The file landed at `/tmp/x/index.ts` and was then deleted. Any earlier file at that path was overwritten.
