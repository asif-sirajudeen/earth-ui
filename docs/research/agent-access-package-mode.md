# Research: how should AI coding agents search and use earth-ui when it is consumed as an npm package?

As of: 2026-11-09

Scope: package-mode consumers (`import { Button } from "@asif-sirajudeen/earth-ui"`), not shadcn-registry copy mode. Read-only research. Re-evaluates the "no custom CLI" verdict in `registry-docs-and-cli.md` (section B), which was about install, not about agent search. Not repeated here: `registry-docs-and-cli.md`, `registry-research.md`, `registry-implementation-research.md`, `registry-plan-validation.md`, `coss-registry-lazy-loading.md`.

Claim tags: [source] read in primary docs or code, [verified] I ran it or read the file locally, [inferred] my reasoning. Web summaries were produced by a fetch tool and I did not read the raw pages; quotes are from its output.

## TL;DR

| Question | Verdict | Effort | Smallest first step |
|---|---|---|---|
| Is there a shadcn-based npm-package library with an agentic CLI to copy? | **No.** I found none (limit: web search only). The closest CLI model is Ant Design's `antd` CLI (not shadcn): offline, `--format json` on every command, ships a SKILL.md. The only shadcn-on-Base-UI npm package found, `@neynar/ui`, has `llms.txt` and per-component `.md` but no CLI, and its repo is archived. | n/a | n/a |
| Do shadcn's own agent surfaces work in package mode? | **Mostly no.** `info --json` works. `search`/`view`/`mcp` work against `@earth-ui` but return copy-mode answers (source, `shadcn add`). The shadcn skill actively tells agents to `add` source. `docs` only knows the official index. | n/a | Do not recommend the shadcn skill to package consumers. |
| What can be generated from existing artifacts? | List, titles, descriptions, import paths, part names (from `dist/*.d.ts` exports), CVA variants, deps, links. **Props come free from Base UI**: `@base-ui/react` is a direct dependency and ships `docs/react/components/*.md` with API tables, version-matched. | Small | Parse `registry.json` plus `dist/components/*.d.ts` at build time into one JSON index. |
| What must be authored? | Usage examples in earth-ui terms, composition rules (Dialog needs a Title, etc.), setup block. Base UI demos use raw Tailwind, not earth-ui parts. | Medium (10 components fast) | One 30-line AGENTS.md block plus examples for the 10 most used components. |
| CLI vs MCP vs shipped docs | **Shipped, version-matched docs plus an AGENTS.md pointer is the highest-evidence layer** (Vercel eval: 100% vs 53% baseline, 79% skill with explicit instructions). A small in-package CLI is a good second layer because it adds search and JSON and extracts only the needed props section. MCP last. | see below | see Verdict |
| Verdict | **1. Generated per-component docs + AGENTS.md block. 2. `earth-ui` bin in the same package (4 commands, offline). 3. SKILL.md. 4. MCP only on demand.** | ~1 day, then ~1 to 2 days | Build script that emits `agent/index.json` and `agent/components/<name>.md`, and a 15-line AGENTS.md block pointing at it. |

## 1. How peers serve agents

Rows are package-based libraries. "Shipped docs" means docs inside the npm tarball.

| Library | MCP | CLI | llms.txt / .md | Shipped docs in package | Skill | Evidence |
|---|---|---|---|---|---|---|
| shadcn/ui | `shadcn mcp`, 7 tools (copy mode) | `search`/`list`, `view`, `docs --json`, `info --json`, `add` | per-component `.md` URLs | n/a (copy model) | Yes, `skills/shadcn` | [source: [CLI docs](https://ui.shadcn.com/docs/cli), [skills docs](https://ui.shadcn.com/docs/skills), [SKILL.md](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/SKILL.md)], [verified: `shadcn --help` for each command] |
| Ant Design | Yes, `antd mcp` (8 tools, 2 prompts) | Yes, `antd list/info/doc/demo/token/lint/migrate/setup`, `--format json` on every command, "fully offline", metadata ships with the CLI | llms.txt, llms-full.txt, per-component `.md` | CLI package ships the metadata | Yes, `skills/antd/SKILL.md` in the CLI repo; prompt tells agents to read it first | [source: [for-agents](https://ant.design/docs/react/for-agents.md), [CLI repo](https://github.com/ant-design/ant-design-cli)] |
| MUI | Yes, `@mui/mcp`, stdio via `npx -y @mui/mcp@latest`; tools `useMuiDocs`, `fetchDocs` | No | Page sidebar lists llms.txt | Not found | Not found | [source: [MUI MCP page](https://mui.com/material-ui/getting-started/mcp/)] |
| Chakra UI | Yes, `@chakra-ui/react-mcp`; `list_components`, `get_component_props`, `get_component_example`, theme and migration tools | Sidebar lists "CLI" | LLMs.txt page | Not found | Yes, 3 skills (`chakra-ui-builder`, `-migrate`, `-refactor`), `npx skills add` | [source: [MCP](https://chakra-ui.com/docs/get-started/ai/mcp-server), [skills](https://chakra-ui.com/docs/get-started/ai/skills)] |
| Mantine | Not found | No | `llms.txt` index, one `.md` per component (`/llms/core-accordion.md`), `llms-full.txt` | Not found | Not found | [source: [mantine.dev/llms.txt](https://mantine.dev/llms.txt)] |
| HeroUI v3 | Yes, `@heroui/react-mcp`; `list_components`, `get_component_docs`, `get_component_source_code`, `get_component_source_styles`, `get_theme_variables`, `get_docs` | Not covered on the page | Not covered | Not found | Not found | [source: [HeroUI MCP](https://www.heroui.com/docs/react/getting-started/mcp-server)] |
| Ark UI | Yes, `@ark-ui/mcp`, stdio; `list_components`, `list_examples`, `get_example`, `styling_guide` | No | llms.txt, llms-full.txt, per framework | Not found | Not found | [source: [Ark MCP](https://ark-ui.com/docs/ai/mcp-server), search result for llms.txt] |
| Base UI | Not official (community `base-ui-mcp-server` exists) | No | `llms.txt`: 79 entries, all `.md` links, no MCP/skills mention | **Yes**: `@base-ui/react@1.9.0` tarball has `docs/react/**` (80 files, 3.9 MB, API tables included) | No | [verified: `ls node_modules/@base-ui/react/docs`; `accordion.md` is 56 KB with `## API reference`], [source: [llms.txt](https://base-ui.com/llms.txt)] |
| React Aria | Yes, `@react-aria/mcp` (third-party listings name the package differently; I did not resolve it) | No | llms.txt, `.md` on every page, "Copy for LLM" | Not found | Yes, `npx skills add https://react-aria.adobe.com` | [source: [react-aria.adobe.com/ai](https://react-aria.adobe.com/ai)] |
| Radix, Tamagui | No official MCP or llms.txt found by search | No | Not found | Not found | Not found | [inferred: absence in search results, not checked on their sites] |
| Next.js (framework, not UI, but the strongest data point) | Yes (dev-server MCP) | `next` CLI helpers | `/docs/llms.txt`, `.md` per page | **Yes**: `node_modules/next/dist/docs/`, plus a managed `AGENTS.md` block that tells the agent to read it before coding | Yes, for workflows not for lookups | [source: [Next.js AI agents guide](https://nextjs.org/docs/app/guides/ai-agents)] |

Patterns.

- Hosted-docs-over-MCP is the common library choice (MUI, Chakra, HeroUI, Ark, React Aria). Ant Design is the only one that put the data in a CLI first and made the MCP a mode of that CLI [source].
- Only Base UI and Next.js ship version-matched docs in the tarball [source/verified]. For earth-ui that is already free: Base UI's docs arrive with the dependency.
- Skills are installed by `npx skills add` and copied into the project. Claude Code loads skills from enterprise, personal, project (`.claude/skills`), nested, `--add-dir` and plugin locations. **`node_modules` is not a skill location** [source: [Claude Code skills docs](https://code.claude.com/docs/en/skills)]. TanStack Intent ships `skills/<name>/SKILL.md` inside npm packages and has a CLI that scans `node_modules` and writes task-to-skill mappings into the agent's config file [source: [TanStack Intent](https://tanstack.com/intent) via search summary; alpha].
- **shadcn-based npm-package libraries with an agentic CLI: none found.** `@neynar/ui` ("complete set of shadcn/ui components, rebuilt on Base UI primitives with Tailwind CSS v4"): `llms.txt`, `llms-full.txt` (~16k lines), an `llm/` folder of per-component `.md`, no CLI, repo archived [source: [github.com/neynarxyz/ui](https://github.com/neynarxyz/ui)]. BaseX UI is on Base UI plus StyleX (not shadcn), claims a CLI and a 10-tool MCP, but I only saw a search snippet [not verified]. The earlier registry peers (coss, basecn, materialcn, magicui) have no CLI at all (`registry-docs-and-cli.md` B3). Earth-ui would be among the first in this niche [inferred].

## 1b. shadcn's agent surfaces, for a package-mode consumer

| Surface | What it does | Works in package mode? |
|---|---|---|
| `shadcn info --json` | Project framework, Tailwind version, aliases, installed components, doc link templates | **Yes, partly.** I ran it in a blank folder with only a `package.json`: it printed `config: null`, `components: []` and the shadcn doc links [verified]. It tells nothing about earth-ui. Useful for Tailwind version and framework detection only. |
| `shadcn search`/`list` (`-q`, `-t`, `-l`, `-o`, `--json`) | Searches registries listed in `components.json` or given as args | **Partly.** Works against `@earth-ui` if the consumer registered the namespace, which package-mode users will not have. Returns registry names, not import paths [verified: `--help`; behavior against `@earth-ui` is [inferred]]. |
| `shadcn view <items>` | Prints registry item JSON including source | Misleading. Shows the copy-mode `@/components/button` imports (`registry-docs-and-cli.md` A1) [verified: `--help` has no `--json`]. |
| `shadcn docs <names> --json` | Doc and API links for components, `--base base\|radix\|aria` | Official index only; `@earth-ui` names are not found [source: `registry-docs-and-cli.md` B1]. |
| `shadcn mcp` | 7 tools to search, view and get `add` commands | Same limits as search and view. Needs a namespace, ends in `shadcn add` [source]. |
| shadcn skill (`npx skills add shadcn/ui`) | Rules for forms, composition, icons; runs `info --json`; tells the agent to `search` first and `docs` before using a component | **Counter-productive.** Its premise: "Components are added as source code to the user's project via the CLI." It limits tools to `shadcn@latest` commands and tells agents to rewrite third-party registry imports [source: [SKILL.md](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/SKILL.md)]. Its composition rules (Field, Dialog title) are a good template for earth-ui's own rules. |

## 2. What an agent needs, and where it can come from

Local facts [verified]: `dist/` is 696 KB, 128 files (64 `.js` + 64 `.d.ts`), 67 registry items, `public/r` is gitignored and not in the npm `files` list (`dist`, `styles.css`).

| Need | Source today | Gap |
|---|---|---|
| Component list, title, one-line description | `registry.json` / `registry/metadata.ts` (hand-written, one entry per item) | None. Neither file is in the tarball, so a build step must copy the data in. |
| Import path | Derivable: `@asif-sirajudeen/earth-ui` root or `/<name>` subpath (`exports` map `./*` → `dist/components/*`) | None. A few modules are subpath-only (`sonner`, `use-highlighted-code`; README). Mark them. |
| Exported parts (compound parts) | Last line of `dist/components/<name>.d.ts`, e.g. `export { Dialog$1 as Dialog, DialogClose, DialogContent, ... }` | None for names. Mechanical parse. |
| Variant props | CVA literal types appear in the `.d.ts`: `variant?: "default" \| "destructive" \| ...` and `size?: ...` for `button` [verified] | Only components using CVA. |
| Full props per part | The earth-ui `.d.ts` says only `Dialog.Title.Props` or `Accordion.Trigger.Props`, a reference to Base UI types, **not the props themselves** [verified: `accordion.d.ts`, `dialog.d.ts`] | Props live in `@base-ui/react/docs/react/components/<name>.md` under `## API reference` / `### Root` etc., with Prop, Type, Default, Description tables [verified: `accordion.md`]. `meta.links.api` already points to the hosted copy of that file for 59 of 67 items [verified]. The local copy is version-matched; the URL is not. |
| Peer / dependency info | `registry.json` `dependencies`; `package.json` `peerDependencies` | None. |
| Setup (CSS order, dark mode, optional subpaths) | README sections "CSS setup", "Dark mode", "Optional subpaths" | Move into a machine-readable form. |
| Usage examples in earth-ui terms | **Not present.** Base UI demos import `Accordion.Root` with raw classes, not `Accordion`/`AccordionItem`. `meta.links.examples` are shadcn URLs (copy mode). | Must be authored. |
| Composition rules | **Not present.** | Must be authored (nesting, required Title/Description for Dialog, Field wrappers for forms, icon usage). shadcn's skill is a template. |
| Search keywords/synonyms ("modal" → dialog) | Not present | Optional authored `keywords` in `registry/metadata.ts`. |

Caveats.

- Base UI docs are large: 56 KB for Accordion, mostly demos [verified]. An agent that opens the whole file burns tokens. A CLI or generated extract that returns only the API tables is the main token win [inferred].
- With pnpm, `@base-ui/react` is not at `node_modules/@base-ui/react` for the consumer, because it is a transitive dependency. Resolve it from the earth-ui package location with `createRequire(import.meta.url).resolve("@base-ui/react/package.json")`. A raw path in AGENTS.md can fail, as TanStack notes for pnpm [source: search summary; inferred for this repo].
- Wrapper-specific behavior (earth-ui's own classes, defaults) is in the earth-ui `.js` only. Agents rarely need it.

## 3. CLI vs MCP vs shipped docs vs skill

| | Shipped docs + AGENTS.md block | In-package CLI (`earth-ui`) | MCP server | SKILL.md |
|---|---|---|---|---|
| Install friction | None: files arrive with the package; one block in AGENTS.md | None beyond the package (`npx earth-ui`, or `pnpm exec`) | Per agent config (`claude mcp add ...`, JSON for Cursor/Codex/Copilot) | `npx skills add` copies it; Claude Code does not read it from `node_modules` [source] |
| Agent support | Any agent that reads AGENTS.md or can read files. Next.js says Claude Code, Codex, Cursor and GitHub Copilot read `AGENTS.md` [source: Next.js guide]; agents.md lists 20+ tools [source: [agents.md](https://agents.md)] | Any agent with a shell | Needs MCP support per client. Claude Code, Cursor, Codex, Copilot, Windsurf, Zed, VS Code all appear in peers' setup pages [source: HeroUI, Ark, Chakra pages] | Claude Code natively; others via the `skills` tool [source] |
| Token cost | Index in AGENTS.md is always-loaded context; keep to ~8 KB (Vercel compressed 40 KB to 8 KB without losing pass rate) [source] | Only the command output; zero standing cost beyond one AGENTS.md line [inferred] | Tool definitions load up front in most clients, which Anthropic says "occupy more context window space" [source: [Anthropic engineering](https://www.anthropic.com/engineering/code-execution-with-mcp)]. 4 to 7 tools is small but non-zero [inferred] | Description only until used (progressive disclosure) [source: Claude Code docs], but skills often are not invoked: 56% of Vercel eval cases never called the skill [source] |
| Offline | Yes | Yes if data is bundled (Ant Design does this) [source] | Local stdio servers can be, but peers' servers fetch docs [Ark, React Aria pages do not say; unclear] | Yes |
| Version-matched | **Exactly**, it is in the tarball | Exactly if bundled | Matches the server version, which is pinned by `@latest` in most install lines, so can drift from the project's installed version [inferred]. Ant Design's MCP accepts `--version` [source] | Copied at install time, so can go stale [inferred] |
| Maintenance | Generate at build; no runtime | A bin plus build step; ~200 lines of Node | Dependency on `@modelcontextprotocol/sdk`, one more transport to test | Hand-written, drifts unless generated |
| Evidence | Vercel's Next.js evals: baseline 53%, skill 53% (default) or 79% (explicit instructions), `AGENTS.md` docs index 100%. Next.js therefore ships docs in the package and says "Framework knowledge comes from the bundled docs, not from Skills" [source: [Vercel post](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals) via fetch summary, [Next.js guide](https://nextjs.org/docs/app/guides/ai-agents)] | Ant Design's pattern; no eval found | No eval found comparing MCP vs CLI for a UI library | Same Vercel numbers; skills are for workflows, not lookups [source] |

The Vercel numbers come from one Next.js eval suite, so treat them as direction, not proof for a component library [inferred].

Anthropic found no head-to-head "CLI vs MCP" post in my search [not found]; the cost argument above is from the code-execution post. My CLI-over-MCP preference is therefore reasoning, not evidence [inferred].

Re-evaluating "no custom CLI". The earlier verdict rejected a CLI because `shadcn add` already installs. That reasoning does not apply here: in package mode there is nothing to install, and shadcn tooling gives copy-mode answers (section 1b). A CLI whose job is search and API lookup is new value, not a wrapper [inferred]. Still, the CLI is the second layer, not the first: docs on disk plus an AGENTS.md pointer have the best evidence, and the CLI reads the same files.

## 4. Minimal CLI design

One principle: everything is generated at build time into files inside the tarball; the CLI is a thin reader. No network, no `shadcn` dependency, Node >= 22 (matches `engines`), `node:util` `parseArgs` for flags [verified: `engines.node >=22`; `parseArgs` is in Node stdlib].

### Commands

| Command | Purpose | Data source |
|---|---|---|
| `earth-ui list [--json]` | All components, one line each | `agent/index.json` (generated from `registry.json` plus `dist/*.d.ts`) |
| `earth-ui search <query> [--json] [--limit n]` | Rank by name, title, description, part names, optional `keywords` | Same index. Plain token match, no dependency. |
| `earth-ui docs <name> [--json] [--props]` | Import, parts, variants, usage, composition rules, props | Index entry, `agent/components/<name>.md` (authored), and the `## API reference` section sliced out of Base UI's `.md` |
| `earth-ui setup [--json] [--agents]` | CSS lines, peers, dark mode, optional subpaths; `--agents` writes the managed AGENTS.md block | Static `agent/setup.json` |

Skip: `add` (nothing to copy), `init`, `diff`, `view`. Add later only on demand: `earth-ui doctor` (check CSS import order and peers in the consumer project), `earth-ui mcp` (stdio wrapper over the same four functions).

### JSON shapes (proposed)

`list --json`:

```json
{
  "package": "@asif-sirajudeen/earth-ui",
  "version": "0.2.2",
  "components": [
    {
      "name": "accordion",
      "title": "Accordion",
      "description": "Vertically stacked headings that each expand to reveal a section of content.",
      "import": "@asif-sirajudeen/earth-ui/accordion",
      "exports": ["Accordion", "AccordionContent", "AccordionItem", "AccordionTrigger"],
      "type": "ui"
    }
  ]
}
```

`search "modal" --json`: same item shape plus `"score": number`, sorted by score, `limit` default 10.

`docs dialog --json`:

```json
{
  "name": "dialog",
  "title": "Dialog",
  "description": "Modal window over the page, for focused tasks.",
  "import": { "root": "@asif-sirajudeen/earth-ui", "subpath": "@asif-sirajudeen/earth-ui/dialog" },
  "parts": [
    { "export": "DialogTrigger", "baseUi": "Dialog.Trigger", "props": "see baseUiDocs#Trigger" },
    { "export": "DialogTitle", "baseUi": "Dialog.Title" }
  ],
  "variants": null,
  "composition": ["DialogContent must contain a DialogTitle.", "Wrap triggers in DialogTrigger."],
  "example": "<Dialog>...</Dialog>",
  "dependencies": ["@base-ui/react", "lucide-react"],
  "optionalPeers": [],
  "links": { "baseUiDocs": "<resolved local path>", "api": "https://base-ui.com/react/components/dialog.md" },
  "props": { "Root": [ { "name": "open", "type": "boolean", "default": "-", "description": "..." } ] }
}
```

Each field's source: `exports` and `variants` from `.d.ts`; `dependencies` from `registry.json`; `links.api` from `meta.links.api`; `props` sliced from Base UI `.md` at runtime; `composition` and `example` authored [all inferred design].

`setup --json`: `{ "css": ["@import \"tailwindcss\";", "@import \"@asif-sirajudeen/earth-ui/styles.css\";"], "order": "tailwind first", "peers": {"required": ["react@^19","react-dom@^19","tailwindcss@^4"], "optional": ["next-themes","shiki","sonner"]}, "darkMode": ".dark class on an ancestor" }`. Source: README facts [verified in README].

### Build step

`scripts/build-agent-index.mts`, run after `tsdown` in `build`:

1. Read `registry.json` (already derived from `src/` by `scripts/build-registry.mts`) for name, title, description, dependencies, `meta.links` [verified: file exists with these fields].
2. For each `dist/components/<name>.d.ts`, parse the final `export { A$1 as A, B }` line for exported names; regex for CVA `variant?:` / `size?:` literal unions; collect `X.Y.Props` references for the Base UI part map [verified these shapes in `accordion`, `button`, `dialog` `.d.ts`; regex robustness is [inferred]].
3. Merge with authored `agent/components/<name>.md` (examples, composition).
4. Emit `dist/agent/index.json` and `dist/agent/components/<name>.md`. Add `agent` to `files` (or emit under `dist`, which already ships).
5. Test: one `node --test` that every registry item has an index entry and every export in the `.d.ts` appears (the repo already uses `node --test scripts/*.test.mts`) [verified].

Props at runtime: resolve `@base-ui/react/package.json` from the CLI's own location, read `docs/react/components/<base-name>.md`, return text from `## API reference` on [verified path shape; pnpm resolution [inferred]]. Fallback when absent: return `links.api`.

### How it ships

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| `bin` in `@asif-sirajudeen/earth-ui` (`"bin": {"earth-ui": "./dist/cli.js"}`) | Version-matched to the code by construction; one release train; works offline with `pnpm exec earth-ui`; no second package | Adds a `bin` and a build entry to the library; `npx earth-ui` without install fetches the whole package (696 KB `dist`, fine) | **Choose this** [inferred] |
| Separate `@asif-sirajudeen/earth-ui-cli` | Keeps library tarball clean | Version skew with the library, second package to publish and pin; the data must then ship in the CLI, duplicating it | Reject (kibo-ui and ai-elements wrappers were separate because they wrapped `shadcn`; this one does not) |

The bin must not pull heavy dependencies into the library: use only Node stdlib. Mark the `bin` file executable with a shebang through the `tsdown` entry [inferred; not tried].

### How agents discover it

Discovery is the real risk: skills were not invoked in 56% of eval cases, whereas a block in `AGENTS.md` always loads [source: Vercel]. So:

1. `earth-ui setup --agents` (and README) writes a managed block to the consumer's `AGENTS.md`, the way Next.js does between `BEGIN`/`END` markers [source: Next.js guide]:

```md
<!-- BEGIN:earth-ui-agent-rules -->
## earth-ui
UI uses `@asif-sirajudeen/earth-ui` (npm package, not copied source). Do not run `shadcn add`.
Before writing UI: `npx earth-ui search <need> --json`, then `npx earth-ui docs <name> --json`.
Import from `@asif-sirajudeen/earth-ui` or `.../<name>`. Setup: `npx earth-ui setup`.
<!-- END:earth-ui-agent-rules -->
```

2. Optional: ship `skills/earth-ui/SKILL.md` in the tarball (TanStack Intent layout) and document `npx skills add` for Claude Code users who want a skill. Content: the same rules plus composition rules. This is the shadcn-skill equivalent for package mode.
3. Do not rely on a bare path into `node_modules` in AGENTS.md; use the CLI as the resolver (pnpm layout) [inferred].

## 5. Verdict, ranked

| Rank | Approach | Effort | Why |
|---|---|---|---|
| 1 | **Generated per-component `.md` + one `index.json` shipped in the package, plus a short AGENTS.md block** | ~1 day for the generator; ~1 more for examples and composition rules of the 10 most used components [inferred estimates] | Best evidence (always-loaded pointer beats on-demand retrieval); exact version match; works with every agent. Base UI's props come free from its shipped docs. |
| 2 | **`earth-ui` bin in the same package: `list`, `search`, `docs`, `setup`** (all `--json`) | ~1 to 2 days on top of rank 1, since it reads the same files | Answers the user's goal (agents search and implement). Adds search, JSON and prop extraction (cuts a 56 KB Base UI page to its API tables). No network. Ant Design validates the shape. |
| 3 | SKILL.md shipped in `skills/` and documented for `npx skills add` | Half a day | Only helps Claude Code-style skill users; lower invocation rate than AGENTS.md. Reuse the rank 1 content. |
| 4 | `earth-ui mcp` (stdio, wraps the same functions) | Half a day once the CLI exists | Only if users ask. Do not build a separate hosted MCP: it costs hosting and drifts from the installed version. |
| Skip | Pointing agents at `shadcn mcp`/`shadcn` skill; a hosted `llms.txt` as the only channel | n/a | Copy-mode answers (section 1b). A hosted `llms.txt` is a good add when the site exists, but it is not version-matched. |

Smallest first step: add `scripts/build-agent-index.mts` that emits `dist/agent/index.json` from `registry.json` and the `.d.ts` export lines, and a 15-line AGENTS.md block in the README. Then check by running an agent on "build a settings form with earth-ui" and counting tool calls. If agents still fail to find props, add the `docs` command (rank 2).

## Unverified

- No shadcn-based npm-package library with an agentic CLI was found; the search was via a general web tool and may have missed small packages. BaseX UI's CLI/MCP claims are from a search snippet only.
- `shadcn search @earth-ui` in a package-mode project was not run (registry not hosted).
- The Vercel eval numbers and the Next.js guide were read through a fetch summarizer (the Next.js page content was returned in full, the Vercel post as a summary).
- Radix and Tamagui: absence of official MCP/llms.txt comes from search results only.
- React Aria's npm package name: two names appear in sources; the official AI page says `@react-aria/mcp`.
- Whether peers' MCP servers read bundled or hosted data was not stated on their pages (Ark, React Aria, MUI).
- The `.d.ts` parsing approach was inspected on three files (`accordion`, `button`, `dialog`), not all 64. Base-part mapping for components that wrap non-Base-UI libraries (calendar, carousel, chart, command) will need manual entries.
- pnpm resolution of `@base-ui/react` from a consumer project, `bin` build via `tsdown`, and all effort estimates are [inferred], not tried.
- Claude Code skill docs were read to character 100,000 of 118,986; the remainder was not read.
