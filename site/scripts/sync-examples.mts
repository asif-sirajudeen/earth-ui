// Copies shadcn's base examples into site/examples, keeping those that work against earth-ui.
// Usage: pnpm --filter site sync-examples [ref]   (default: the git tag shadcn@<devDependencies.shadcn>, the single upstream pin)
// The pure keep/skip/rewrite rules live in classify(); the rest is I/O.

import { execFileSync } from "node:child_process"
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const PKG = "@asif-sirajudeen/earth-ui"

// Examples broken upstream (fail typecheck, or render wrong): name -> what is broken.
// Say it specifically enough to check whether upstream has fixed it, so the entry can be
// dropped on a later sync. Sync prints it under "upstream-bug".
export const SKIP: Record<string, string> = {
  "data-picker-with-dropdowns":
    "trigger puts ChevronDownIcon (ml-auto) before the label, so both render right-aligned",
  "calendar-hijri":
    'imports "react-day-picker/persian", which react-day-picker 10 no longer exports',
}

// An example may import only what the site can resolve: its own dependencies (and their subpaths).
const DEPS = new Set(
  Object.keys(
    JSON.parse(
      readFileSync(new URL("../package.json", import.meta.url), "utf8")
    ).dependencies
  )
)
const pkgName = (s: string) =>
  s
    .split("/")
    .slice(0, s.startsWith("@") ? 2 : 1)
    .join("/")
const allowed = (s: string) => DEPS.has(pkgName(s))

/** Upstream git tag for the pinned shadcn CLI version. */
export const pinTag = (pkg: { devDependencies?: Record<string, string> }) => {
  const v = pkg.devDependencies?.shadcn
  if (!v) throw new Error("devDependencies.shadcn is not set")
  return `shadcn@${v}`
}

/** Ref recorded in the examples README (`at <ref> (<sha>)`), or undefined. */
export const readmeRef = (readme: string) =>
  readme.match(/ at (\S+) \([0-9a-f]{40}\)/)?.[1]

/** Throws unless the examples README records the tag for `devDependencies.shadcn`. */
export function assertExamplesPin(
  readme: string,
  pkg: { devDependencies?: Record<string, string> }
): void {
  const recorded = readmeRef(readme)
  const want = pinTag(pkg)
  if (recorded !== want)
    throw new Error(
      `site/examples/README.md: examples synced at ${recorded} but devDependencies.shadcn needs ${want}; run pnpm --filter site sync-examples`
    )
}

const MAPPED: [RegExp, string][] = [
  [/^@\/styles\/base-(?:nova|rhea)\/ui\/([\w-]+)$/, `${PKG}/$1`],
  [
    /^@\/registry\/bases\/base\/hooks\/use-highlighted-code$/,
    `${PKG}/use-highlighted-code`,
  ],
]

const specifiers = (code: string) =>
  [
    ...code.matchAll(/(?<![\w$@-])(?:from|import)\s*\(?\s*["']([^"']+)["']/g),
  ].map((m) => m[1])

/** Returns { keep: true, code } with imports rewritten, or { keep: false, reason, detail? }; detail is the failing import or the SKIP note. */
export type Classified =
  | { keep: true; code: string }
  | { keep: false; reason: string; detail?: string }

export function classify(
  name: string,
  code: string,
  skip: Record<string, string> = SKIP
): Classified {
  if (skip[name])
    return { keep: false, reason: "upstream-bug", detail: skip[name] }
  const specs = specifiers(code)
  if (
    /-rtl$/.test(name) ||
    specs.some(
      (s) => s.includes("/ui-rtl/") || s === "@/components/language-selector"
    )
  )
    return { keep: false, reason: "rtl" }
  for (const s of specs) {
    if (MAPPED.some(([re]) => re.test(s)) || allowed(s)) continue
    return {
      keep: false,
      reason: s.startsWith("@/") ? "local-import" : "package",
      detail: s,
    }
  }
  let out = code
  for (const [re, to] of MAPPED)
    out = out.replace(
      new RegExp(`(["'])${re.source.slice(1, -1)}\\1`, "g"),
      (_, q: string, ...g: string[]) =>
        q + to.replace(/\$(\d)/g, (_m, i: string) => g[Number(i) - 1]) + q
    )
  return { keep: true, code: out }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dest = new URL("../examples/", import.meta.url)
  mkdirSync(dest, { recursive: true })
  const ref =
    process.argv[2] ??
    pinTag(
      JSON.parse(
        readFileSync(new URL("../../package.json", import.meta.url), "utf8")
      )
    )

  // Shallow, sparse fetch of only the examples and the license.
  const root = mkdtempSync(join(tmpdir(), "shadcn-"))
  const git = (...a: string[]) =>
    execFileSync("git", ["-C", root, ...a], { encoding: "utf8" }).trim()
  try {
    git("init", "-q")
    git("remote", "add", "origin", "https://github.com/shadcn-ui/ui.git")
    git(
      "sparse-checkout",
      "set",
      "--no-cone",
      "/apps/v4/examples/base/",
      "/LICENSE.md"
    )
    git("fetch", "-q", "--depth=1", "--filter=blob:none", "origin", ref)
    git("checkout", "-q", "FETCH_HEAD")
    sync(root, ref, git("rev-parse", "HEAD"), dest)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

function sync(root: string, ref: string, sha: string, dest: URL) {
  const src = `${root}/apps/v4/examples/base/`

  // Classify everything before touching dest, so a rule break leaves the old examples in place.
  const kept: [string, string][] = []
  // reason -> ["name (detail)"], printed so you can see what upstream has that we drop.
  const skipped: Record<string, string[]> = {}
  for (const f of readdirSync(src)
    .filter((f) => f.endsWith(".tsx"))
    .sort()) {
    const r = classify(f.slice(0, -4), readFileSync(src + f, "utf8"))
    if (r.keep) kept.push([f, r.code])
    else
      (skipped[r.reason] ??= []).push(
        r.detail ? `${f.slice(0, -4)} (${r.detail})` : f.slice(0, -4)
      )
  }
  const before = readdirSync(dest).filter((f) => f.endsWith(".tsx")).length
  if (kept.length < before / 2)
    throw new Error(
      `kept ${kept.length} of ${before} existing examples; check the MAPPED rules against upstream (skipped: ${JSON.stringify(Object.fromEntries(Object.entries(skipped).map(([k, v]) => [k, v.length])))})`
    )
  for (const f of readdirSync(dest))
    if (f.endsWith(".tsx")) rmSync(new URL(f, dest))
  for (const [f, code] of kept) writeFileSync(new URL(f, dest), code)
  const license = readFileSync(`${root}/LICENSE.md`, "utf8").trim()
  writeFileSync(
    new URL("README.md", dest),
    `# Examples

Copied from [shadcn-ui/ui](https://github.com/shadcn-ui/ui) \`apps/v4/examples/base\` at ${ref} (${sha}), with imports rewritten to \`${PKG}/<component>\`. Synced, not edited: change the rules in \`scripts/sync-examples.mts\` and re-sync. The ref is the git tag \`shadcn@<version>\` for \`devDependencies.shadcn\` in the root package.json; a test fails when they differ. To move, bump that pin, then run:

\`\`\`bash
pnpm --filter site sync-examples
\`\`\`

## License

${license}
`
  )
  console.log(`kept ${kept.length}`)
  for (const [k, v] of Object.entries(skipped))
    console.log(`skipped ${v.length} (${k}):\n  ${v.join("\n  ")}`)
}
