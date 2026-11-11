import assert from "node:assert/strict"
import { test } from "node:test"

import { search } from "../../commands/search.mts"
import { index } from "../fixtures.mts"

test("search ranks name matches over description matches and drops misses", () => {
  const result = search(index, "dialog")
  assert.deepEqual(
    result.components.map((c) => c.name),
    ["dialog", "alert-dialog"]
  )
  assert.deepEqual(result.topics, [])
  assert.ok(result.components[0]!.score > result.components[1]!.score)
})

test("search with no match returns a hint; with a match it does not", () => {
  const none = search(index, "xyzzy")
  assert.deepEqual(none.components, [])
  assert.deepEqual(none.topics, [])
  assert.match(none.hint!, /earth-ui list/)
  assert.equal("hint" in search(index, "dialog"), false)
})

test("search points setup and convention words to topics", () => {
  assert.deepEqual(search(index, "dark mode").topics, [
    { name: "setup", command: "earth-ui setup", matched: "dark" },
  ])
  assert.equal(search(index, "css").topics[0]!.name, "setup")
  for (const q of ["aschild", "as child", "render"])
    assert.deepEqual(search(index, q).topics, [
      {
        name: "conventions",
        command: "earth-ui help",
        matched: q === "as child" ? "aschild" : q,
      },
    ])
  assert.equal("hint" in search(index, "css"), false)
})

test("search matches descriptions and honors limit", () => {
  assert.deepEqual(
    search(index, "modal", 1).components.map((c) => c.name),
    ["dialog"]
  )
})
