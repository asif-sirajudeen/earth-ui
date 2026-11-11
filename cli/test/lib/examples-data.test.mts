import assert from "node:assert/strict"
import { test } from "node:test"

import { examplesFor, type ExamplesData } from "../../lib/examples-data.mts"

const ex = (name: string, imports: string[] = []) => ({
  name,
  code: "",
  imports,
})

test("demo first, then name order", () => {
  const data: ExamplesData = {
    dialog: [ex("dialog-basic"), ex("dialog-demo"), ex("dialog-alpha")],
  }
  assert.deepEqual(
    examplesFor(data, "dialog").examples.map((e) => e.name),
    ["dialog-demo", "dialog-alpha", "dialog-basic"]
  )
})

test("no demo -> name order; unknown -> empty", () => {
  const data: ExamplesData = { chart: [ex("chart-b"), ex("chart-a")] }
  assert.deepEqual(
    examplesFor(data, "chart").examples.map((e) => e.name),
    ["chart-a", "chart-b"]
  )
  assert.deepEqual(examplesFor(data, "nope").examples, [])
})
