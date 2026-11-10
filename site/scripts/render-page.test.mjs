// Page layout rules for renderPage. Run with `pnpm --filter site test`.

import assert from "node:assert/strict"
import test from "node:test"

import { renderPage } from "./render-page.mjs"

const docs = (over = {}) => ({
  name: "dialog",
  title: 'Dia"log: modal',
  description: 'Says "hi": ok',
  import: "@asif-sirajudeen/earth-ui/dialog",
  rootImport: true,
  exports: ["Dialog", "DialogTrigger"],
  variants: null,
  dependencies: ["cn@~0.5.2"],
  links: { api: "https://base-ui.com/react/components/dialog.md" },
  props: "## API reference\n\n### Root\n",
  ...over,
})
const source = (code = "const a = 1") => ({
  name: "dialog",
  files: [{ path: "src/components/dialog.tsx", code }],
})

test("frontmatter is JSON-quoted", () => {
  const out = renderPage(docs(), source())
  assert.ok(out.startsWith("---\n"))
  assert.ok(out.includes(`title: ${JSON.stringify('Dia"log: modal')}\n`))
  assert.ok(out.includes(`description: ${JSON.stringify('Says "hi": ok')}\n`))
})

test("variants omitted when null, tabled when present", () => {
  assert.ok(!renderPage(docs(), source()).includes("## Variants"))
  const out = renderPage(docs({ variants: { size: ["sm", "lg"] } }), source())
  assert.ok(out.includes("## Variants"))
  assert.ok(out.includes("| size | `sm`, `lg` |"))
})

test("API reference links to the Base UI page instead of inlining props", () => {
  const out = renderPage(docs({ baseUiDoc: "preview-card" }), source())
  assert.ok(out.includes("## API reference"))
  assert.ok(out.includes("(https://base-ui.com/react/components/preview-card)"))
  assert.ok(!out.includes("### Root"))
})

test("API link falls back to links.api without .md, omitted when neither", () => {
  const out = renderPage(docs({ baseUiDoc: null }), source())
  assert.ok(out.includes("(https://base-ui.com/react/components/dialog)"))
  const none = renderPage(docs({ baseUiDoc: null, links: {} }), source())
  assert.ok(!none.includes("API reference"))
})

test("preview renders the example and its code when one exists", () => {
  assert.ok(!renderPage(docs(), source()).includes("## Preview"))
  const out = renderPage(docs(), source(), "export default () => null")
  assert.ok(out.includes('import Demo from "@/examples/dialog"'))
  assert.ok(out.includes("<Demo />"))
  assert.ok(out.includes("```tsx\nexport default () => null\n```"))
  assert.ok(out.indexOf("## Preview") < out.indexOf("## Install"))
})

test("source fence widens when code has triple backticks", () => {
  const plain = renderPage(docs(), source())
  assert.ok(plain.includes("```tsx\nconst a = 1\n```"))
  const wide = renderPage(docs(), source("x\n```\ny"))
  assert.ok(wide.includes("````tsx\nx\n```\ny\n````"))
})

test("package-mode install uses import path and exports", () => {
  const out = renderPage(docs(), source())
  assert.ok(out.includes("pnpm add @asif-sirajudeen/earth-ui"))
  assert.ok(
    out.includes(
      'import { Dialog, DialogTrigger } from "@asif-sirajudeen/earth-ui/dialog"'
    )
  )
})

test("copy-mode uses registry URL", () => {
  const out = renderPage(docs(), source())
  assert.ok(
    out.includes(
      "npx shadcn@latest registry add @earth-ui=https://asif-sirajudeen.github.io/earth-ui/r/dialog.json"
    )
  )
  assert.ok(out.includes("npx shadcn@latest add @earth-ui/dialog"))
})
