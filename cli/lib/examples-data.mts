// Runtime lookup over dist/examples.json (built by scripts/build/examples.mts).
export type Example = { name: string; code: string; imports: string[] }
export type ExamplesData = Record<string, Example[]>

/** Examples for a component: `<name>-demo` first, the rest by name. Unknown or empty -> []. */
export function examplesFor(
  data: ExamplesData,
  name: string
): { name: string; examples: Example[] } {
  const demo = `${name}-demo`
  const examples = [...(data[name] ?? [])].sort(
    (a, b) =>
      Number(b.name === demo) - Number(a.name === demo) ||
      a.name.localeCompare(b.name)
  )
  return { name, examples }
}
