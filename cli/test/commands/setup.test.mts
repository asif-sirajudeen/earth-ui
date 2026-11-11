import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

import { help } from "../../commands/help.mts"
import { COMMANDS } from "../../commands/index.mts"
import { setup } from "../../commands/setup.mts"
import { index } from "../fixtures.mts"

test("setup reports package, css lines, providers and optional peers", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"))
  const result = setup(index, pkg)
  assert.equal(result.package, pkg.name)
  assert.equal(result.version, pkg.version)
  assert.deepEqual(result.css.lines, [
    '@import "tailwindcss";',
    `@import "${pkg.name}/styles.css";`,
  ])
  const tooltip = result.providers.find((p) => p.name === "TooltipProvider")!
  assert.equal(tooltip.required, false)
  assert.equal(tooltip.handKept, true)
  const toaster = result.providers.find((p) => p.component === "sonner")!
  assert.equal(toaster.kind, "mounted")
  assert.deepEqual(result.optionalPeers, [
    {
      package: "sonner",
      range: "^2.0.8",
      neededBy: ["sonner"],
      install: "npm install sonner@^2.0.8",
    },
    {
      package: "next-themes",
      range: "~0.4.6",
      neededBy: ["sonner"],
      install: "npm install next-themes@~0.4.6",
    },
  ])
  assert.equal(result.conventions, help("x", COMMANDS).conventions)
})
