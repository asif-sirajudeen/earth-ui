// Per-release ledger of upstream shadcn changes that matter to earth-ui.
// Usage: pnpm upstream:ledger [to] [--from <version>]
//   from defaults to devDependencies.shadcn, to defaults to the latest shadcn@* tag.
// Needs network and an authenticated `gh`. Reads shadcn-ui/ui at each shadcn@* tag via
// the GitHub contents API (the compare API caps at 300 files, which hides the 4.21.0
// cn migration). Tracks four things per release:
//   - added components and changed .tsx in the base registry
//   - cn-* rule changes in style-nova.css (these change base-nova output without any .tsx
//     change); *-aria rules are for the React Aria base and are skipped
//   - packages/shadcn/src/tailwind.css, which we eject into styles.css
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { parseArgs } from "node:util"

const REPO = "shadcn-ui/ui"
const UI_DIR = "apps/v4/registry/bases/base/ui"
const STYLES_DIR = "apps/v4/registry/styles"
const NOVA = "style-nova.css"
const TAILWIND_DIR = "packages/shadcn/src"
const TAILWIND = "tailwind.css"

type Semver = [number, number, number]
type Snapshot = {
  ui: Map<string, string> // .tsx file name -> blob sha
  novaSha?: string
  tailwindSha?: string
}
export type Release = {
  from: string
  to: string
  added: string[]
  changed: string[]
  removed: string[]
  rules: RuleDiff
  tailwind: boolean
}
export type RuleDiff = { added: string[]; removed: string[]; changed: string[] }

const tagVersion = (tag: string) => tag.slice("shadcn@".length)
const parseSemver = (v: string): Semver =>
  v.split(".").map(Number) as unknown as Semver

export function compareSemver(a: string, b: string): number {
  const [x, y] = [parseSemver(a), parseSemver(b)]
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]
}

/** Plain `shadcn@x.y.z` tags only (no prereleases), sorted ascending. Returns versions. */
export function releaseVersions(refs: string[]): string[] {
  return refs
    .map((r) => /^refs\/tags\/shadcn@(\d+\.\d+\.\d+)$/.exec(r)?.[1])
    .filter((v): v is string => v !== undefined)
    .sort(compareSemver)
}

/** Flat `.cn-name { ... }` rules, keyed by name, bodies whitespace-normalised. Drops `*-aria` rules. */
// ponytail: regex over a flat rule list, no CSS parser. Breaks if upstream nests a block inside a .cn-* rule; swap in a parser then.
export function parseCnRules(css: string): Map<string, string> {
  const rules = new Map<string, string>()
  for (const m of css.matchAll(/\.(cn-[\w-]+)\s*\{([^{}]*)\}/g)) {
    const name = m[1] as string
    if (name.endsWith("-aria")) continue
    rules.set(name, (m[2] as string).replace(/\s+/g, " ").trim())
  }
  return rules
}

export function diffRules(
  prev: Map<string, string>,
  next: Map<string, string>
): RuleDiff {
  const names = (pick: (n: string) => boolean, from: Map<string, string>) =>
    [...from.keys()].filter(pick).sort()
  return {
    added: names((n) => !prev.has(n), next),
    removed: names((n) => !next.has(n), prev),
    changed: names((n) => prev.has(n) && prev.get(n) !== next.get(n), next),
  }
}

export function diffFiles(
  prev: Map<string, string>,
  next: Map<string, string>
) {
  const keys = (pick: (n: string) => boolean, from: Map<string, string>) =>
    [...from.keys()].filter(pick).sort()
  return {
    added: keys((n) => !prev.has(n), next),
    removed: keys((n) => !next.has(n), prev),
    changed: keys((n) => prev.has(n) && prev.get(n) !== next.get(n), next),
  }
}

// ---- network (gh) ----

function gh(args: string[]): string {
  for (let attempt = 1; ; attempt++) {
    try {
      return execFileSync("gh", ["api", ...args], {
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
        stdio: ["ignore", "pipe", "pipe"],
      })
    } catch (e) {
      const stderr = String((e as { stderr?: string }).stderr ?? "")
      if (stderr.includes("HTTP 404")) throw new Error("404")
      if (attempt === 3) throw new Error(`gh api ${args.join(" ")}: ${stderr}`)
    }
  }
}

type Entry = { name: string; sha: string }
function listDir(path: string, tag: string): Entry[] {
  try {
    return JSON.parse(gh([`repos/${REPO}/contents/${path}?ref=shadcn@${tag}`]))
  } catch (e) {
    if ((e as Error).message === "404") return []
    throw e
  }
}

const snapshots = new Map<string, Snapshot>()
function snapshot(tag: string): Snapshot {
  let s = snapshots.get(tag)
  if (!s) {
    const sha = (dir: string, file: string) =>
      listDir(dir, tag).find((e) => e.name === file)?.sha
    s = {
      ui: new Map(
        listDir(UI_DIR, tag)
          .filter((e) => e.name.endsWith(".tsx"))
          .map((e) => [e.name, e.sha])
      ),
      novaSha: sha(STYLES_DIR, NOVA),
      tailwindSha: sha(TAILWIND_DIR, TAILWIND),
    }
    snapshots.set(tag, s)
  }
  return s
}

const novaRules = (tag: string): Map<string, string> =>
  parseCnRules(
    gh([
      "-H",
      "Accept: application/vnd.github.raw",
      `repos/${REPO}/contents/${STYLES_DIR}/${NOVA}?ref=shadcn@${tag}`,
    ])
  )

function ledger(versions: string[]): Release[] {
  const out: Release[] = []
  for (let i = 1; i < versions.length; i++) {
    const [from, to] = [versions[i - 1] as string, versions[i] as string]
    const [a, b] = [snapshot(from), snapshot(to)]
    const files = diffFiles(a.ui, b.ui)
    out.push({
      from,
      to,
      ...files,
      rules:
        a.novaSha === b.novaSha
          ? { added: [], removed: [], changed: [] }
          : diffRules(novaRules(from), novaRules(to)),
      tailwind: a.tailwindSha !== b.tailwindSha,
    })
  }
  return out
}

const names = (xs: string[]) =>
  xs.map((x) => x.replace(/\.tsx$/, "")).join(", ")

export function formatRelease(r: Release): string {
  const lines: string[] = []
  if (r.added.length) lines.push(`  added components: ${names(r.added)}`)
  if (r.removed.length) lines.push(`  removed components: ${names(r.removed)}`)
  if (r.changed.length)
    lines.push(`  .tsx changed (${r.changed.length}): ${names(r.changed)}`)
  const { added, removed, changed } = r.rules
  if (added.length + removed.length + changed.length) {
    lines.push(
      `  cn rules: +${added.length} -${removed.length} ~${changed.length}`
    )
    if (added.length) lines.push(`    added: ${added.join(", ")}`)
    if (removed.length) lines.push(`    removed: ${removed.join(", ")}`)
    if (changed.length) lines.push(`    changed: ${changed.join(", ")}`)
  }
  if (r.tailwind)
    lines.push(`  tailwind.css changed (re-eject into styles.css)`)
  return [
    `${r.from} -> ${r.to}`,
    ...(lines.length ? lines : ["  no tracked changes"]),
  ].join("\n")
}

function main() {
  const { values, positionals } = parseArgs({
    options: { from: { type: "string" } },
    allowPositionals: true,
  })
  const pinned = (
    JSON.parse(readFileSync("package.json", "utf8")) as {
      devDependencies: Record<string, string>
    }
  ).devDependencies.shadcn
  const all = releaseVersions(
    gh([
      "--paginate",
      `repos/${REPO}/git/matching-refs/tags/shadcn@`,
      "--jq",
      ".[].ref",
    ]).split("\n")
  )
  const from = values.from ?? (pinned as string).replace(/^[\^~]/, "")
  const to = positionals[0] ?? (all.at(-1) as string)
  for (const v of [from, to])
    if (!all.includes(v)) throw new Error(`no shadcn@${v} tag upstream`)
  if (compareSemver(from, to) >= 0) {
    console.log(`shadcn ${from} is already at or past ${to}; nothing to list.`)
    return
  }
  const range = all.filter(
    (v) => compareSemver(v, from) >= 0 && compareSemver(v, to) <= 0
  )
  console.log(`# shadcn ${from} -> ${to} (${range.length - 1} releases)\n`)
  console.log(ledger(range).map(formatRelease).join("\n\n"))
}

if (import.meta.main) main()
