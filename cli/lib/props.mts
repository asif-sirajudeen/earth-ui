// Runtime half of `docs` props: shapes the build-time part data (dist/props.json, from
// scripts/build/props.mts) and the Base UI markdown reference into one structure.
// Stdlib only: this ships in the CLI bin.

export type Prop = { name: string; type: string }
export type ComponentPart = {
  name: string
  forwards: string | null
  props: Prop[]
}
export type HookPart = { name: string; params: Prop[]; returns: string }
export type Part = ComponentPart | HookPart
export type BaseUiProp = {
  name: string
  type: string
  default: string | null
  description: string
}
export type BaseUiPart = { name: string; props: BaseUiProp[] }
export type DocsProps = {
  parts: Part[]
  baseUi: { doc: string; common: string; parts: BaseUiPart[] } | null
}

const NAMED: Record<string, string> = {
  lt: "<",
  gt: ">",
  amp: "&",
  quot: '"',
  apos: "'",
  nbsp: " ",
}

/** Decodes named (`&lt;`) and numeric (`&#39;`, `&#x27;`) entities in one pass; newlines become spaces. */
export function decodeEntities(s: string): string {
  return s.replace(
    /&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi,
    (all, dec, hex, name) => {
      if (name) return NAMED[name.toLowerCase()] ?? all
      const ch = String.fromCodePoint(dec ? Number(dec) : parseInt(hex, 16))
      return /\s/.test(ch) ? " " : ch
    }
  )
}

const REFERENCE = "## API reference"
// Props every Base UI part has: listed once in `common`, not per part.
const COMMON_PROPS = new Set(["className", "style", "render"])
const COMMON =
  "Every part also accepts className, style and render (compose with render={<Element />}; there is no asChild)."
const DESCRIPTION_CAP = 100

/** The doc text from "## API reference" to the end, or null when there is none. */
function referenceOf(markdown: string): string | null {
  const start = markdown.indexOf(REFERENCE)
  return start < 0 ? null : markdown.slice(start)
}

/** The full "## API reference" slice, decoded. Entity newlines are spaces so table rows stay on one line. */
export function fullReference(markdown: string): string {
  return decodeEntities(referenceOf(markdown) ?? "")
}

const firstSentence = (s: string) => {
  const one = s.replace(/\s+/g, " ").trim()
  const sentence = one.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? one
  return sentence.length > DESCRIPTION_CAP
    ? `${sentence.slice(0, DESCRIPTION_CAP - 3).trimEnd()}...`
    : sentence
}

const unwrap = (cell: string) => cell.replace(/^`|`$/g, "")

/**
 * The prop tables of a Base UI doc ("**Root Props:**"), one part each. Data attribute, CSS
 * variable and type sections are dropped, and so are the props every part shares (COMMON);
 * `docs --full` has it all.
 */
export function baseUiParts(markdown: string): BaseUiPart[] {
  const reference = referenceOf(markdown)
  if (!reference) return []
  const parts: BaseUiPart[] = []
  let current: BaseUiPart | null = null
  for (const line of reference.split("\n")) {
    if (line.startsWith("## ") && !line.startsWith(REFERENCE)) break
    const label = line.match(/^\*\*(.+) Props:\*\*$/)
    if (label) {
      current = { name: label[1]!, props: [] }
      parts.push(current)
    } else if (/^\*\*.*:\*\*$/.test(line) || /^#{1,3} /.test(line))
      current = null
    else if (current && line.startsWith("|")) {
      // Cells end at an unescaped pipe: types contain `\|`.
      const cells = line
        .slice(1, line.lastIndexOf("|"))
        .split(/(?<!\\)\|/)
        .map((c) => decodeEntities(c.replace(/\\\|/g, "|")).trim())
      if (cells.length !== 4 || cells[0] === "Prop" || /^:?-+/.test(cells[0]!))
        continue
      const [name, type, dflt, description] = cells as [
        string,
        string,
        string,
        string,
      ]
      if (COMMON_PROPS.has(name)) continue
      current.props.push({
        name,
        type: unwrap(type),
        default: dflt === "-" ? null : unwrap(dflt),
        description: firstSentence(description),
      })
    }
  }
  return parts.filter((p) => p.props.length)
}

/** The `props` field of `docs`: the module's own parts plus the Base UI reference, when it has one. */
export function docsProps(
  parts: Part[],
  baseUiMarkdown: string | null,
  doc = ""
): DocsProps {
  return {
    parts,
    baseUi:
      baseUiMarkdown === null
        ? null
        : { doc, common: COMMON, parts: baseUiParts(baseUiMarkdown) },
  }
}
