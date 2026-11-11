import assert from "node:assert/strict"
import { test } from "node:test"

import { list } from "../../commands/list.mts"
import { index } from "../fixtures.mts"

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
