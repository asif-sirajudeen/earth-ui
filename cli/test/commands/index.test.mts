import assert from "node:assert/strict"
import { test } from "node:test"
import { parseArgs } from "node:util"

import { COMMANDS, OPTIONS, USAGE } from "../../commands/index.mts"

test("USAGE is derived from COMMANDS and matches the published string", () => {
  assert.equal(
    USAGE,
    'Usage: earth-ui list | search <query> [--limit n] | docs <name> [--full] | examples <name> | source <name> [--raw] | setup. Run "earth-ui help" for details.'
  )
})

test("every command flag is accepted by the parsed options, with one type per flag", () => {
  const seen = new Map<string, string>()
  for (const { name, flags = {} } of COMMANDS)
    for (const [flag, { type }] of Object.entries(flags)) {
      assert.ok(flag in OPTIONS, `${name}: --${flag} is not in OPTIONS`)
      assert.equal(OPTIONS[flag]!.type, type, `${name}: --${flag} type`)
      assert.ok(
        (seen.get(flag) ?? type) === type,
        `--${flag} is declared with two types`
      )
      seen.set(flag, type)
      const value = type === "string" ? ["x"] : []
      parseArgs({ args: [`--${flag}`, ...value], options: OPTIONS })
    }
  assert.equal(OPTIONS.help!.short, "h")
})
