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
  if (docs.props) {
    out.push(
      "## API reference",
      "",
      "> The tables below use **Base UI part names** (Root, Trigger), not earth-ui export names.",
      ""
    )
    if (docs.links?.api) out.push(`[Base UI docs](${docs.links.api})`, "")
    // Drop the leading "## API reference" heading; we emit our own.
    out.push(docs.props.replace(/^## API reference\s*/, ""), "")
  }
  out.push("## Source", "")
  for (const f of source.files) {
    const fc = fence(f.code)
    out.push(`\`${f.path}\``, "", `${fc}tsx`, f.code, fc, "")
  }
  return out.join("\n")
}
