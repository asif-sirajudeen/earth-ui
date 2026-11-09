#!/usr/bin/env node
// earth-ui: look up earth-ui components from the installed package. JSON on stdout.
//   earth-ui list
//   earth-ui search <query> [--limit n]
//   earth-ui docs <name>
// Reads dist/agent/index.json (the Component Index) and the docs shipped in @base-ui/react,
// so answers match the installed version and need no network.
import { existsSync, readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import { parseArgs } from "node:util"

import type { ComponentIndex } from "../scripts/component-index.mts"
import { docs, list, search, UnknownComponentError } from "./commands.mts"

const USAGE = "Usage: earth-ui list | search <query> [--limit n] | docs <name>"

const index: ComponentIndex = JSON.parse(
  readFileSync(new URL("./agent/index.json", import.meta.url), "utf8")
)

function readBaseUiDoc(doc: string): string | null {
  const root = dirname(
    createRequire(import.meta.url).resolve("@base-ui/react/package.json")
  )
  const path = join(root, "docs/react/components", `${doc}.md`)
  return existsSync(path) ? readFileSync(path, "utf8") : null
}

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
