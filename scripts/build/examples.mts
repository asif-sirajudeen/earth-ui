// Builds dist/examples.json: every synced Example in site/examples, keyed by component.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const PKG = "@asif-sirajudeen/earth-ui"

export type Example = { name: string; code: string; imports: string[] }
export type ExamplesData = Record<string, Example[]>

/** Component owning an Example: longest registry name that is the file name or its `<name>-` prefix. */
export function componentFor(file: string, names: string[]): string | null {
  let best: string | null = null
  for (const n of names) {
    if (
      (file === n || file.startsWith(`${n}-`)) &&
      (!best || n.length > best.length)
    ) {
      best = n
    }
  }
  return best
}

/** Non-package, non-react, non-relative module specifiers, sorted and unique. */
export function externalImports(code: string): string[] {
  const found = new Set<string>()
  for (const m of code.matchAll(/(?:from|import)\s*["']([^"']+)["']/g)) {
    const spec = m[1]
    if (
      spec === "react" ||
      spec === PKG ||
      spec.startsWith(`${PKG}/`) ||
      spec.startsWith(".")
    ) {
      continue
    }
    found.add(spec)
  }
  return [...found].sort()
}

export function buildExamples(
  files: { name: string; code: string }[],
  names: string[]
): ExamplesData {
  const data: ExamplesData = {}
  for (const f of [...files].sort((a, b) => a.name.localeCompare(b.name))) {
    const owner = componentFor(f.name, names)
    if (!owner) continue
    ;(data[owner] ??= []).push({
      name: f.name,
      code: f.code,
      imports: externalImports(f.code),
    })
  }
  return Object.fromEntries(
    Object.entries(data).sort(([a], [b]) => a.localeCompare(b))
  )
}

export function readExampleFiles(dir = "site/examples") {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".tsx"))
    .sort()
    .map((f) => ({
      name: f.slice(0, -".tsx".length),
      code: readFileSync(join(dir, f), "utf8"),
    }))
}

export function registryNames(path = "registry.json"): string[] {
  const reg = JSON.parse(readFileSync(path, "utf8")) as {
    items: { name: string }[]
  }
  return reg.items.map((i) => i.name)
}

if (import.meta.main) {
  const data = buildExamples(readExampleFiles(), registryNames())
  mkdirSync("dist", { recursive: true })
  writeFileSync("dist/examples.json", `${JSON.stringify(data)}\n`)
  const n = Object.values(data).reduce((s, e) => s + e.length, 0)
  console.log(
    `dist/examples.json: ${n} examples, ${Object.keys(data).length} components`
  )
}
