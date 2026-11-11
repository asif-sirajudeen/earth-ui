import assert from "node:assert/strict"
import { readdirSync, readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import { test } from "node:test"

import {
  baseUiParts,
  decodeEntities,
  docsProps,
  fullReference,
} from "../../lib/props.mts"

const docsDir = join(
  dirname(
    createRequire(import.meta.url).resolve("@base-ui/react/package.json")
  ),
  "docs/react/components"
)
const doc = (name: string) => readFileSync(join(docsDir, `${name}.md`), "utf8")
const prop = (name: string, part: string, prop: string) =>
  baseUiParts(doc(name))
    .find((p) => p.name === part)!
    .props.find((p) => p.name === prop)!

const TABLE = `intro
## API reference

### Root

**Root Props:**

| Prop | Type | Default | Description |
| :--- | :--- | :------ | :---------- |
| value | \`string \\| null\` | \`'a'\` | Line one.&#xA;Line two &lt;b&gt;. Second sentence. |
| open | \`boolean\` | - | Whether it is open. |
| className | \`string\` | - | Class. |
| style | \`CSSProperties\` | - | Style. |
| render | \`ReactElement\` | - | Render. |

**Root Data Attributes:**

| Attribute | Type | Description |
| :-------- | :--- | :---------- |
| data-open | - | Present when open. |

### Root.State

\`\`\`typescript
type X = {};
\`\`\`

## Additional Types

| Prop | Type | Default | Description |
| x | \`y\` | - | ignored |
`

test("decodeEntities handles named, decimal and hex entities, once", () => {
  assert.equal(decodeEntities("a&#xA;b"), "a b")
  assert.equal(
    decodeEntities("&lt;T&gt; &amp; &quot;x&quot; &#x27;y&#39;"),
    `<T> & "x" 'y'`
  )
  assert.equal(decodeEntities("&amp;lt;"), "&lt;")
  assert.equal(decodeEntities("&unknown;"), "&unknown;")
})

test("baseUiParts keeps prop tables only, with first-sentence descriptions", () => {
  assert.deepEqual(baseUiParts(TABLE), [
    {
      name: "Root",
      props: [
        {
          name: "value",
          type: "string | null",
          default: "'a'",
          description: "Line one.",
        },
        {
          name: "open",
          type: "boolean",
          default: null,
          description: "Whether it is open.",
        },
      ],
    },
  ])
  assert.deepEqual(baseUiParts("no reference"), [])
})

test("fullReference keeps the whole reference with entities decoded", () => {
  const full = fullReference(TABLE)
  assert.ok(full.startsWith("## API reference"))
  assert.ok(full.includes("Root.State") && full.includes("data-open"))
  assert.ok(full.includes("Line one. Line two <b>."))
  assert.ok(!full.includes("&#xA;"))
})

test("controlled-state signatures stay visible", () => {
  for (const key of ["value", "onValueChange"])
    assert.match(prop("select", "Root", key).type, /\bnull\b/)
  assert.match(prop("slider", "Root", "onValueChange").type, /number\[\]/)
  assert.match(prop("toggle-group", "ToggleGroup", "value").type, /string\[\]/)
})

test("descriptions are one short line", () => {
  for (const part of baseUiParts(doc("slider")))
    for (const { description } of part.props) {
      assert.ok(!description.includes("\n"))
      assert.ok(description.length <= 100, description)
    }
})

test("no HTML entity survives in any real Base UI doc", () => {
  const entity = /&(?:#\d+|#x[0-9a-f]+|[a-z]+);/i
  for (const file of readdirSync(docsDir).filter((f) => f.endsWith(".md"))) {
    const md = readFileSync(join(docsDir, file), "utf8")
    assert.ok(!entity.test(JSON.stringify(docsProps([], md, file))), file)
    assert.ok(!entity.test(fullReference(md)), file)
  }
})

test("docsProps wraps parts and the Base UI reference", () => {
  const parts = [{ name: "Card", forwards: "div", props: [] }]
  assert.deepEqual(docsProps(parts, null), { parts, baseUi: null })
  const { baseUi } = docsProps(parts, TABLE, "root")
  assert.equal(baseUi?.doc, "root")
  assert.match(baseUi!.common, /className, style and render/)
})
