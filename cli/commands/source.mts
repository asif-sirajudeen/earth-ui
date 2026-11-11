import type { Command } from "../context.mts"
import type { ComponentIndex } from "../lib/component-index.mts"
import { find } from "../lib/find.mts"

/** The component's TSX source from the index. `@/` imports name other earth-ui modules. */
export function source(index: ComponentIndex, name: string) {
  const entry = find(index, name)
  return {
    name: entry.name,
    import: entry.import,
    importNote: `@/components/<x> imports in this source map to ${index.package}/<x>. Import from the package, not from @/.`,
    files: entry.source,
  }
}

/** `source` as plain text: a `// ==> <path>` header line before each file's code. */
export function sourceRaw(index: ComponentIndex, name: string): string {
  return find(index, name)
    .source.map((f) => `// ==> ${f.path}\n${f.code}`)
    .join("\n")
}

export const sourceCommand: Command = {
  name: "source",
  usage: "earth-ui source <name> [--raw]",
  description:
    "The component's TSX source. Read it to see how it is built; import from the package, do not copy it. --raw prints plain text with a // ==> <path> header per file instead of JSON.",
  exampleArgs: "dialog",
  needsArg: true,
  flags: { raw: { type: "boolean" } },
  run: ({ index }, arg, flags) =>
    flags.raw ? sourceRaw(index, arg) : source(index, arg),
}
