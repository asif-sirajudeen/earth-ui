import assert from "node:assert/strict"
import { test } from "node:test"

import {
  drift,
  extractDeps,
  extractFiles,
  missingDeps,
} from "./upstream-check.mts"

const VIEW = `- Resolving items.
┌ shadcn add calendar (dry run)
│
├ src/components/button.tsx (skip) 2 lines
│ ┌──────────────────────────────────────────────
│ │ const a = 1
│ │
│ └──────────────────────────────────────────────
│
├ src/components/calendar.tsx (overwrite) 1 line
│ ┌──────────────────────────────────────────────
│ │   export const b = 2
│ └──────────────────────────────────────────────
│
└ Run without --dry-run to apply.
`

test("extractFiles reads path, status and body from the box", () => {
  assert.deepEqual(extractFiles(VIEW), [
    {
      path: "src/components/button.tsx",
      status: "skip",
      body: "const a = 1\n\n",
    },
    {
      path: "src/components/calendar.tsx",
      status: "overwrite",
      body: "  export const b = 2\n",
    },
  ])
})

test("extractDeps strips versions and keeps scopes", () => {
  const out = `├ Dependencies (4)
│ + cn
│ + react-day-picker@latest
│ + @base-ui/react
│ + @base-ui/react@1.0.0
│
│ 2 files, 3 deps`
  assert.deepEqual(extractDeps(out), [
    "cn",
    "react-day-picker",
    "@base-ui/react",
    "@base-ui/react",
  ])
})

test("drift is null when equal, else one hunk naming the changed lines", () => {
  assert.equal(drift("a\nb\n", "a\nb\n"), null)
  assert.equal(
    drift("a\nNEW\nc\n", "a\nOLD\nc\n"),
    "@@ -2,1 +2,1 @@\n-OLD\n+NEW"
  )
  assert.equal(drift("a\nb\n", "a\n"), "@@ -2,0 +2,1 @@\n+b")
})

test("missingDeps drops what we have and what is allowlisted", () => {
  assert.deepEqual(
    missingDeps(
      ["cn", "react-day-picker", "date-fns"],
      new Set(["cn", "react-day-picker"]),
      new Set()
    ),
    ["date-fns"]
  )
  assert.deepEqual(
    missingDeps(["date-fns"], new Set(), new Set(["date-fns"])),
    []
  )
})
