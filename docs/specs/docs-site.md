# Spec: Docs site generated from the registry

Status: implemented (steps 1-5)
As of: 2026-11-10
Research: `docs/research/registry-docs-and-cli.md` (section A). This spec supersedes these parts of it:

- **Data source.** The research reads `public/r/*.json` directly. Commit `19948db` added the `earth-ui` CLI. Its `docs <name>` and `source <name>` already return everything the reference half of a page needs. The site reads the CLI output instead.
- **Install mode.** The research leads with `shadcn add`. README and CONTEXT.md make package mode primary, so pages lead with `pnpm add` and the import path. Copy mode comes second.
- **Demos.** The research imports demos from `src/` and rewrites the paths. Demos import the workspace package instead, so no rewrite is needed. Demos are out of v1.
- **Section B (CLI).** That section is moot. The CLI shipped as a lookup tool, not an installer.

## Goal

Publish one docs page per component. Each page is generated from data the repo already builds, with no hand-written content in v1. The same deploy also hosts the copy-mode registry at `/r/*.json`.

## Constraint: minimal change

No file in `src/`, `cli/`, `scripts/` or `registry/` changes. Changes to existing files are limited to config: `pnpm-workspace.yaml`, `.gitignore`, `eslint.config.mjs` and `ci.yml`. Everything else is new and lives under `site/` or is a new workflow.

## Data path

```
pnpm build                          # existing: dist/ + dist/registry + dist/cli.js
node site/scripts/gen.mjs           # new: CLI JSON -> site/content/docs/components/*.mdx (gitignored)
cp -r dist/registry site/public/r   # dist/registry is byte-identical to public/r (verified with diff -rq)
next build (output: "export")       # -> site/out
```

`gen.mjs` runs `node dist/cli.js list`, then `docs <name>` and `source <name>` for each name. It uses the JSON contract that CI already smokes and does not import `cli/*.mts` internals. If about 130 spawns prove slow, it can import `buildComponentIndex` instead.

Each page is laid out as follows:

| Section | From |
|---|---|
| Frontmatter `title`, `description` | `docs.title`, `docs.description` (written with `JSON.stringify` so YAML quoting is safe) |
| Install (package mode) | `pnpm add @asif-sirajudeen/earth-ui`, plus `import { ...exports } from "<docs.import>"`. Note the root import when `rootImport` is true. |
| Install (copy mode) | `npx shadcn@latest registry add @earth-ui=https://asif-sirajudeen.github.io/earth-ui/r/{name}.json`, then `npx shadcn@latest add @earth-ui/<name>` |
| Parts | `docs.exports` |
| Variants | `docs.variants` as a table. The section is omitted when the value is null. |
| Dependencies | `docs.dependencies` |
| API reference | `docs.props` verbatim, under a note that the tables use **Base UI part names** (Root, Trigger), not earth-ui exports. Link to `links.api`. The section is omitted when `props` is null. |
| Source | `source.files[]` as fenced `tsx` blocks. Use a 4-backtick fence if a file contains a triple backtick. |

Checks already done:

- The `## API reference` sections in `@base-ui/react@1.9.0` docs have no bare `<`, `{` or `}` outside code, so they are MDX-safe. Verified over all 37 files.
- The CLI omits `style` and `use-mobile`. Both are skipped in v1.
- GFM tables are on by default in fumadocs-mdx.

## Layout

```
pnpm-workspace.yaml            # + packages: ["site"]
site/
  package.json                 # private: true
  next.config.mjs              # createMDX({ output: "export", basePath: "/earth-ui", env: { NEXT_PUBLIC_BASE_PATH } })
  postcss.config.mjs
  tsconfig.json
  scripts/gen.mjs              # I/O; ignores for generated dirs live in the root .gitignore (Prettier reads only that one)
  scripts/render-page.mjs      # pure page layout, tested by render-page.test.mjs
  app/global.css
  app/layout.tsx
  app/docs/layout.tsx
  app/docs/[[...slug]]/page.tsx   # generateStaticParams -> source.generateParams()
  app/api/search/route.ts         # revalidate = false; staticGET
  components/{provider,search,mdx}.tsx
  lib/{source,layout.shared}.ts
  content/docs/index.mdx          # committed: intro, CSS setup (copied from README)
```

Start from the `create-fumadocs-app` "Next.js + Fumadocs MDX + static" template, then drop `og/`, `llms*.txt` and `(home)`.

`site/package.json` dependencies:

- `@asif-sirajudeen/earth-ui@workspace:*`
- `fumadocs-core@16.18.4`
- `fumadocs-ui@16.18.4`
- `fumadocs-mdx@15.5.3`
- `next@16.4.6`
- `react` and `react-dom` ^19
- dev: `tailwindcss` ^4, `@tailwindcss/postcss`, `@types/mdx`

Scripts: `"build": "node scripts/gen.mjs && next build"`, with the same prefix on `dev`.

`app/global.css`:

```css
@import "tailwindcss";
@import "@asif-sirajudeen/earth-ui/styles.css";
@import "fumadocs-ui/css/shadcn.css";
@import "fumadocs-ui/css/preset.css";
```

`fumadocs-ui` defines only `--color-fd-*` variables, so nothing collides with earth-ui tokens. `shadcn.css` maps those variables onto `--background`, `--primary` and `--sidebar-*`, which `styles.css` already defines (16 `--sidebar` and 3 `--destructive` declarations). The site uses the earth-ui theme. Dark mode works because `RootProvider` uses next-themes with `attribute: "class"`, which matches `.dark`.

## Known traps

- **Search under basePath.** fumadocs-core resolves its default search URL to `/api/search` under Next, ignoring `basePath`. Pass `useStaticSearch({ from: \`${process.env.NEXT_PUBLIC_BASE_PATH}/api/search\` })`.
- **Raw links.** A raw `<a href="/...">` skips `basePath`. Use `next/link`.
- **Changesets.** Changesets 3.0.3 defaults `privatePackages` to `{ version: false, tag: false }`, so `private: true` is enough and `ignore` stays empty. Never name `site` in a changeset file.
- **Lockfile.** `pnpm install --frozen-lockfile` in CI now also installs the site dependencies. Commit the lockfile change in the same PR.
- **Lint and format.** Root `eslint .` would lint `site/.next` and `site/out`. Add `site/.next/**`, `site/out/**`, `site/.source/**` and `site/content/docs/components/**` to the ESLint ignores. Prettier 3 respects `.gitignore` by default, so the generated MDX is skipped. Root `tsc` includes only `src`, so `site/` needs nothing there.
- **Dev loop.** A change to a component needs `pnpm build`, then a rerun of `gen.mjs`. Next's dev watcher does not cover this.

## Deploy

New `.github/workflows/pages.yml`, triggered on push to `main`:

1. Install dependencies.
2. `pnpm build`.
3. `cp -r dist/registry site/public/r`.
4. `pnpm --filter site build`.
5. `actions/upload-pages-artifact@v5` with `path: site/out`.
6. `actions/deploy-pages@v5`, with `pages: write` and `id-token: write`.

Also use `actions/configure-pages@v6`. Pin each action to a SHA, as the existing workflows do. No `.nojekyll` file is needed, because Actions-source Pages does not run Jekyll.

Add one step to `ci.yml`, after "Build package and smoke the CLI": `pnpm --filter site build`. A PR that breaks the site then fails CI.

One-time manual step (maintainer): in the repo settings, set Pages, then Source, to "GitHub Actions".

## Steps (each one verifiable)

1. Scaffold `site/` and add the workspace entry. `pnpm --filter site build` produces `site/out/docs/index.html`.
2. `gen.mjs`. `site/out/docs/components/dialog/index.html` exists, and its Base UI props table renders.
3. Configure search with `basePath`. In `npx serve site/out` (served under `/earth-ui`), search returns "Dialog".
4. Add the `/r` copy. `site/out/r/registry.json` and `site/out/r/button.json` exist. Run `registry:smoke` against them.
5. Add `pages.yml` and the CI step. After merge, `https://asif-sirajudeen.github.io/earth-ui/docs/components/button` returns 200.
6. **Follow-up, separate PR (touches `registry/metadata.ts`).** Point `meta.links.docs` at the site URLs and drop the placeholder `examples` links. Then run `pnpm registry:check`.

## Out of v1

- Live demos. Later: `site/examples/<name>-demo.tsx`, which `gen.mjs` embeds when the file exists. The empty, untracked `registry/examples/` folder is not used by any script. Leave it alone or delete it.
- Hand-written prose per component.
- Pages for `style` (theming) and `use-mobile`.
- A custom domain, the directory PR, `registry:example` items and Open in v0.

## Open decision

**Host.** This spec assumes GitHub Pages at `asif-sirajudeen.github.io/earth-ui` with `basePath: "/earth-ui"`. A custom domain or Vercel would remove `basePath` and the search workaround. Settle the host before step 6, because consumers' `components.json` keeps whatever registry URL they first add.

## Unverified

Verified locally on 2026-11-10: the site builds, gen writes 65 pages in about 6s, `styles.css` resolves through `workspace:*`, `useStaticSearch({ from })` exists, the static search index is served under `/earth-ui`, and Changesets bumps only `@asif-sirajudeen/earth-ui`.

Still open:

- Browser behaviour: the search dialog, styles and dark mode.
- The `/earth-ui/` root redirect. It is client-side only, so it needs JS.
- `registry:smoke` against `site/out/r`. Not run. `dist/registry` is byte-identical to `public/r` (`diff -rq`), which the smoke already covers.
- The Pages deploy itself.
- The Linux CI path. Nothing has been pushed yet, so the disabled esbuild postinstall and the `@next/swc-linux-*` binaries are untested.
