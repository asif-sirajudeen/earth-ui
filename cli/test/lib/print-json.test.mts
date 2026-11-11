import assert from "node:assert/strict"
import { test } from "node:test"

import { printJson } from "../../lib/print-json.mts"

test("printJson is valid JSON and one line per innermost object", () => {
  const value = {
    a: [{ name: 'x"}', type: "{ [k: string]: 1 }" }, { n: 1 }],
    b: { c: [], d: {}, e: null, f: { g: "]" } },
    h: "s",
  }
  const out = printJson(value)
  assert.deepEqual(JSON.parse(out), value)
  assert.ok(out.includes(`{ "name": "x\\"}", "type": "{ [k: string]: 1 }" }`))
  assert.ok(out.includes(`"f": { "g": "]" }`))
})
