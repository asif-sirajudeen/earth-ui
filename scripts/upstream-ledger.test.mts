import assert from "node:assert/strict"
import { test } from "node:test"

import {
  compareSemver,
  diffRules,
  parseCnRules,
  releaseVersions,
} from "./upstream-ledger.mts"

const css = `.style-nova {
  /* MARK: Checkbox */
  .cn-checkbox {
    @apply size-4
      rounded;
  }

  .cn-checkbox-aria {
    @apply size-5;
  }

  .cn-alert-variant-default {
    @apply bg-card;
  }
}`

test("parseCnRules keeps cn-* rules, drops *-aria, matches 'variant' names", () => {
  const rules = parseCnRules(css)
  assert.deepEqual(
    [...rules.keys()],
    ["cn-checkbox", "cn-alert-variant-default"]
  )
  assert.equal(rules.get("cn-checkbox"), "@apply size-4 rounded;")
})

test("diffRules reports added, removed, changed", () => {
  const prev = new Map([
    ["cn-a", "x"],
    ["cn-b", "y"],
    ["cn-c", "z"],
  ])
  const next = new Map([
    ["cn-a", "x2"],
    ["cn-c", "z"],
    ["cn-d", "w"],
  ])
  assert.deepEqual(diffRules(prev, next), {
    added: ["cn-d"],
    removed: ["cn-b"],
    changed: ["cn-a"],
  })
})

test("releaseVersions sorts numerically and skips non-release tags", () => {
  const refs = [
    "refs/tags/shadcn@4.10.0",
    "refs/tags/shadcn@4.9.0",
    "refs/tags/shadcn@4.10.0-beta.1",
    "refs/tags/shadcn@4.2.1",
  ]
  assert.deepEqual(releaseVersions(refs), ["4.2.1", "4.9.0", "4.10.0"])
  assert.ok(compareSemver("4.10.0", "4.9.0") > 0)
})
