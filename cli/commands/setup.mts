import type { Command } from "../context.mts"
import type {
  ComponentIndex,
  IndexPackageJson,
} from "../lib/component-index.mts"
import { CONVENTIONS } from "../lib/conventions.mts"

// Hand-kept facts the index cannot derive. Providers come from index exports ending in
// `Provider`; mounted elements (Toaster) are listed here only.
const PROVIDER_NOTES = [
  {
    name: "SidebarProvider",
    component: "sidebar",
    kind: "provider",
    required: true,
    note: "useSidebar throws without it. Wrap every Sidebar in it.",
  },
  {
    name: "TooltipProvider",
    component: "tooltip",
    kind: "provider",
    required: false,
    note: "Base UI tooltips work without it. It only shares the open delay between tooltips.",
  },
  {
    name: "Toaster",
    component: "toast",
    kind: "mounted",
    required: true,
    note: "Mount once near the app root. toast() renders through it.",
  },
  {
    name: "Toaster",
    component: "sonner",
    kind: "mounted",
    required: true,
    note: 'Mount once near the app root. Also mount the next-themes ThemeProvider yourself, with attribute="class".',
  },
]

/** Everything a package-mode consumer does before using a component. Pure over the index and package.json. */
export function setup(
  index: ComponentIndex,
  pkg: Pick<IndexPackageJson, "name" | "version" | "peerDependenciesMeta">
) {
  const providers = index.components.flatMap((c) =>
    c.exports
      .filter((e) => e.endsWith("Provider"))
      .map((name) => ({ name, component: c }))
  )
  const entries = [
    ...providers.map(({ name, component }) => ({
      name,
      component: component.name,
    })),
    ...PROVIDER_NOTES.filter(
      (n) =>
        !providers.some(
          (p) => p.name === n.name && p.component.name === n.component
        )
    ),
  ]
  const optional = new Map<string, { range: string; neededBy: string[] }>()
  for (const c of index.components)
    for (const dep of c.install) {
      const at = dep.lastIndexOf("@")
      const name = dep.slice(0, at)
      if (!pkg.peerDependenciesMeta?.[name]?.optional) continue
      const found = optional.get(name) ?? {
        range: dep.slice(at + 1),
        neededBy: [],
      }
      found.neededBy.push(c.name)
      optional.set(name, found)
    }
  return {
    package: pkg.name,
    version: pkg.version,
    css: {
      lines: ['@import "tailwindcss";', `@import "${pkg.name}/styles.css";`],
      notes: [
        "Import tailwindcss first. styles.css does not import it.",
        "styles.css registers the package's built files as a Tailwind source, so no @source line is needed.",
        "styles.css imports tw-animate-css, which ships as a package dependency. Install nothing for it.",
      ],
    },
    darkMode:
      "Dark styles apply under a .dark class on an ancestor, usually <html> (@custom-variant dark (&:is(.dark *))).",
    providers: entries.flatMap((e) => {
      const component = index.components.find((c) => c.name === e.component)
      if (!component) return []
      const note = PROVIDER_NOTES.find(
        (n) => n.name === e.name && n.component === e.component
      )
      return [
        {
          name: e.name,
          component: e.component,
          import: component.import,
          kind: note?.kind ?? "provider",
          required: note?.required ?? null,
          note: note?.note ?? null,
          handKept: note !== undefined,
        },
      ]
    }),
    optionalPeers: [...optional].map(([name, { range, neededBy }]) => ({
      package: name,
      range,
      neededBy,
      install: `npm install ${name}@${range}`,
    })),
    conventions: CONVENTIONS,
  }
}

export const setupCommand: Command = {
  name: "setup",
  usage: "earth-ui setup",
  description:
    "What to do before using any component: CSS import lines, dark mode, providers and mounted elements, optional peer dependencies.",
  exampleArgs: "",
  needsArg: false,
  run: ({ index, pkg }) => setup(index, pkg),
}
