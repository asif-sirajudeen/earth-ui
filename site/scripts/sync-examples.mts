// Copies shadcn's base examples into site/examples, keeping those that work against earth-ui.
// Usage: node scripts/sync-examples.mts <shadcn-checkout> [sha]
// The pure keep/skip/rewrite rules live in classify(); the rest is I/O.

import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { pathToFileURL } from "node:url"

export const DEFAULT_SHA = "8ab27715521cbd4f87ae6886cd989cbb678f6de7"
const PKG = "@asif-sirajudeen/earth-ui"

// Examples that fail typecheck against earth-ui (upstream drift): name -> reason.
export const SKIP: Record<string, string> = {}

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

const MAPPED: [RegExp, string][] = [
  [/^@\/styles\/base-(?:nova|rhea)\/ui\/([\w-]+)$/, `${PKG}/$1`],
  [
    /^@\/registry\/bases\/base\/hooks\/use-highlighted-code$/,
    `${PKG}/use-highlighted-code`,
  ],
]

const specifiers = (code: string) =>
  [...code.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)].map(
    (m) => m[1]
  )

/** Returns { keep: true, code } with imports rewritten, or { keep: false, reason }. */
export type Classified =
  { keep: true; code: string } | { keep: false; reason: string }

export function classify(
  name: string,
  code: string,
  skip: Record<string, string> = SKIP
): Classified {
  if (skip[name]) return { keep: false, reason: skip[name] }
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
  const [root, sha = DEFAULT_SHA] = process.argv.slice(2)
  if (!root) throw new Error("usage: sync-examples.mts <shadcn-checkout> [sha]")
  const src = `${root}/apps/v4/examples/base/`
  const dest = new URL("../examples/", import.meta.url)
  mkdirSync(dest, { recursive: true })

  // Classify everything before touching dest, so a rule break leaves the old examples in place.
  const kept: [string, string][] = []
  const skipped: Record<string, number> = {}
  for (const f of readdirSync(src)
    .filter((f) => f.endsWith(".tsx"))
    .sort()) {
    const r = classify(f.slice(0, -4), readFileSync(src + f, "utf8"))
    if (r.keep) kept.push([f, r.code])
    else skipped[r.reason] = (skipped[r.reason] ?? 0) + 1
  }
  const before = readdirSync(dest).filter((f) => f.endsWith(".tsx")).length
  if (kept.length < before / 2)
    throw new Error(
      `kept ${kept.length} of ${before} existing examples; check the MAPPED rules against upstream (skipped: ${JSON.stringify(skipped)})`
    )
  for (const f of readdirSync(dest))
    if (f.endsWith(".tsx")) rmSync(new URL(f, dest))
  for (const [f, code] of kept) writeFileSync(new URL(f, dest), code)
  const license = readFileSync(`${root}/LICENSE.md`, "utf8").trim()
  writeFileSync(
    new URL("README.md", dest),
    `# Examples

Copied from [shadcn-ui/ui](https://github.com/shadcn-ui/ui) \`apps/v4/examples/base\` at ${sha}, with imports rewritten to \`${PKG}/<component>\`. Synced, not edited: change the rules in \`scripts/sync-examples.mts\` and re-sync.

\`\`\`bash
node site/scripts/sync-examples.mts <path-to-shadcn-checkout> ${sha}
\`\`\`

## License

${license}
`
  )
  console.log(`kept ${kept.length}`)
  for (const [k, v] of Object.entries(skipped))
    console.log(`skipped ${v} (${k})`)
}
