// Pure rule: one component page as MDX, from the CLI `docs <name>` and `source <name>` JSON.
// scripts/gen.mjs does the I/O and calls this.

const SITE = "https://asif-sirajudeen.github.io/earth-ui"

// Fence one backtick longer than the longest run inside the code (min 3).
function fence(code) {
  const longest = Math.max(0, ...(code.match(/`+/g) ?? []).map((m) => m.length))
  return "`".repeat(Math.max(3, longest + 1))
}

const titleCase = (s) =>
  s
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ")

/** Buckets [{ name, code }] under the component whose name is the longest `<component>-` prefix. */
export function groupExamples(examples, components) {
  const byLen = [...components].sort((a, b) => b.length - a.length)
  const groups = {}
  let ignored = 0
  for (const e of examples) {
    const c = byLen.find((c) => e.name.startsWith(`${c}-`))
    if (c) (groups[c] ??= []).push(e)
    else ignored++
  }
  for (const [c, list] of Object.entries(groups))
    list.sort((a, b) => {
      const demo = (e) => (e.name === `${c}-demo` ? 0 : 1)
      return demo(a) - demo(b) || a.name.localeCompare(b.name)
    })
  return { groups, ignored }
}

// How to import the component an example file exports: named (capitalised, so a data
// `export const works = []` is skipped) or default.
function importLine(local, name, code) {
  const m = code.match(/^export (?:function|const) ([A-Z]\w*)|^export default/m)
  return m?.[1]
    ? `import { ${m[1]} as ${local} } from "@/examples/${name}"`
    : `import ${local} from "@/examples/${name}"`
}

/** `examples` is [{ name, code }] from site/examples, already grouped to this component. */
export function renderPage(docs, source, examples = []) {
  const out = [
    "---",
    `title: ${JSON.stringify(docs.title)}`,
    `description: ${JSON.stringify(docs.description)}`,
    "---",
    "",
  ]
  if (examples.length) {
    out.push('import { Tab, Tabs } from "fumadocs-ui/components/tabs"')
    examples.forEach((e, i) => out.push(importLine(`Ex_${i}`, e.name, e.code)))
    out.push("", "## Examples", "")
    examples.forEach((e, i) => {
      const fc = fence(e.code)
      out.push(
        `### ${titleCase(e.name.slice(docs.name.length + 1))}`,
        "",
        '<Tabs items={["Preview", "Code"]}>',
        '<Tab value="Preview">',
        "",
        '<div className="not-prose flex min-h-40 items-center justify-center rounded-lg border p-6">',
        `  <Ex_${i} />`,
        "</div>",
        "",
        "</Tab>",
        '<Tab value="Code">',
        "",
        `${fc}tsx`,
        e.code,
        fc,
        "",
        "</Tab>",
        "</Tabs>",
        ""
      )
    })
  }
  out.push(
    "## Install",
    "",
    "Package mode:",
    "",
    "```bash",
    "pnpm add @asif-sirajudeen/earth-ui",
    "```",
    "",
    "```tsx",
    `import { ${docs.exports.join(", ")} } from "${docs.import}"`,
    "```",
    ""
  )
  if (docs.rootImport)
    out.push(
      `These exports are also available from the package root, \`@asif-sirajudeen/earth-ui\`.`,
      ""
    )
  out.push(
    "Copy mode:",
    "",
    "```bash",
    `npx shadcn@latest registry add @earth-ui=${SITE}/r/${docs.name}.json`,
    `npx shadcn@latest add @earth-ui/${docs.name}`,
    "```",
    "",
    "## Parts",
    "",
    ...docs.exports.map((e) => `- \`${e}\``),
    ""
  )
  if (docs.variants) {
    out.push("## Variants", "", "| Variant | Values |", "| --- | --- |")
    for (const [k, v] of Object.entries(docs.variants))
      out.push(`| ${k} | ${v.map((x) => `\`${x}\``).join(", ")} |`)
    out.push("")
  }
  if (docs.dependencies?.length)
    out.push(
      "## Dependencies",
      "",
      ...docs.dependencies.map((d) => `- \`${d}\``),
      ""
    )
  // Link out rather than inline props: Base UI's page is the reference. baseUiDoc names the
  // right part (hover-card wraps preview-card); links.api is the .md URL meant for agents.
  const api = docs.baseUiDoc
    ? `https://base-ui.com/react/components/${docs.baseUiDoc}`
    : docs.links?.api?.replace(/\.md$/, "")
  if (api)
    out.push(
      "## API reference",
      "",
      `Props are documented on the [Base UI page](${api}). It names parts the Base UI way (Root, Trigger), not by earth-ui export name.`,
      ""
    )
  out.push("## Source", "")
  for (const f of source.files) {
    const fc = fence(f.code)
    out.push(`\`${f.path}\``, "", `${fc}tsx`, f.code, fc, "")
  }
  return out.join("\n")
}
