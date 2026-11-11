import type { Command } from "../context.mts"
import type { ComponentIndex } from "../lib/component-index.mts"
import { summary } from "./list.mts"

// Non-component answers that search points to. `words` are matched against each query token
// and against the whole query with spaces removed ("as child" matches "aschild").
const TOPICS = [
  {
    name: "setup",
    command: "earth-ui setup",
    words: [
      "setup",
      "css",
      "theme",
      "dark",
      "tailwind",
      "tokens",
      "install",
      "provider",
      "providers",
      "styles",
    ],
  },
  {
    name: "conventions",
    command: "earth-ui help",
    words: ["aschild", "render"],
  },
]

/** Token match: name hits outweigh title, description and export-name hits. Topics come first. */
export function search(index: ComponentIndex, query: string, limit = 10) {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
  const candidates = [...tokens, tokens.join("")]
  const topics = TOPICS.flatMap(({ name, command, words }) => {
    const matched = candidates.find((w) => words.includes(w))
    return matched ? [{ name, command, matched }] : []
  })
  const scored = index.components.map((c) => {
    const exports = c.exports.join(" ").toLowerCase()
    let score = 0
    for (const t of tokens) {
      if (c.name === t) score += 5
      else if (c.name.includes(t) || t.includes(c.name)) score += 3
      if (c.title.toLowerCase().includes(t)) score += 2
      if (c.description.toLowerCase().includes(t)) score += 1
      if (exports.includes(t)) score += 1
    }
    return { ...summary(c), score }
  })
  const components = scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
  return {
    topics,
    components,
    ...(topics.length || components.length
      ? {}
      : { hint: "No match. Run earth-ui list to see every component." }),
  }
}

export const searchCommand: Command = {
  name: "search",
  usage: "earth-ui search <query> [--limit n]",
  description:
    "Components ranked by name, title, description and exported names. topics points to non-component answers (setup, conventions); hint appears when nothing matches. --limit defaults to 10.",
  exampleArgs: "modal --limit 5",
  needsArg: true,
  flags: { limit: { type: "string" } },
  run: ({ index }, arg, flags) => {
    const limit = flags.limit === undefined ? undefined : Number(flags.limit)
    if (limit !== undefined && (!Number.isInteger(limit) || limit < 1))
      throw new Error("--limit must be a positive integer")
    return search(index, arg, limit)
  },
}
