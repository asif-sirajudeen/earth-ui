// Writes one MDX page per component into content/docs/components (gitignored) from the
// earth-ui CLI JSON. I/O only; the page layout lives in render-page.mjs. Needs `pnpm build` at the repo root first.

import { spawnSync } from "node:child_process"
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"

import { groupExamples, renderPage } from "./render-page.mjs"

const cli = new URL("../../dist/cli.js", import.meta.url).pathname
const run = (...args) => {
  const r = spawnSync("node", [cli, ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  })
  if (r.status !== 0) throw new Error(`earth-ui ${args.join(" ")}: ${r.stderr}`)
  return JSON.parse(r.stdout)
}

const dir = new URL("../content/docs/components/", import.meta.url)
rmSync(dir, { recursive: true, force: true })
mkdirSync(dir, { recursive: true })

const t0 = Date.now()
const { components } = run("list")
const examplesDir = new URL("../examples/", import.meta.url)
const { groups, ignored } = groupExamples(
  readdirSync(examplesDir)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => ({
      name: f.slice(0, -4),
      code: readFileSync(new URL(f, examplesDir), "utf8"),
    })),
  components.map((c) => c.name)
)
for (const { name } of components)
  writeFileSync(
    new URL(`${name}.mdx`, dir),
    renderPage(run("docs", name), run("source", name), groups[name])
  )
writeFileSync(
  new URL("meta.json", dir),
  JSON.stringify({ title: "Components", defaultOpen: true, pages: components.map((c) => c.name) })
)
console.log(
  `gen: ${components.length} pages in ${Date.now() - t0}ms (${ignored} examples matched no component)`
)
