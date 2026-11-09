import assert from "node:assert/strict"
import { test } from "node:test"

import { buildComponentIndex } from "./component-index.mts"

const pkg = {
  name: "@scope/ui",
  version: "1.2.3",
  exports: {
    ".": { types: "./dist/index.d.ts", default: "./dist/index.js" },
    "./use-thing": {
      types: "./dist/hooks/use-thing.d.ts",
      default: "./dist/hooks/use-thing.js",
    },
    "./*": {
      types: "./dist/components/*.d.ts",
      default: "./dist/components/*.js",
    },
  },
}

const files: Record<string, string> = {
  "dist/index.d.ts": `import { Button, buttonVariants } from "./components/button.js";\nexport { Button, buttonVariants };`,
  "dist/components/button.d.ts": [
    `declare const buttonVariants: (props?: {`,
    `  variant?: "default" | "ghost" | null | undefined;`,
    `  size?: "sm" | "lg" | null | undefined;`,
    `}) => string;`,
    `export { Button$1 as Button, buttonVariants };`,
  ].join("\n"),
  "dist/components/toaster.d.ts": `export { Toaster };`,
  "dist/hooks/use-thing.d.ts": `export declare function useThing(): void;`,
  "src/button.tsx": `import { Button } from "@base-ui/react/button"\nimport { useRender } from "@base-ui/react/use-render"`,
  "src/dropdown-menu.tsx": `import { Menu } from "@base-ui/react/menu"`,
  "src/menubar.tsx": `import { Menu } from "@base-ui/react/menu"\nimport { Menubar } from "@base-ui/react/menubar"`,
}
const read = (path: string) => files[path] ?? null

const item = (name: string, type: string, api?: string) => ({
  name,
  type,
  title: name,
  description: `${name} description.`,
  dependencies: ["dep@^1"],
  files: [{ path: `src/${name}.tsx` }],
  meta: api ? { links: { api } } : undefined,
})
const baseUiDocs = new Set(["button", "menu", "menubar"])

const registryItems = [
  item(
    "button",
    "registry:ui",
    "https://base-ui.com/react/components/button.md"
  ),
  item("toaster", "registry:ui", "https://sonner.emilkowal.ski"),
  item("use-thing", "registry:hook"),
  item("use-internal", "registry:hook"),
  item("style", "registry:style"),
]

test("builds entries with imports, exports, variants and base ui doc", () => {
  const index = buildComponentIndex(pkg, registryItems, read, baseUiDocs)
  assert.equal(index.package, "@scope/ui")
  assert.equal(index.version, "1.2.3")
  assert.deepEqual(index.components[0], {
    name: "button",
    type: "ui",
    title: "button",
    description: "button description.",
    import: "@scope/ui/button",
    rootImport: true,
    exports: ["Button", "buttonVariants"],
    variants: { variant: ["default", "ghost"], size: ["sm", "lg"] },
    dependencies: ["dep@^1"],
    links: { api: "https://base-ui.com/react/components/button.md" },
    baseUiDoc: "button",
  })
})

test("subpath-only modules and hooks via explicit export keys", () => {
  const index = buildComponentIndex(pkg, registryItems, read, baseUiDocs)
  const toaster = index.components.find((c) => c.name === "toaster")!
  assert.equal(toaster.rootImport, false)
  assert.equal(toaster.baseUiDoc, null)
  assert.equal(toaster.variants, null)
  const hook = index.components.find((c) => c.name === "use-thing")!
  assert.equal(hook.type, "hook")
  assert.equal(hook.import, "@scope/ui/use-thing")
  assert.deepEqual(hook.exports, ["useThing"])
})

test("base ui doc comes from the source import that has a doc, name match first", () => {
  const index = buildComponentIndex(
    { ...pkg, exports: { "./*": pkg.exports["./*"] } },
    [item("dropdown-menu", "registry:ui"), item("menubar", "registry:ui")],
    (path) =>
      read(path) ?? (path.startsWith("dist/components/") ? "export {};" : null),
    baseUiDocs
  )
  assert.deepEqual(
    index.components.map((c) => c.baseUiDoc),
    ["menu", "menubar"]
  )
})

test("base ui doc falls back to the api link when the source imports the package root", () => {
  const index = buildComponentIndex(
    { ...pkg, exports: { "./*": pkg.exports["./*"] } },
    [
      item(
        "combobox",
        "registry:ui",
        "https://base-ui.com/react/components/combobox.md"
      ),
      item(
        "label",
        "registry:ui",
        "https://base-ui.com/react/components/label.md"
      ),
    ],
    (path) =>
      path === "src/combobox.tsx"
        ? `import { Combobox } from "@base-ui/react"`
        : path.startsWith("dist/components/")
          ? "export {};"
          : "",
    new Set(["combobox"])
  )
  assert.deepEqual(
    index.components.map((c) => c.baseUiDoc),
    ["combobox", null]
  )
})

test("drops items with no importable module", () => {
  const index = buildComponentIndex(pkg, registryItems, read, baseUiDocs)
  assert.deepEqual(
    index.components.map((c) => c.name),
    ["button", "toaster", "use-thing"]
  )
})
