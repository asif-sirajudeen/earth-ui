#!/usr/bin/env node
// earth-ui: look up earth-ui components from the installed package. JSON on stdout.
//   earth-ui list
//   earth-ui search <query> [--limit n]
//   earth-ui docs <name>
//   earth-ui source <name>
// Derives the Component Index from the bundled shadcn registry (dist/registry), the built
// .d.ts files and the docs shipped in @base-ui/react, so answers match the installed
// version and need no network.
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import { parseArgs } from "node:util"

import {
  docs,
  list,
  search,
  source,
  UnknownComponentError,
} from "./commands.mts"
import {
  buildComponentIndex,
  type IndexRegistryItem,
} from "./component-index.mts"

const USAGE =
  "Usage: earth-ui list | search <query> [--limit n] | docs <name> | source <name>"

// Paths are relative to the package root, one level up from dist/cli.js.
function readPackageFile(path: string): string | null {
  const url = new URL(`../${path}`, import.meta.url)
  return existsSync(url) ? readFileSync(url, "utf8") : null
}
const readJson = (path: string) => JSON.parse(readPackageFile(path)!)

const baseUiDocsDir = join(
  dirname(
    createRequire(import.meta.url).resolve("@base-ui/react/package.json")
  ),
  "docs/react/components"
)
function readBaseUiDoc(doc: string): string | null {
  const path = join(baseUiDocsDir, `${doc}.md`)
  return existsSync(path) ? readFileSync(path, "utf8") : null
}

const registry: { items: { name: string }[] } = readJson(
  "dist/registry/registry.json"
)
const items: IndexRegistryItem[] = registry.items.map(({ name }) =>
  readJson(`dist/registry/${name}.json`)
)
const index = buildComponentIndex(
  readJson("package.json"),
  items,
  readPackageFile,
  new Set(
    readdirSync(baseUiDocsDir)
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.slice(0, -3))
  )
)

function run(): unknown {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: { limit: { type: "string" } },
  })
  const [command, ...rest] = positionals
  const arg = rest.join(" ")
  if (command === "list") return list(index)
  if (command === "search" && arg) {
    const limit = values.limit === undefined ? undefined : Number(values.limit)
    if (limit !== undefined && (!Number.isInteger(limit) || limit < 1))
      throw new Error("--limit must be a positive integer")
    return search(index, arg, limit)
  }
  if (command === "docs" && arg) return docs(index, arg, readBaseUiDoc)
  if (command === "source" && arg) return source(index, arg)
  throw new Error(USAGE)
}

try {
  console.log(JSON.stringify(run(), null, 2))
} catch (error) {
  const { message } = error as Error
  const suggestions =
    error instanceof UnknownComponentError ? error.suggestions : undefined
  console.error(JSON.stringify({ error: message, suggestions }, null, 2))
  process.exitCode = 1
}
