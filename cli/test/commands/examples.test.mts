import assert from "node:assert/strict"
import { test } from "node:test"

import { examples } from "../../commands/examples.mts"
import { index } from "../fixtures.mts"

const ex = (name: string) => ({ name, code: "", imports: [] })

test("examples puts -demo first and keeps name order otherwise", () => {
  const data = { dialog: [ex("dialog-b"), ex("dialog-demo"), ex("dialog-a")] }
  const result = examples(index, "dialog", data)
  assert.deepEqual(
    result.examples.map((e) => e.name),
    ["dialog-demo", "dialog-a", "dialog-b"]
  )
  assert.equal(result.import, "@scope/ui/dialog")
  assert.equal("note" in result, false)
  assert.deepEqual(
    examples(index, "dialog", { dialog: [ex("z"), ex("a")] }).examples.map(
      (e) => e.name
    ),
    ["a", "z"]
  )
})

test("examples throws on an unknown name and notes an empty list", () => {
  assert.throws(() => examples(index, "nope", {}), /Unknown component/)
  assert.equal(
    examples(index, "dialog", {}).note,
    "No Examples for dialog. Run earth-ui docs dialog."
  )
})
