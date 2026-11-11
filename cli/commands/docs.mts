import type { Command } from "../context.mts"
import type { ComponentIndex } from "../lib/component-index.mts"
import { find } from "../lib/find.mts"
import { docsProps, fullReference, type Part } from "../lib/props.mts"

/**
 * The index entry plus `props`: the module's own parts (`partsData`, from dist/props.json) and
 * the Base UI props. `full` adds `reference`, the complete Base UI API reference.
 */
export function docs(
  index: ComponentIndex,
  name: string,
  readBaseUiDoc: (doc: string) => string | null,
  partsData: Record<string, Part[]> = {},
  { full = false }: { full?: boolean } = {}
) {
  const entry = find(index, name)
  const doc = entry.baseUiDoc ? readBaseUiDoc(entry.baseUiDoc) : null
  const { source: _source, ...rest } = entry
  const result = {
    ...rest,
    props: docsProps(partsData[name] ?? [], doc, entry.baseUiDoc ?? ""),
  }
  return full
    ? { ...result, reference: doc === null ? null : fullReference(doc) }
    : result
}

// One line per field `docs` returns.
export const FIELDS = {
  name: "Component name, as used in the commands and the import subpath.",
  type: '"ui" for a component, "hook" for a hook.',
  title: "Display name.",
  description: "What the component is for.",
  import: "Subpath import. Always works, for example @scope/pkg/sonner.",
  rootImport:
    "true: also exported from the package root. false: import only from the `import` subpath, for example `@asif-sirajudeen/earth-ui/sonner`.",
  exports: "Exported parts and names to import.",
  variants:
    "Props typed as a string-literal union (CVA variants and others) with their allowed values, or null.",
  dependencies:
    "npm packages the component source imports. Package dependencies ship with the package.",
  install:
    "Packages you must add yourself (optional peer dependencies), as name@range. Everything in dependencies not listed here ships with the package.",
  links: "Related links (docs, examples, api). Keys vary; hooks have {}.",
  baseUiDoc: "Slug of the Base UI doc that props come from, or null.",
  props:
    "{ parts, baseUi }: parts are the exported parts from the built types, each with the props type it forwards and the props it adds (hooks: params and returns); baseUi holds the Base UI props per part, or null. --full adds reference, the complete Base UI API reference.",
  reference:
    "Only with --full: the complete Base UI API reference as markdown (props, data attributes, CSS variables, types), or null when the component has no Base UI doc.",
}

export const docsCommand: Command = {
  name: "docs",
  usage: "earth-ui docs <name> [--full]",
  description:
    "Import path, exported parts, variants, dependencies, links and props: each part's own props and the Base UI props. --full adds the complete Base UI reference.",
  exampleArgs: "dialog",
  needsArg: true,
  flags: { full: { type: "boolean" } },
  run: ({ index, readBaseUiDoc, partsData }, arg, flags) =>
    docs(index, arg, readBaseUiDoc, partsData, { full: flags.full }),
}
