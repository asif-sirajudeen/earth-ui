#!/usr/bin/env node
// earth-ui: look up earth-ui components from the installed package. JSON on stdout.
//   earth-ui list
//   earth-ui search <query> [--limit n]
//   earth-ui docs <name> [--full]
//   earth-ui examples <name>
//   earth-ui source <name> [--raw]   (plain text instead of JSON)
//   earth-ui setup
//   earth-ui help | --help | -h      (text at a terminal; JSON when piped or with --json)
// Derives the Component Index from the bundled shadcn registry (dist/registry), the built
// .d.ts files and the docs shipped in @base-ui/react, so answers match the installed
// version and need no network.
//
// Layout: this file parses arguments and dispatches; commands/ has one file per command
// and commands/index.mts the registry (COMMANDS, USAGE, OPTIONS); context.mts loads the
// package data; lib/ holds the Component Index, props, examples data and shared helpers.
// Tests live in test/.
import { parseArgs } from "node:util"

import { COMMANDS, OPTIONS, USAGE } from "./commands/index.mts"
import { loadContext } from "./context.mts"
import { UnknownComponentError } from "./lib/find.mts"
import { printJson } from "./lib/print-json.mts"

const ctx = loadContext(import.meta.url)

function run(): unknown {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: OPTIONS,
  })
  const [name, ...rest] = positionals
  const arg = rest.join(" ")
  const flags = {
    limit: values.limit as string | undefined,
    full: values.full as boolean | undefined,
    raw: values.raw as boolean | undefined,
    json: values.json as boolean | undefined,
    tty: Boolean(process.stdout.isTTY),
  }
  const command = COMMANDS.find((c) =>
    values.help ? c.name === "help" : c.name === name
  )
  if (!command || (command.needsArg && !arg)) throw new Error(USAGE)
  return command.run(ctx, arg, flags, COMMANDS)
}

try {
  const out = run()
  console.log(typeof out === "string" ? out : printJson(out))
} catch (error) {
  const { message } = error as Error
  const suggestions =
    error instanceof UnknownComponentError ? error.suggestions : undefined
  console.error(JSON.stringify({ error: message, suggestions }, null, 2))
  process.exitCode = 1
}
