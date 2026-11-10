// Page layout rules for renderPage. Run with `pnpm --filter site test`.

import assert from "node:assert/strict"
import test from "node:test"

import { groupExamples, renderPage } from "./render-page.mjs"

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

const ex = (name, code = "export default function X() { return null }") => ({
  name,
  code,
})

test("examples render as Examples section with tabs, before Install", () => {
  assert.ok(!renderPage(docs(), source()).includes("## Examples"))
  const out = renderPage(docs(), source(), [
    ex("dialog-demo"),
    ex("dialog-close-button", "export function CloseButton() {}"),
  ])
  assert.ok(out.includes('import Ex_0 from "@/examples/dialog-demo"'))
  assert.ok(
    out.includes(
      'import { CloseButton as Ex_1 } from "@/examples/dialog-close-button"'
    )
  )
  assert.ok(out.includes('import { Tab, Tabs } from "fumadocs-ui/components/tabs"'))
  assert.ok(out.includes("### Demo"))
  assert.ok(out.includes("### Close Button"))
  assert.ok(out.includes("  <Ex_0 />"))
  assert.ok(out.includes("  <Ex_1 />"))
  assert.ok(out.includes('<Tabs items={["Preview", "Code"]}>'))
  assert.ok(out.includes("```tsx\nexport default function X() { return null }\n```"))
  assert.ok(out.indexOf("## Examples") < out.indexOf("## Install"))
})

test("export detection: function, const, default", () => {
  const imp = (code) =>
    renderPage(docs(), source(), [ex("dialog-a", code)]).match(
      /import (.*) from "@\/examples/
    )[1]
  assert.equal(imp("export function A() {}"), "{ A as Ex_0 }")
  assert.equal(imp("export const B = () => null"), "{ B as Ex_0 }")
  assert.equal(imp("export default () => null"), "Ex_0")
  assert.equal(
    imp("export const works = []\nexport function Demo() {}"),
    "{ Demo as Ex_0 }"
  )
  // `export default` inside a template string must not count
  assert.equal(
    imp("const s = `@@ export default x`\nexport function T() {}"),
    "{ T as Ex_0 }"
  )
})

test("groupExamples: longest component prefix wins, order demo then alpha", () => {
  const names = ["alert", "alert-dialog", "dialog"]
  const { groups, ignored } = groupExamples(
    [
      ex("alert-dialog-basic"),
      ex("alert-basic"),
      ex("alert-demo"),
      ex("alert-action"),
      ex("alertish-x"),
      ex("zzz-demo"),
    ],
    names
  )
  assert.deepEqual(
    groups["alert"].map((e) => e.name),
    ["alert-demo", "alert-action", "alert-basic"]
  )
  assert.deepEqual(
    groups["alert-dialog"].map((e) => e.name),
    ["alert-dialog-basic"]
  )
  assert.equal(ignored, 2)
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
