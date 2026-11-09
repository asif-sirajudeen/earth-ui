// The earth-ui CLI commands as pure functions over the Component Index.
// cli/earth-ui.mts does the I/O; a future MCP server can wrap these same functions.
import type { ComponentEntry, ComponentIndex } from "./component-index.mts"

const summary = (c: ComponentEntry) => ({
  name: c.name,
  title: c.title,
  description: c.description,
  import: c.import,
})

export function list(index: ComponentIndex) {
  return {
    package: index.package,
    version: index.version,
    components: index.components.map(summary),
  }
}

/** Token match: name hits outweigh title, description and export-name hits. */
export function search(index: ComponentIndex, query: string, limit = 10) {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
  const scored = index.components.map((c) => {
    const exports = c.exports.join(" ").toLowerCase()
    let score = 0
    for (const t of tokens) {
      if (c.name === t) score += 5
      else if (c.name.includes(t) || t.includes(c.name)) score += 3
      if (c.title.toLowerCase().includes(t)) score += 2
      if (c.description.toLowerCase().includes(t)) score += 1
      if (exports.includes(t)) score += 1
    }
    return { ...summary(c), score }
  })
  return {
    components: scored
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit),
  }
}

export class UnknownComponentError extends Error {
  readonly suggestions: string[]
  constructor(name: string, suggestions: string[]) {
    super(`Unknown component "${name}"`)
    this.suggestions = suggestions
  }
}

function find(index: ComponentIndex, name: string): ComponentEntry {
  const entry = index.components.find((c) => c.name === name)
  if (!entry)
    throw new UnknownComponentError(
      name,
      search(index, name, 5).components.map((c) => c.name)
    )
  return entry
}

/** The full index entry plus the "## API reference" section of its Base UI doc. */
export function docs(
  index: ComponentIndex,
  name: string,
  readBaseUiDoc: (doc: string) => string | null
) {
  const entry = find(index, name)
  const doc = entry.baseUiDoc ? readBaseUiDoc(entry.baseUiDoc) : null
  const start = doc?.indexOf("## API reference") ?? -1
  const { source: _source, ...rest } = entry
  return { ...rest, props: start >= 0 ? doc!.slice(start) : null }
}

/** The component's TSX source from the index. `@/` imports name other earth-ui modules. */
export function source(index: ComponentIndex, name: string) {
  const entry = find(index, name)
  return { name: entry.name, import: entry.import, files: entry.source }
}

const COMMANDS = [
  {
    name: "list",
    usage: "earth-ui list",
    description: "Every component with its title, description and import path.",
    args: "",
  },
  {
    name: "search",
    usage: "earth-ui search <query> [--limit n]",
    description:
      "Components ranked by name, title, description and exported names. --limit defaults to 10.",
    args: "modal --limit 5",
  },
  {
    name: "docs",
    usage: "earth-ui docs <name>",
    description:
      "Import path, exported parts, variants, dependencies, links and Base UI props tables.",
    args: "dialog",
  },
  {
    name: "source",
    usage: "earth-ui source <name>",
    description:
      "The component's TSX source. Read it to see how it is built; import from the package, do not copy it.",
    args: "dialog",
  },
  {
    name: "help",
    usage: "earth-ui help",
    description: "This list. Also --help or -h.",
    args: "",
  },
]

export function help(pkg: string) {
  return {
    description:
      "Look up components in the installed package. Every command prints JSON; errors print JSON on stderr and exit 1.",
    commands: COMMANDS.map(({ args, ...c }) => ({
      ...c,
      example: `npx ${pkg} ${c.name}${args ? ` ${args}` : ""}`,
    })),
  }
}
