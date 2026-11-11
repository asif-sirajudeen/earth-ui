import type { Command } from "../context.mts"
import { docsCommand } from "./docs.mts"
import { examplesCommand } from "./examples.mts"
import { helpCommand } from "./help.mts"
import { listCommand } from "./list.mts"
import { searchCommand } from "./search.mts"
import { setupCommand } from "./setup.mts"
import { sourceCommand } from "./source.mts"

/** Every command, in `help` order. Drives dispatch, `help`, `USAGE` and the `parseArgs` options. */
export const COMMANDS: readonly Command[] = [
  listCommand,
  searchCommand,
  docsCommand,
  examplesCommand,
  sourceCommand,
  setupCommand,
  helpCommand,
]

/** The error for a missing or unknown command: every usage except `help`, "earth-ui" named once. */
export const USAGE = `Usage: ${COMMANDS.filter((c) => c.name !== "help")
  .map((c, i) => (i ? c.usage.replace(/^earth-ui /, "") : c.usage))
  .join(" | ")}. Run "earth-ui help" for details.`

/** `--help` / `-h` is global; every other flag comes from the command that declares it. */
export const OPTIONS: Record<
  string,
  { type: "string" | "boolean"; short?: string }
> = {
  help: { type: "boolean", short: "h" },
  ...Object.assign({}, ...COMMANDS.map((c) => c.flags)),
}
