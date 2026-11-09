// Writes dist/agent/index.json, the Component Index the earth-ui CLI reads.
// Inputs: registry.json, package.json, src/ (for Base UI imports), the built dist/**/*.d.ts
// and the docs shipped in @base-ui/react. Rules live in component-index.mts.
//
// Run: pnpm build   (after tsdown, since it reads dist/)
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"

import { buildComponentIndex } from "./component-index.mts"

const readOrNull = (path: string) =>
  existsSync(path) ? readFileSync(path, "utf8") : null

const baseUiRoot = dirname(
  createRequire(import.meta.url).resolve("@base-ui/react/package.json")
)
const baseUiDocs = new Set(
  readdirSync(join(baseUiRoot, "docs/react/components"))
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.slice(0, -3))
)

const pkg = JSON.parse(readFileSync("package.json", "utf8"))
const registry = JSON.parse(readFileSync("registry.json", "utf8"))
const index = buildComponentIndex(pkg, registry.items, readOrNull, baseUiDocs)

mkdirSync("dist/agent", { recursive: true })
writeFileSync("dist/agent/index.json", JSON.stringify(index, null, 2) + "\n")
console.log(`dist/agent/index.json: ${index.components.length} components`)
