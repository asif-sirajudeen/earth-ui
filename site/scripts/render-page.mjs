// Pure rule: one component page as MDX, from the CLI `docs <name>` and `source <name>` JSON.
// scripts/gen.mjs does the I/O and calls this.

const SITE = "https://asif-sirajudeen.github.io/earth-ui"

// Fence one backtick longer than the longest run inside the code (min 3).
function fence(code) {
  const longest = Math.max(0, ...(code.match(/`+/g) ?? []).map((m) => m.length))
  return "`".repeat(Math.max(3, longest + 1))
}

export function renderPage(docs, source) {
  const out = [
    "---",
    `title: ${JSON.stringify(docs.title)}`,
    `description: ${JSON.stringify(docs.description)}`,
    "---",
    "",
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
    "",
  ]
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
