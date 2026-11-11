// What every command runs against: the Component Index plus the package data the CLI reads
// at startup. loadContext does the file I/O; commands stay pure functions over a Context.
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"

import {
  buildComponentIndex,
  type ComponentIndex,
  type IndexPackageJson,
  type IndexRegistryItem,
} from "./lib/component-index.mts"
import type { ExamplesData } from "./lib/examples-data.mts"
import type { Part } from "./lib/props.mts"

export type Context = {
  index: ComponentIndex
  pkg: IndexPackageJson
  partsData: Record<string, Part[]>
  examplesData: ExamplesData
  readBaseUiDoc: (doc: string) => string | null
}

export type Flags = {
  limit?: string
  full?: boolean
  raw?: boolean
  json?: boolean
  tty: boolean
}

export type Command = {
  name: string
  /** Usage line, for example "earth-ui docs <name> [--full]". */
  usage: string
  description: string
  /** Arguments of the `help` example line, for example "dialog". */
  exampleArgs: string
  needsArg: boolean
  flags?: Record<string, { type: "string" | "boolean"; short?: string }>
  /** Pure over the context. A string prints as is; anything else prints as JSON. */
  run: (
    ctx: Context,
    arg: string,
    flags: Flags,
    commands: readonly Command[]
  ) => unknown
}

/** Reads the package files next to `dist/cli.js` (`metaUrl` is the entry's `import.meta.url`). */
export function loadContext(metaUrl: string): Context {
  // Paths are relative to the package root, one level up from dist/cli.js.
  function readPackageFile(path: string): string | null {
    const url = new URL(`../${path}`, metaUrl)
    return existsSync(url) ? readFileSync(url, "utf8") : null
  }
  const readJson = (path: string) => JSON.parse(readPackageFile(path)!)

  const baseUiDocsDir = join(
    dirname(createRequire(metaUrl).resolve("@base-ui/react/package.json")),
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
  const pkg = readJson("package.json")
  // Built by scripts/build-props.mts; a missing file only leaves `parts` empty.
  const partsData: Record<string, Part[]> = JSON.parse(
    readPackageFile("dist/props.json") ?? "{}"
  )
  const examplesData: ExamplesData = JSON.parse(
    readPackageFile("dist/examples.json") ?? "{}"
  )
  const index = buildComponentIndex(
    pkg,
    items,
    readPackageFile,
    new Set(
      readdirSync(baseUiDocsDir)
        .filter((file) => file.endsWith(".md"))
        .map((file) => file.slice(0, -3))
    )
  )
  return { index, pkg, partsData, examplesData, readBaseUiDoc }
}
