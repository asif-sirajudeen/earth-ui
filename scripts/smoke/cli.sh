#!/usr/bin/env bash
# Runs the built earth-ui bin (run `pnpm build` first). Shared by CI and the release workflow.
set -euo pipefail

node dist/cli.js docs dialog | node -e '
  let out = ""
  process.stdin.on("data", (d) => (out += d)).on("end", () => {
    const { props } = JSON.parse(out)
    if (props.baseUi?.doc !== "dialog" || !props.baseUi.parts.length || !props.parts.length)
      throw new Error("docs dialog has no structured props")
  })
'
node dist/cli.js source dialog | grep -q '"code": "\\"use client\\"'
# Only items with no import path may be missing from the CLI.
node dist/cli.js list | node -e '
  let out = ""
  process.stdin.on("data", (d) => (out += d)).on("end", () => {
    const names = new Set(JSON.parse(out).components.map((c) => c.name))
    const missing = require("./registry.json").items.map((i) => i.name).filter((n) => !names.has(n))
    if (missing.sort().join() !== "style") throw new Error("Missing from CLI: " + missing)
  })
'
