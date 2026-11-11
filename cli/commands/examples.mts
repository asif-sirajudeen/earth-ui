import type { Command } from "../context.mts"
import type { ComponentIndex } from "../lib/component-index.mts"
import { examplesFor, type ExamplesData } from "../lib/examples-data.mts"
import { find } from "../lib/find.mts"

/** Runnable Examples of a component, `-demo` first. Pure over the index and the built examples data. */
export function examples(
  index: ComponentIndex,
  name: string,
  data: ExamplesData
) {
  const entry = find(index, name)
  const found = examplesFor(data, name).examples
  return {
    name: entry.name,
    import: entry.import,
    importsNote:
      "imports lists modules other than react and this package that the Example uses; install them yourself if you copy it.",
    examples: found,
    ...(found.length
      ? {}
      : { note: `No Examples for ${name}. Run earth-ui docs ${name}.` }),
  }
}

export const examplesCommand: Command = {
  name: "examples",
  usage: "earth-ui examples <name>",
  description:
    "Runnable Examples of the component, the -demo first, each with its code and the other modules it imports.",
  exampleArgs: "dialog",
  needsArg: true,
  run: ({ index, examplesData }, arg) => examples(index, arg, examplesData),
}
