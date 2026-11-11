import assert from "node:assert/strict"
import { test } from "node:test"

import { source, sourceRaw } from "../../commands/source.mts"
import { index } from "../fixtures.mts"

test("source returns each source file with its code", () => {
  assert.deepEqual(source(index, "dialog"), {
    name: "dialog",
    import: "@scope/ui/dialog",
    importNote:
      "@/components/<x> imports in this source map to @scope/ui/<x>. Import from the package, not from @/.",
    files: [{ path: "src/components/dialog.tsx", code: "// dialog" }],
  })
  assert.throws(() => source(index, "nope"), /Unknown component/)
})

test("sourceRaw prints a header line per file, then the plain code", () => {
  assert.equal(
    sourceRaw(index, "dialog"),
    "// ==> src/components/dialog.tsx\n// dialog"
  )
  assert.throws(() => sourceRaw(index, "nope"), /Unknown component/)
})
