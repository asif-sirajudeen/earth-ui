// Pure registry rules: derive items from source files, check them, and build the style item.
// scripts/build/registry.mts does the file I/O and calls these.
import type { RegistryItem } from "shadcn/schema"

import {
  deriveDeps,
  importSpecifiers,
  NAMESPACE,
  withRange,
  type PackageJson,
} from "./derive-deps.mts"

export type SourceFile = { path: string; code: string }
export type ItemMetadata = {
  title: string
  description: string
  meta?: RegistryItem["meta"]
}
export type Sources = {
  components: SourceFile[]
  hooks: SourceFile[]
  libs: SourceFile[]
}

const STYLE = "style"
const basename = (path: string) =>
  path
    .split("/")
    .pop()!
    .replace(/\.[^.]+$/, "")

/** One item per component and hook file; src/lib files ride inside the item that imports them. */
export function deriveItems(
  sources: Sources,
  metadata: Record<string, ItemMetadata>,
  pkg: PackageJson
): RegistryItem[] {
  const entries = [
    ...sources.components.map((file) => ({
      file,
      type: "registry:ui" as const,
    })),
    ...sources.hooks.map((file) => ({ file, type: "registry:hook" as const })),
  ]
  const itemNames = new Set(entries.map(({ file }) => basename(file.path)))
  const libsByName = new Map(
    sources.libs.map((lib) => [basename(lib.path), lib])
  )
  const usedLibs = new Set<string>()

  for (const name of Object.keys(metadata)) {
    if (!itemNames.has(name))
      throw new Error(
        `registry/metadata.ts: "${name}" has no file in src/components or src/hooks`
      )
  }

  const items = entries.map(({ file, type }): RegistryItem => {
    const name = basename(file.path)
    const meta = metadata[name]
    if (!meta?.title?.trim() || !meta.description?.trim()) {
      throw new Error(
        `${file.path}: add a title and description for "${name}" in registry/metadata.ts`
      )
    }

    // Attach every @/lib file this item reaches, following lib-to-lib imports.
    const files: SourceFile[] = [file]
    const fileTypes = new Map([[file.path, type as string]])
    for (let i = 0; i < files.length; i++) {
      for (const spec of importSpecifiers(files[i]!.code)) {
        const lib = spec.match(/^@\/lib\/(.+)$/)?.[1]
        if (!lib) continue
        const libFile = libsByName.get(lib)
        if (!libFile)
          throw new Error(`${files[i]!.path}: ${spec} has no file in src/lib`)
        if (!fileTypes.has(libFile.path)) {
          files.push(libFile)
          fileTypes.set(libFile.path, "registry:lib")
          usedLibs.add(lib)
        }
      }
    }

    const specifiers = files.flatMap((f) => importSpecifiers(f.code))
    const { dependencies, registryDependencies } = deriveDeps(specifiers, {
      pkg,
      itemNames,
    })
    const registryDeps =
      type === "registry:ui"
        ? [...registryDependencies, `${NAMESPACE}/${STYLE}`]
        : registryDependencies

    return {
      name,
      type,
      title: meta.title,
      description: meta.description,
      ...(dependencies.length && { dependencies }),
      ...(registryDeps.length && { registryDependencies: registryDeps.sort() }),
      files: files.map((f) => ({
        path: f.path,
        type: fileTypes.get(f.path) as "registry:ui",
      })),
      ...(meta.meta && { meta: meta.meta }),
    }
  })

  const unused = [...libsByName.keys()].filter((lib) => !usedLibs.has(lib))
  if (unused.length)
    throw new Error(
      `src/lib/${unused[0]}: imported by no component or hook, so it would never ship`
    )

  const cycle = findCycle(items)
  if (cycle)
    throw new Error(`registryDependencies cycle: ${cycle.join(" -> ")}`)
  return items
}

/** Returns the first cycle among same-namespace registryDependencies, or null. */
export function findCycle(items: readonly RegistryItem[]): string[] | null {
  const deps = new Map(
    items.map((item) => [
      item.name,
      (item.registryDependencies ?? [])
        .filter((dep) => dep.startsWith(`${NAMESPACE}/`))
        .map((dep) => dep.slice(NAMESPACE.length + 1)),
    ])
  )
  const state = new Map<string, "visiting" | "done">()
  const stack: string[] = []
  const visit = (name: string): string[] | null => {
    if (state.get(name) === "done") return null
    if (state.get(name) === "visiting")
      return [...stack.slice(stack.indexOf(name)), name]
    state.set(name, "visiting")
    stack.push(name)
    for (const dep of deps.get(name) ?? []) {
      const cycle = visit(dep)
      if (cycle) return cycle
    }
    stack.pop()
    state.set(name, "done")
    return null
  }
  for (const name of deps.keys()) {
    const cycle = visit(name)
    if (cycle) return cycle
  }
  return null
}

const SHADCN_START = /\/\* ejected from shadcn@(\S+)/
const SHADCN_END = /\/\* end of shadcn@(\S+) block \*\//

/** Version in the ejected shadcn block's markers. Throws if a marker is missing or the two disagree. */
export function ejectedShadcnVersion(css: string): string {
  const start = SHADCN_START.exec(css)
  const end = SHADCN_END.exec(css)
  if (!start || !end || end.index < start.index)
    throw new Error("styles.css: shadcn block markers not found")
  if (start[1] !== end[1])
    throw new Error(
      `styles.css: shadcn marker versions differ (start ${start[1]}, end ${end[1]})`
    )
  return start[1]!
}

/** Throws unless the ejected block's version equals `devDependencies.shadcn`. */
export function assertShadcnPin(css: string, pkg: PackageJson): void {
  const ejected = ejectedShadcnVersion(css)
  const pinned = pkg.devDependencies?.shadcn
  if (ejected !== pinned)
    throw new Error(
      `styles.css: ejected shadcn block is ${ejected} but devDependencies.shadcn is ${pinned}; re-eject dist/tailwind.css from the new CLI version and update the markers`
    )
}

/** Text of the shadcn tailwind.css copy inside styles.css, between its marker comments. */
export function ejectedShadcnBlock(css: string): string {
  ejectedShadcnVersion(css)
  const start = SHADCN_START.exec(css)!.index
  return css.slice(css.indexOf("\n", start) + 1, SHADCN_END.exec(css)!.index)
}

/** `--name: value;` pairs of the first `selector {` block after the shadcn block. */
function tokensOf(css: string, selector: string): Record<string, string> {
  const endMatch = SHADCN_END.exec(css)
  const from = endMatch ? endMatch.index : -1
  const open = css.indexOf(`${selector} {`, from)
  if (from < 0 || open < 0)
    throw new Error(`styles.css: no "${selector}" block after the shadcn block`)
  const body = css.slice(open, css.indexOf("}", open))
  const vars = Object.fromEntries(
    [...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [
      m[1]!,
      m[2]!.trim(),
    ])
  )
  if (!Object.keys(vars).length)
    throw new Error(`styles.css: "${selector}" block has no tokens`)
  return vars
}

export function parseTokens(css: string) {
  return {
    theme: tokensOf(css, "@theme inline"),
    light: tokensOf(css, ":root"),
    dark: tokensOf(css, ".dark"),
  }
}

type CssRules = { [selector: string]: Record<string, string> | CssRules }

const canonical = (selector: string) =>
  selector
    .split(",")
    .map((s) => s.trim().replace(/\s+/g, " "))
    .join(", ")

/** Plain CSS (rules and at-rule blocks, no nesting inside rules) as the registry `css` object, in file order. */
function parseCss(css: string): CssRules {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, "")
  let i = 0
  const block = (): CssRules => {
    const out: CssRules = {}
    for (;;) {
      const open = src.indexOf("{", i)
      const close = src.indexOf("}", i)
      if (close >= 0 && (open < 0 || close < open)) {
        i = close + 1
        return out
      }
      if (open < 0) return out
      const selector = canonical(src.slice(i, open))
      i = open + 1
      if (selector.startsWith("@")) {
        out[selector] = block()
        continue
      }
      const end = src.indexOf("}", i)
      out[selector] = Object.fromEntries(
        src
          .slice(i, end)
          .split(";")
          .map((d) => d.trim())
          .filter(Boolean)
          .map((d) => [
            d.slice(0, d.indexOf(":")).trim(),
            d
              .slice(d.indexOf(":") + 1)
              .trim()
              .replace(/\s+/g, " "),
          ])
      )
      i = end + 1
    }
  }
  return block()
}

/**
 * A theme file (themes/<name>.css) as a registry:theme item. The file holds:
 * - token rules `[data-theme="<name>"]` (light) and `.dark[data-theme="<name>"], .dark [data-theme="<name>"]` (dark),
 *   both setting the same tokens, each already defined in styles.css `:root`;
 * - optionally, component rules scoped under `[data-theme="<name>"] ` (for example `[data-slot="button"]`), plain
 *   properties only, at the top level or inside an at-rule such as `@media`.
 * The rules ship through `css`, not `cssVars`: the CLI writes cssVars into `:root`/`.dark`, which would
 * replace the consumer's default tokens instead of adding a scoped theme.
 */
export function themeItem(
  name: string,
  css: string,
  baseTokens: Record<string, string>
): RegistryItem {
  const file = `themes/${name}.css`
  const light = `[data-theme="${name}"]`
  const dark = `.dark${light}, .dark ${light}`
  const rules = parseCss(css)
  const tokens = (selector: string) => {
    const decls = rules[selector] as Record<string, string> | undefined
    if (!decls)
      throw new Error(`${file}: expected the token rules ${light} and ${dark}`)
    const vars = Object.keys(decls).sort()
    if (!vars.length || vars.some((v) => !v.startsWith("--")))
      throw new Error(`${file}: ${selector} must set tokens (--name) only`)
    return vars
  }
  const lightVars = tokens(light)
  if (lightVars.join() !== tokens(dark).join())
    throw new Error(
      `${file}: light and dark rules must set the same tokens, or light values leak into dark mode`
    )
  const unknown = lightVars.filter((v) => !(v.slice(2) in baseTokens))
  if (unknown.length)
    throw new Error(
      `${file}: ${unknown.join(", ")} not defined in styles.css :root`
    )

  const checkComponentRules = (block: CssRules, inAtRule: boolean) => {
    for (const [selector, body] of Object.entries(block)) {
      if (!inAtRule && (selector === light || selector === dark)) continue
      if (selector.startsWith("@")) {
        if (inAtRule)
          throw new Error(`${file}: ${selector} is nested in another at-rule`)
        checkComponentRules(body as CssRules, true)
        continue
      }
      if (selector.split(", ").some((s) => !s.startsWith(`${light} `)))
        throw new Error(
          `${file}: ${selector} must be scoped under "${light} " like the token rules`
        )
      if (Object.keys(body).some((p) => p.startsWith("--")))
        throw new Error(
          `${file}: ${selector} sets a token; set tokens in the ${light} and dark rules`
        )
    }
  }
  checkComponentRules(rules, false)

  const title = name[0]!.toUpperCase() + name.slice(1)
  return {
    name: `theme-${name}`,
    type: "registry:theme",
    title: `${title} theme`,
    description: `${title} color theme, scoped to data-theme="${name}". Works in light and dark mode.`,
    // No dependency on the style item: re-adding it rewrites the consumer's default tokens. Every ui item pulls it in.
    css: rules,
  }
}

/** Mirrors shadcn's own base style item; tokens come from styles.css. */
export function styleItem(css: string, pkg: PackageJson): RegistryItem {
  assertShadcnPin(css, pkg)
  return {
    name: STYLE,
    type: "registry:style",
    title: "Earth UI style",
    description:
      "Theme tokens, dark variant and base layer for Earth UI components, plus tw-animate-css and shadcn's Tailwind utilities.",
    // Bare `shadcn`, as upstream: the repo pins the CLI exactly for CI, and that pin must not reach consumers.
    devDependencies: [withRange("tw-animate-css", pkg), "shadcn"],
    cssVars: parseTokens(css),
    css: {
      '@import "tw-animate-css"': {},
      '@import "shadcn/tailwind.css"': {},
      "@custom-variant dark (&:is(.dark *))": {},
      "@layer base": {
        "*": { "@apply border-border outline-ring/50": {} },
        body: { "@apply bg-background text-foreground": {} },
      },
    },
  }
}
