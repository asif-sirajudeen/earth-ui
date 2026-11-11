import assert from "node:assert/strict"
import { test } from "node:test"

import { find, UnknownComponentError } from "../../lib/find.mts"
import { index } from "../fixtures.mts"

test("find returns the entry with that name", () => {
  assert.equal(find(index, "dialog").import, "@scope/ui/dialog")
})

test("find throws UnknownComponentError with ranked suggestions", () => {
  assert.throws(
    () => find(index, "dialogs"),
    (error: unknown) =>
      error instanceof UnknownComponentError &&
      error.message === 'Unknown component "dialogs"' &&
      error.suggestions[0] === "dialog"
  )
})
