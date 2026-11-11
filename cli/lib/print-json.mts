const isLeaf = (v: object) =>
  Object.values(v).every((x) => typeof x !== "object" || x === null)

/** JSON, indent 2, with every innermost object (no object or array values) on one line. */
export function printJson(value: unknown, indent = ""): string {
  if (typeof value !== "object" || value === null)
    return JSON.stringify(value) ?? "null"
  const inner = `${indent}  `
  if (Array.isArray(value)) {
    if (!value.length) return "[]"
    return `[\n${value.map((v) => inner + printJson(v, inner)).join(",\n")}\n${indent}]`
  }
  const entries = Object.entries(value).filter(([, v]) => v !== undefined)
  if (!entries.length) return "{}"
  const pair = ([k, v]: [string, unknown]) =>
    `${JSON.stringify(k)}: ${printJson(v, inner)}`
  if (isLeaf(value)) return `{ ${entries.map(pair).join(", ")} }`
  return `{\n${entries.map((e) => inner + pair(e)).join(",\n")}\n${indent}}`
}
