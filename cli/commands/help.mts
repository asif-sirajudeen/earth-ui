import type { Command } from "../context.mts"
import { CONVENTIONS } from "../lib/conventions.mts"
import { FIELDS } from "./docs.mts"

/** `commands` is the full registry, passed in so this file does not import commands/index.mts. */
export function help(pkg: string, commands: readonly Command[]) {
  return {
    description:
      "Look up components in the installed package. Every command prints JSON (source --raw prints plain text; help prints text at a terminal, JSON when piped or with --json); errors print JSON on stderr and exit 1. Examples use the scoped npx command because the unscoped `npx earth-ui` can run a different npm package; usage lines show the bin name.",
    commands: commands.map(({ name, usage, description, exampleArgs }) => ({
      name,
      usage,
      description,
      example: `npx ${pkg} ${name}${exampleArgs ? ` ${exampleArgs}` : ""}`,
    })),
    fields: FIELDS,
    conventions: CONVENTIONS,
  }
}

/** `help` as text for a person at a terminal. Same content as the JSON. */
export function helpText(pkg: string, commands: readonly Command[]): string {
  const h = help(pkg, commands)
  const width = Math.max(...h.commands.map((c) => c.usage.length))
  const fieldWidth = Math.max(...Object.keys(h.fields).map((k) => k.length))
  return [
    h.description,
    "",
    "Commands:",
    ...h.commands.map((c) => `  ${c.usage.padEnd(width)}  ${c.description}`),
    "",
    "Examples:",
    ...h.commands.map((c) => `  ${c.example}`),
    "",
    "docs fields:",
    ...Object.entries(h.fields).map(
      ([k, v]) => `  ${k.padEnd(fieldWidth)}  ${v}`
    ),
    "",
    "Conventions:",
    ...h.conventions.map((c) => `  ${c.text}`),
  ].join("\n")
}

export const helpCommand: Command = {
  name: "help",
  usage: "earth-ui help",
  description: "This list. Also --help or -h.",
  exampleArgs: "",
  needsArg: false,
  flags: { json: { type: "boolean" } },
  // A person at a terminal gets text; a pipe or a tool gets JSON (or force it with --json).
  run: ({ index }, _arg, flags, commands) =>
    flags.tty && !flags.json
      ? helpText(index.package, commands)
      : help(index.package, commands),
}
