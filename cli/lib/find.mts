import { search } from "../commands/search.mts"
import type { ComponentEntry, ComponentIndex } from "./component-index.mts"

export class UnknownComponentError extends Error {
  readonly suggestions: string[]
  constructor(name: string, suggestions: string[]) {
    super(`Unknown component "${name}"`)
    this.suggestions = suggestions
  }
}

export function find(index: ComponentIndex, name: string): ComponentEntry {
  const entry = index.components.find((c) => c.name === name)
  if (!entry)
    throw new UnknownComponentError(
      name,
      search(index, name, 5).components.map((c) => c.name)
    )
  return entry
}
