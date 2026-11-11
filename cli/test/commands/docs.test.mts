import assert from "node:assert/strict"
import { test } from "node:test"

import { docs } from "../../commands/docs.mts"
import { baseUiDoc, index } from "../fixtures.mts"
import {
  baseUiProp,
  cli,
  partNamed,
  real,
  realDocs,
  type J,
} from "../real-data.mts"

test("docs returns the entry plus the API reference slice of the Base UI doc", () => {
  const result = docs(index, "dialog", baseUiDoc)
  assert.equal(result.import, "@scope/ui/dialog")
  assert.deepEqual(result.props.parts, [])
  assert.equal(result.props.baseUi?.doc, "dialog")
  assert.equal("reference" in result, false)
  assert.equal(docs(index, "calendar", baseUiDoc).props.baseUi, null)
})
test("docs leaves the source code out", () => {
  const result = docs(index, "dialog", baseUiDoc)
  assert.equal("source" in result, false)
})

test("docs on an unknown name throws with suggestions", () => {
  assert.throws(
    () => docs(index, "dialogs", baseUiDoc),
    (error: Error & { suggestions?: string[] }) =>
      error.message === 'Unknown component "dialogs"' &&
      error.suggestions![0] === "dialog"
  )
})

// ponytail: budget is the measured size (12.8 KB) rounded up to the next KB; trim before raising.
test("docs select default stays within the size budget", real, () => {
  const bytes = Buffer.byteLength(cli("docs", "select"))
  assert.ok(bytes <= 13 * 1024, `docs select is ${bytes} bytes`)
})

test("docs props carry the signatures that matter", real, () => {
  const select = realDocs("select")
  for (const key of ["value", "onValueChange"])
    assert.match(baseUiProp(select, "Root", key).type, /\bnull\b/)
  assert.match(
    baseUiProp(realDocs("slider"), "Root", "onValueChange").type,
    /number\[\]/
  )
  assert.match(
    baseUiProp(realDocs("toggle-group"), "ToggleGroup", "value").type,
    /string\[\]/
  )
  const size = partNamed(realDocs("card"), "Card").props.find(
    (p: J) => p.name === "size"
  )
  assert.match(size.type, /"default" \| "sm"/)
  const sheet = realDocs("sheet")
  const content = partNamed(sheet, "SheetContent").props.map((p: J) => p.name)
  assert.ok(content.includes("side") && content.includes("showCloseButton"))
  assert.equal(sheet.props.baseUi.doc, "dialog")
  const calendar = partNamed(realDocs("calendar"), "Calendar")
  assert.match(calendar.forwards, /react-day-picker.*DayPicker/)
  const resizable = realDocs("resizable")
  assert.match(
    partNamed(resizable, "ResizablePanelGroup").forwards,
    /react-resizable-panels/
  )
  assert.ok(
    partNamed(resizable, "ResizableHandle").props.some(
      (p: J) => p.name === "withHandle"
    )
  )
  assert.match(
    partNamed(realDocs("use-mobile"), "useIsMobile").returns,
    /boolean/
  )
  const hook = partNamed(realDocs("use-highlighted-code"), "useHighlightedCode")
  assert.deepEqual(hook.params.map((p: J) => p.name).slice(0, 2), [
    "value",
    "language",
  ])
  assert.match(hook.returns, /string/)
})

test("every component has props info and no HTML entity", real, () => {
  const entity = /&(?:#\d+|#x[0-9a-f]+|[a-z]+);/i
  const ALLOWED_EMPTY = ["direction"]
  for (const { name } of JSON.parse(cli("list")).components) {
    const out = cli("docs", name)
    assert.ok(!entity.test(out), `${name} has an entity`)
    const { props } = JSON.parse(out)
    const has =
      props.parts.some((p: J) => p.forwards || p.props?.length || p.params) ||
      props.baseUi?.parts.length
    assert.ok(has || ALLOWED_EMPTY.includes(name), `${name} has no props info`)
  }
})

test("docs --full adds the decoded Base UI reference", real, () => {
  const full = JSON.parse(cli("docs", "dialog", "--full"))
  assert.ok(full.reference.startsWith("## API reference"))
  assert.equal(JSON.parse(cli("docs", "direction", "--full")).reference, null)
})
