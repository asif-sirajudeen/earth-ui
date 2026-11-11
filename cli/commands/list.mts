import type { Command } from "../context.mts"
import type { ComponentEntry, ComponentIndex } from "../lib/component-index.mts"

export const summary = (c: ComponentEntry) => ({
  name: c.name,
  title: c.title,
  description: c.description,
  import: c.import,
})

export function list(index: ComponentIndex) {
  return {
    package: index.package,
    version: index.version,
    components: index.components.map(summary),
  }
}

export const listCommand: Command = {
  name: "list",
  usage: "earth-ui list",
  description: "Every component with its title, description and import path.",
  exampleArgs: "",
  needsArg: false,
  run: ({ index }) => list(index),
}
