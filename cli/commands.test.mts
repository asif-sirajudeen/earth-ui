import assert from "node:assert/strict"
import { test } from "node:test"

import type {
  ComponentEntry,
  ComponentIndex,
} from "../scripts/component-index.mts"
import { docs, list, search, source } from "./commands.mts"

const entry = (
  name: string,
  description: string,
  extra: Partial<ComponentEntry> = {}
): ComponentEntry => ({
  name,
  type: "ui",
  title: name[0]!.toUpperCase() + name.slice(1),
  description,
  import: `@scope/ui/${name}`,
  rootImport: true,
  exports: [],
  variants: null,
  dependencies: [],
  links: {},
  baseUiDoc: null,
  source: [{ path: `src/components/${name}.tsx`, code: `// ${name}` }],
  ...extra,
})

const index: ComponentIndex = {
  package: "@scope/ui",
  version: "1.0.0",
  components: [
    entry("button", "Clickable control."),
    entry("dialog", "Modal window over the page.", {
      exports: ["Dialog", "DialogTitle"],
      baseUiDoc: "dialog",
    }),
    entry("alert-dialog", "Modal dialog that asks to confirm."),
    entry("calendar", "Date grid."),
  ],
}

const baseUiDoc = (name: string) =>
  name === "dialog"
    ? "# Dialog\n\nDemo.\n\n## API reference\n\n### Root\n| Prop |"
    : null

test("list returns one summary per component", () => {
  const result = list(index)
  assert.equal(result.version, "1.0.0")
  assert.deepEqual(result.components[0], {
    name: "button",
    title: "Button",
    description: "Clickable control.",
    import: "@scope/ui/button",
  })
})

test("search ranks name matches over description matches and drops misses", () => {
  const result = search(index, "dialog")
  assert.deepEqual(
    result.components.map((c) => c.name),
    ["dialog", "alert-dialog"]
  )
  assert.ok(result.components[0]!.score > result.components[1]!.score)
})

test("search matches descriptions and honors limit", () => {
  assert.deepEqual(
    search(index, "modal", 1).components.map((c) => c.name),
    ["dialog"]
  )
})

test("docs returns the entry plus the API reference slice of the Base UI doc", () => {
  const result = docs(index, "dialog", baseUiDoc)
  assert.equal(result.import, "@scope/ui/dialog")
  assert.equal(result.props, "## API reference\n\n### Root\n| Prop |")
  assert.equal(docs(index, "calendar", baseUiDoc).props, null)
})

test("source returns each source file with its code", () => {
  assert.deepEqual(source(index, "dialog"), {
    name: "dialog",
    import: "@scope/ui/dialog",
    files: [{ path: "src/components/dialog.tsx", code: "// dialog" }],
  })
  assert.throws(() => source(index, "nope"), /Unknown component/)
})

test("docs leaves the source code out", () => {
  assert.equal("source" in docs(index, "dialog", baseUiDoc), false)
})

test("docs on an unknown name throws with suggestions", () => {
  assert.throws(
    () => docs(index, "dialogs", baseUiDoc),
    (error: Error & { suggestions?: string[] }) =>
      error.message === 'Unknown component "dialogs"' &&
      error.suggestions![0] === "dialog"
  )
})
