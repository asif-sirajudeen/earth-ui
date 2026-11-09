// Pure rules for the Component Index: package-mode lookup data the earth-ui CLI derives at
// runtime from the bundled registry (dist/registry) and the built type declarations.
// cli/earth-ui.mts does the file I/O and calls this.

type ExportTarget = { types: string; default: string }
export type IndexPackageJson = {
  name: string
  version: string
  exports: Record<string, ExportTarget | string>
}
export type IndexRegistryItem = {
  name: string
  type: string
  title?: string
  description?: string
  dependencies?: string[]
  /** Built registry items (dist/registry/<name>.json) inline the source as `content`. */
  files?: { path: string; content?: string }[]
  meta?: { links?: Record<string, string> }
}

export type ComponentEntry = {
  name: string
  type: "ui" | "hook"
  title: string
  description: string
  import: string
  rootImport: boolean
  exports: string[]
  variants: Record<string, string[]> | null
  dependencies: string[]
  links: Record<string, string>
  baseUiDoc: string | null
  /** The TSX source files with their code. */
  source: { path: string; code: string }[]
}
export type ComponentIndex = {
  package: string
  version: string
  components: ComponentEntry[]
}

/** The .d.ts path that `<pkg>/<name>` resolves to through the exports map, or null. */
function typesPath(pkg: IndexPackageJson, name: string): string | null {
  const exact = pkg.exports[`./${name}`]
  const wildcard = pkg.exports["./*"]
  const target = exact ?? wildcard
  if (!target || typeof target === "string") return null
  const path = exact ? target.types : target.types.replace("*", name)
  return path.replace(/^\.\//, "")
}

/** Public names from `export { A$1 as A, B }` blocks and `export declare function|const|class X`. */
export function exportedNames(dts: string): string[] {
  const names: string[] = []
  for (const [, list] of dts.matchAll(/^export\s+(?:type\s+)?\{([^}]*)\}/gm))
    for (const spec of list!.split(",")) {
      const name = spec
        .trim()
        .split(/\s+as\s+/)
        .pop()!
        .replace(/^type\s+/, "")
      if (name) names.push(name)
    }
  for (const [, name] of dts.matchAll(
    /^export\s+declare\s+(?:function|const|class)\s+(\w+)/gm
  ))
    names.push(name!)
  return names
}

/** CVA literal unions such as `variant?: "default" | "ghost" | null | undefined`. */
export function variantProps(dts: string): Record<string, string[]> | null {
  const variants: Record<string, string[]> = {}
  for (const [, prop, union] of dts.matchAll(
    /^\s*(\w+)\?:\s*((?:"[^"]*"\s*\|\s*)+)null\s*\|\s*undefined;/gm
  ))
    variants[prop!] ??= [...union!.matchAll(/"([^"]*)"/g)].map((m) => m[1]!)
  return Object.keys(variants).length ? variants : null
}

/**
 * The Base UI doc for an item: among the `@base-ui/react/<part>` modules its source imports,
 * the one named like the item, else the only one that has a doc. Helpers such as
 * use-render have no doc and are skipped. A source that imports the package root
 * (`from "@base-ui/react"`) names no part, so the base-ui.com api link decides, if it has a doc.
 */
function baseUiDocName(
  name: string,
  source: string,
  api: string | undefined,
  docs: Set<string>
): string | null {
  const parts = [...source.matchAll(/["']@base-ui\/react\/([\w-]+)["']/g)]
    .map((m) => m[1]!)
    .filter((part) => docs.has(part))
  const unique = [...new Set(parts)]
  if (unique.includes(name)) return name
  if (unique.length === 1) return unique[0]!
  if (unique.length > 1) return null
  const linked = api?.match(
    /^https:\/\/base-ui\.com\/react\/components\/([\w-]+)\.md$/
  )?.[1]
  return linked && docs.has(linked) ? linked : null
}

export function buildComponentIndex(
  pkg: IndexPackageJson,
  items: IndexRegistryItem[],
  read: (path: string) => string | null,
  baseUiDocs: Set<string>
): ComponentIndex {
  const root = read("dist/index.d.ts") ?? ""
  const components: ComponentEntry[] = []
  for (const item of items) {
    if (item.type !== "registry:ui" && item.type !== "registry:hook") continue
    const path = typesPath(pkg, item.name)
    const dts = path && read(path)
    if (!dts) continue
    const links = item.meta?.links ?? {}
    components.push({
      name: item.name,
      type: item.type === "registry:ui" ? "ui" : "hook",
      title: item.title ?? item.name,
      description: item.description ?? "",
      import: `${pkg.name}/${item.name}`,
      rootImport: root.includes(`"./components/${item.name}.js"`),
      exports: exportedNames(dts),
      variants: variantProps(dts),
      dependencies: item.dependencies ?? [],
      links,
      baseUiDoc: baseUiDocName(
        item.name,
        (item.files ?? [])
          .map((f) => f.content ?? read(f.path) ?? "")
          .join("\n"),
        links.api,
        baseUiDocs
      ),
      source: (item.files ?? []).map((f) => ({
        path: f.path,
        code: f.content ?? read(f.path) ?? "",
      })),
    })
  }
  return { package: pkg.name, version: pkg.version, components }
}
