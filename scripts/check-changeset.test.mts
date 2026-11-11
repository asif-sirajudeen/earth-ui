import assert from "node:assert/strict"
import { test } from "node:test"

import { missingChangeset } from "./check-changeset.mts"

const cs = [".changeset/brave-owls-sing.md"]

test("package change without a changeset fails", () => {
  assert.match(missingChangeset(["src/components/button.tsx"], [])!, /button/)
  assert.ok(missingChangeset(["styles.css"], [".changeset/README.md"]))
})

test("package change with a changeset (empty opt-out included) passes", () => {
  assert.equal(missingChangeset(["cli/earth-ui.mts"], cs), null)
})

test("docs, site, CI, planning and test-only changes pass", () => {
  assert.equal(
    missingChangeset(
      [
        "README.md",
        "site/app/page.tsx",
        ".github/workflows/ci.yml",
        "cli/commands/search.test.mts",
        "cli/test/fixtures.mts",
        "cli/test/commands/docs.test.mts",
        "scripts/x.mts",
      ],
      []
    ),
    null
  )
})
