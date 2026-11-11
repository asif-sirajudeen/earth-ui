// Detects drift between our component source and what the pinned shadcn CLI installs.
//
//   pnpm upstream:check
//
// For every registry item, runs `shadcn add <item> --view` (files) and `--dry-run` (deps), formats each upstream
// file with our prettier config, and diffs it against ours. Formatting-only differences are not drift.
// Needs the network (shadcn resolves items from ui.shadcn.com). Exits 1 on drift.
import { execFile, spawn } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"

import { topLevelPackage } from "../lib/derive-deps.mts"

const exec = promisify(execFile)

export type UpstreamFile = { path: string; status: string; body: string }

/** Pulls each file out of the boxed `shadcn add --view` output. */
export function extractFiles(output: string): UpstreamFile[] {
  const files: UpstreamFile[] = []
  let current: UpstreamFile | undefined
  let inBox = false
  for (const line of output.split("\n")) {
    const head = line.match(/^├ (\S+) \((\w+)\) \d+ lines?$/)
    if (head) {
      current = { path: head[1]!, status: head[2]!, body: "" }
      files.push(current)
      inBox = false
    } else if (current && line.startsWith("│ ┌")) inBox = true
    else if (current && line.startsWith("│ └")) inBox = false
    else if (current && inBox) current.body += line.replace(/^│ │ ?/, "") + "\n"
  }
  return files
}

const bareName = (spec: string) =>
  topLevelPackage(spec.replace(/(?<=.)@.*$/, ""))

/** Package names from the dry-run "Dependencies" list (`+ react-day-picker@latest` -> `react-day-picker`). */
export function extractDeps(output: string): string[] {
  const deps: string[] = []
  let inDeps = false
  for (const line of output.split("\n")) {
    if (line.startsWith("├ Dependencies")) inDeps = true
    else if (inDeps && line.startsWith("│ + "))
      deps.push(bareName(line.slice(4).trim()))
    else if (inDeps) break
  }
  return deps
}

/** null when equal, else one unified-diff hunk spanning the changed lines. */
export function drift(upstreamFormatted: string, ours: string): string | null {
  if (upstreamFormatted === ours) return null
  const up = upstreamFormatted.split("\n")
  const our = ours.split("\n")
  let start = 0
  while (start < up.length && start < our.length && up[start] === our[start])
    start++
  let end = 0
  while (
    end < up.length - start &&
    end < our.length - start &&
    up[up.length - 1 - end] === our[our.length - 1 - end]
  )
    end++
  const removed = our.slice(start, our.length - end)
  const added = up.slice(start, up.length - end)
  return [
    `@@ -${start + 1},${removed.length} +${start + 1},${added.length} @@`,
    ...removed.map((l) => `-${l}`),
    ...added.map((l) => `+${l}`),
  ].join("\n")
}

/** Upstream deps (by name) that we do not declare and have not allowlisted. */
export function missingDeps(
  upstream: readonly string[],
  ours: ReadonlySet<string>,
  allow: ReadonlySet<string>
): string[] {
  return upstream.filter((d) => !ours.has(d) && !allow.has(d))
}

// Upstream deps we deliberately do not declare. "item:dep" -> reason.
const ALLOWED_DEPS: Record<string, string> = {
  "calendar:date-fns":
    "react-day-picker lists date-fns as its own dependency, so it installs transitively",
}

const format = (path: string, code: string) =>
  new Promise<string>((done, fail) => {
    const p = spawn("node_modules/.bin/prettier", ["--stdin-filepath", path])
    let out = ""
    p.stdout.on("data", (d) => (out += d))
    p.on("error", fail)
    p.on("close", (c) =>
      c === 0 ? done(out) : fail(new Error(`prettier failed on ${path}`))
    )
    p.stdin.end(code)
  })

const shadcn = async (item: string, flag: string) =>
  (
    await exec("node_modules/.bin/shadcn", ["add", item, flag], {
      maxBuffer: 32 * 1024 * 1024,
    })
  ).stdout

async function main() {
  type Item = {
    name: string
    type: string
    dependencies?: string[]
    registryDependencies?: string[]
  }
  const items: Item[] = JSON.parse(readFileSync("registry.json", "utf8")).items
  const byName = new Map(items.map((i) => [`@earth-ui/${i.name}`, i]))
  // `style` is our own token item; upstream's version scaffolds src/lib/utils.ts, which we replace with the cn package.
  const names = items
    .filter((i) => i.type !== "registry:style")
    .map((i) => i.name)

  // Upstream's dry-run lists the deps of the whole closure (button for calendar), so compare against ours the same way.
  const ourDeps = (item: Item, seen = new Set<string>()): Set<string> => {
    for (const d of item.dependencies ?? []) seen.add(bareName(d))
    for (const r of item.registryDependencies ?? []) {
      const dep = byName.get(r)
      if (dep) ourDeps(dep, seen)
    }
    return seen
  }

  const files = new Map<string, string>()
  const depWarnings: string[] = []
  const queue = [...names]
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      for (let name = queue.shift(); name; name = queue.shift()) {
        const [view, dry] = await Promise.all([
          shadcn(name, "--view"),
          shadcn(name, "--dry-run"),
        ])
        for (const f of extractFiles(view)) files.set(f.path, f.body)
        const allow = new Set(
          Object.keys(ALLOWED_DEPS)
            .filter((k) => k.startsWith(`${name}:`))
            .map((k) => k.slice(name.length + 1))
        )
        const missing = missingDeps(
          extractDeps(dry),
          ourDeps(byName.get(`@earth-ui/${name}`)!),
          allow
        )
        if (missing.length)
          depWarnings.push(`${name}: upstream depends on ${missing.join(", ")}`)
      }
    })
  )

  let drifted = 0
  for (const [path, body] of [...files].sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    if (!existsSync(path)) {
      drifted++
      console.log(`DRIFT ${path}: upstream installs it, we have no such file`)
      continue
    }
    // Format ours too, so a hand-reflowed file with the same tokens is not drift.
    const d = drift(
      await format(path, body),
      await format(path, readFileSync(path, "utf8"))
    )
    if (d) {
      drifted++
      console.log(`DRIFT ${path}\n--- ours\n+++ upstream\n${d}\n`)
    }
  }
  for (const w of depWarnings.sort()) console.warn(`WARN ${w}`)
  console.log(`${drifted} drifted of ${files.size} files`)
  if (drifted) process.exit(1)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main()
