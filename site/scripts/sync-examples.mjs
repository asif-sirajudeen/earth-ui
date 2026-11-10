// Copies shadcn's base examples into site/examples, keeping those that work against earth-ui.
// Usage: node scripts/sync-examples.mjs <shadcn-checkout> [sha]
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
export const SKIP = {}

const ALLOWED = new Set([
  "react",
  "lucide-react",
  "sonner",
  "recharts",
  "react-day-picker",
  "react-day-picker/locale",
  "cn",
  "input-otp",
  "embla-carousel-react",
  "next/link",
  "next/image",
])
const allowed = (s) =>
  ALLOWED.has(s) || s.startsWith("@base-ui/react") || s.startsWith("@shadcn/react/")

const MAPPED = [
  [/^@\/styles\/base-(?:nova|rhea)\/ui\/([\w-]+)$/, `${PKG}/$1`],
  [
    /^@\/registry\/bases\/base\/hooks\/use-highlighted-code$/,
    `${PKG}/use-highlighted-code`,
  ],
]

const specifiers = (code) =>
  [...code.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)].map((m) => m[1])

/** Returns { keep: true, code } with imports rewritten, or { keep: false, reason }. */
export function classify(name, code, skip = SKIP) {
  if (skip[name]) return { keep: false, reason: skip[name] }
  const specs = specifiers(code)
  if (
    /-rtl$/.test(name) ||
    specs.some((s) => s.includes("/ui-rtl/") || s === "@/components/language-selector")
  )
    return { keep: false, reason: "rtl" }
  for (const s of specs) {
    if (MAPPED.some(([re]) => re.test(s)) || allowed(s)) continue
    return { keep: false, reason: s.startsWith("@/") ? "local-import" : "package" }
  }
  let out = code
  for (const [re, to] of MAPPED)
    out = out.replace(
      new RegExp(`(["'])${re.source.slice(1, -1)}\\1`, "g"),
      (_, q, ...g) => q + to.replace(/\$(\d)/g, (_m, i) => g[i - 1]) + q
    )
  return { keep: true, code: out }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [root, sha = DEFAULT_SHA] = process.argv.slice(2)
  if (!root) throw new Error("usage: sync-examples.mjs <shadcn-checkout> [sha]")
  const src = `${root}/apps/v4/examples/base/`
  const dest = new URL("../examples/", import.meta.url)
  mkdirSync(dest, { recursive: true })
  for (const f of readdirSync(dest))
    if (f.endsWith(".tsx")) rmSync(new URL(f, dest))

  let kept = 0
  const skipped = {}
  for (const f of readdirSync(src).filter((f) => f.endsWith(".tsx")).sort()) {
    const r = classify(f.slice(0, -4), readFileSync(src + f, "utf8"))
    if (r.keep) {
      writeFileSync(new URL(f, dest), r.code)
      kept++
    } else skipped[r.reason] = (skipped[r.reason] ?? 0) + 1
  }
  const license = readFileSync(`${root}/LICENSE.md`, "utf8").trim()
  writeFileSync(
    new URL("README.md", dest),
    `# Examples

Copied from [shadcn-ui/ui](https://github.com/shadcn-ui/ui) \`apps/v4/examples/base\` at ${sha}, with imports rewritten to \`${PKG}/<component>\`. Synced, not edited: change the rules in \`scripts/sync-examples.mjs\` and re-sync.

\`\`\`bash
node site/scripts/sync-examples.mjs <path-to-shadcn-checkout> ${sha}
\`\`\`

## License

${license}
`
  )
  console.log(`kept ${kept}`)
  for (const [k, v] of Object.entries(skipped)) console.log(`skipped ${v} (${k})`)
}
