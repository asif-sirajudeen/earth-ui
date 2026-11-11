import assert from "node:assert/strict"
import { test } from "node:test"

import { docs } from "../../commands/docs.mts"
import { help, helpText } from "../../commands/help.mts"
import { COMMANDS } from "../../commands/index.mts"
import { baseUiDoc, index } from "../fixtures.mts"

test("help has a fields entry for every docs key", () => {
  const { fields } = help("@scope/ui", COMMANDS)
  const full = docs(index, "dialog", baseUiDoc, {}, { full: true })
  for (const key of Object.keys(full))
    assert.ok(key in fields, `no FIELDS entry for ${key}`)
  assert.match(fields.rootImport, /import only from the `import` subpath/)
})

test("help states the render convention", () => {
  assert.match(help("@scope/ui", COMMANDS).conventions[0]!.text, /no asChild/)
})

test("help lists every command with usage and an example", () => {
  const result = help("@scope/ui", COMMANDS)
  assert.deepEqual(
    result.commands.map((c) => c.name),
    ["list", "search", "docs", "examples", "source", "setup", "help"]
  )
  for (const c of result.commands) {
    assert.ok(c.usage.startsWith(`earth-ui ${c.name}`))
    assert.ok(c.example.startsWith(`npx @scope/ui ${c.name}`))
  }
})

test("helpText prints every command usage and the conventions as text", () => {
  const text = helpText("@scope/ui", COMMANDS)
  for (const c of help("@scope/ui", COMMANDS).commands)
    assert.ok(text.includes(c.usage))
  assert.match(text, /no asChild/)
  assert.throws(() => JSON.parse(text))
})
