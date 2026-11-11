// Pure helpers: turn a component's import specifiers into registry deps.
export const NAMESPACE = "@earth-ui"
const PROVIDED_BY_CONSUMER = new Set(["react", "react-dom", "tailwindcss"])
const NAME_AT_RANGE = /^(@[^/@\s]+\/)?[^/@\s]+@\S+$/

export type PackageJson = {
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export type DeriveContext = {
  pkg: PackageJson
  itemNames: ReadonlySet<string>
}

export const topLevelPackage = (spec: string): string =>
  spec
    .split("/")
    .slice(0, spec.startsWith("@") ? 2 : 1)
    .join("/")

// ponytail: regex, not a parser. Skips dynamic import() (src/lib/highlighter.tsx has some, but also statically imports shiki/core, so nothing is lost today) and can match specifiers inside block comments. Upgrade to a parser if either bites.
export function importSpecifiers(code: string): string[] {
  const re =
    /^\s*(?:import|export)\s[^"']*?from\s*["']([^"']+)["']|^\s*import\s*["']([^"']+)["']/gm
  return [...code.matchAll(re)].map((m) => (m[1] ?? m[2]) as string)
}

/** `name@range`, with the range from package.json. Throws if the package is not declared. */
export function withRange(name: string, pkg: PackageJson): string {
  const range = pkg.dependencies?.[name] ?? pkg.peerDependencies?.[name]
  if (!range) {
    throw new Error(
      `"${name}" is imported but not in package.json dependencies or peerDependencies`
    )
  }
  const dep = `${name}@${range}`
  if (!NAME_AT_RANGE.test(dep))
    throw new Error(`${dep}: not a name@range dependency`)
  return dep
}

export function deriveDeps(
  specifiers: readonly string[],
  { pkg, itemNames }: DeriveContext
): { dependencies: string[]; registryDependencies: string[] } {
  const dependencies = new Set<string>()
  const registryDependencies = new Set<string>()

  for (const spec of specifiers) {
    const alias = spec.match(/^@\/(components|hooks|lib)\/(.+)$/)
    if (alias) {
      const [, folder, name] = alias as unknown as [string, string, string]
      // @/lib files ship inside the item; deriveItems attaches them.
      if (folder === "lib") continue
      if (itemNames.has(name)) {
        registryDependencies.add(`${NAMESPACE}/${name}`)
      } else {
        throw new Error(`${spec}: no registry item named "${name}"`)
      }
      continue
    }
    if (spec.startsWith("."))
      throw new Error(
        `${spec}: relative imports do not survive the copy; use an @/ alias`
      )
    const name = topLevelPackage(spec)
    if (PROVIDED_BY_CONSUMER.has(name)) continue
    dependencies.add(withRange(name, pkg))
  }

  return {
    dependencies: [...dependencies].sort(),
    registryDependencies: [...registryDependencies].sort(),
  }
}
