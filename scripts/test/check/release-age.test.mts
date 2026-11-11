import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

import { parseWorkspace, staleEntries } from "../../check/release-age.mts"

const yaml = `allowBuilds:
  esbuild: false
minimumReleaseAge: 1440
minimumReleaseAgeExclude:
  - lucide-react@1.70.0
  - "@next/env@16.4.6"
`

test("parseWorkspace reads the limit and entries", () => {
  assert.deepEqual(parseWorkspace(yaml), {
    minutes: 1440,
    entries: ["lucide-react@1.70.0", "@next/env@16.4.6"],
  })
  assert.deepEqual(
    parseWorkspace("minimumReleaseAge: 5\nminimumReleaseAgeExclude: []\n")
      .entries,
    []
  )
})

test("the repo's workspace file parses", () => {
  parseWorkspace(readFileSync("pnpm-workspace.yaml", "utf8"))
})

test("staleEntries flags only entries older than the limit", () => {
  const now = new Date("2026-11-11T00:00:00Z")
  assert.deepEqual(
    staleEntries(
      { "a@1": "2026-11-09T00:00:00Z", "b@1": "2026-11-10T12:00:00Z" },
      1440,
      now
    ),
    ["a@1"]
  )
})
