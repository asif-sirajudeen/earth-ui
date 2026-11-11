// Builds dist/props.json from the built .d.ts files: for every exported component or hook of
// dist/components/*.d.ts and dist/hooks/*.d.ts, its own props (or params and return type) and the
// props type it forwards. Runs at build time only: the CLI reads the JSON and never imports
// `typescript`.
//
// Run after tsdown: node scripts/build-props.mts
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import ts from "typescript"

export type Prop = { name: string; type: string }
export type ComponentPart = {
  name: string
  /** The forwarded props type as written, qualified with its module where an import names it. */
  forwards: string | null
  /** Members of the inline `& { ... }` object the component adds. */
  props: Prop[]
}
export type HookPart = { name: string; params: Prop[]; returns: string }
export type Part = ComponentPart | HookPart

const flat = (node: ts.Node) => node.getText().replace(/\s+/g, " ")
const REACT_PROPS = /^React\.ComponentProps(?:WithRef|WithoutRef)?$/

/** Parts for each exported function or component (Uppercase) and hook (`useX`) of a .d.ts. */
export function partsFromDts(dts: string): Part[] {
  const sf = ts.createSourceFile("x.d.ts", dts, ts.ScriptTarget.Latest, true)
  const modules = new Map<string, string>() // local identifier -> module specifier
  const namespaces = new Set<string>() // `import * as X`: X is not part of the type's name
  const aliases = new Map<string, ts.TypeNode>()
  const decls = new Map<
    string,
    ts.FunctionDeclaration | ts.VariableDeclaration
  >()
  const exported: [local: string, name: string][] = []

  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st) && st.importClause) {
      const from = (st.moduleSpecifier as ts.StringLiteral).text
      const { name, namedBindings } = st.importClause
      if (name) modules.set(name.text, from)
      if (namedBindings && ts.isNamespaceImport(namedBindings)) {
        modules.set(namedBindings.name.text, from)
        namespaces.add(namedBindings.name.text)
      } else if (namedBindings)
        for (const el of namedBindings.elements) modules.set(el.name.text, from)
    } else if (ts.isTypeAliasDeclaration(st)) aliases.set(st.name.text, st.type)
    else if (ts.isFunctionDeclaration(st) && st.name) {
      decls.set(st.name.text, st)
      if (st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword))
        exported.push([st.name.text, st.name.text])
    } else if (ts.isVariableStatement(st))
      for (const d of st.declarationList.declarations)
        if (ts.isIdentifier(d.name)) decls.set(d.name.text, d)
    if (ts.isExportDeclaration(st) && !st.moduleSpecifier && st.exportClause)
      if (ts.isNamedExports(st.exportClause))
        for (const el of st.exportClause.elements)
          if (!el.isTypeOnly)
            exported.push([(el.propertyName ?? el.name).text, el.name.text])
  }

  /** `Dialog.Popup.Props` -> "@base-ui/react/dialog Dialog.Popup.Props"; unimported names stay as written. */
  const qualify = (text: string, root: string) => {
    const from = modules.get(root)?.replace(/\.js$/, "")
    if (!from) return text
    return `${from} ${namespaces.has(root) ? text.slice(root.length + 1) : text}`
  }
  const rootOf = (n: ts.EntityName | ts.Expression): string =>
    ts.isIdentifier(n)
      ? n.text
      : rootOf(
          (n as ts.QualifiedName).left ??
            (n as ts.PropertyAccessExpression).expression
        )

  // Splits a parameter type into forwarded types and inline object members.
  const split = (
    type: ts.TypeNode,
    forwards: string[],
    props: Prop[],
    depth = 0
  ) => {
    if (ts.isIntersectionTypeNode(type))
      return type.types.forEach((t) => split(t, forwards, props, depth))
    if (ts.isParenthesizedTypeNode(type))
      return split(type.type, forwards, props, depth)
    if (ts.isTypeLiteralNode(type)) {
      for (const m of type.members)
        if (ts.isPropertySignature(m) && m.type)
          props.push({ name: m.name.getText(), type: flat(m.type) })
      return
    }
    if (ts.isTypeReferenceNode(type)) {
      const text = type.typeName.getText()
      const local = aliases.get(text)
      if (local && !type.typeArguments && depth < 5)
        return split(local, forwards, props, depth + 1)
      const arg = type.typeArguments?.[0]
      if (REACT_PROPS.test(text) && arg) {
        if (ts.isLiteralTypeNode(arg) && ts.isStringLiteral(arg.literal))
          return forwards.push(arg.literal.text)
        if (ts.isTypeQueryNode(arg))
          return forwards.push(
            qualify(arg.exprName.getText(), rootOf(arg.exprName))
          )
      }
      return forwards.push(qualify(flat(type), rootOf(type.typeName)))
    }
    forwards.push(flat(type))
  }

  const parts: Part[] = []
  const seen = new Set<string>()
  for (const [local, name] of exported) {
    const decl = decls.get(local)
    if (!decl || seen.has(name)) continue
    const isHook = /^use[A-Z]/.test(name)
    if (!isHook && !/^[A-Z]/.test(name)) continue
    seen.add(name)
    // `const X = (props: P) => ...` and `function X(props: P)` both carry parameters.
    const fn = ts.isFunctionDeclaration(decl)
      ? decl
      : decl.type && ts.isFunctionTypeNode(decl.type)
        ? decl.type
        : null
    if (isHook && fn) {
      parts.push({
        name,
        params: fn.parameters.map((p) => ({
          name: p.name.getText(),
          type: p.type ? flat(p.type) : "unknown",
        })),
        returns: fn.type ? flat(fn.type) : "unknown",
      })
      continue
    }
    const forwards: string[] = []
    const props: Prop[] = []
    const first = fn?.parameters[0]?.type
    if (first) split(first, forwards, props)
    else if (decl && ts.isVariableDeclaration(decl) && decl.type)
      split(decl.type, forwards, props) // `const X: typeof Lib.Y`
    if (
      ts.isVariableDeclaration(decl) &&
      decl.type &&
      ts.isTypeQueryNode(decl.type)
    )
      forwards[0] = qualify(
        decl.type.exprName.getText(),
        rootOf(decl.type.exprName)
      )
    parts.push({
      name,
      forwards: [...new Set(forwards)].join(" & ") || null,
      props,
    })
  }
  return parts
}

/** name -> parts, for every .d.ts in the given directories; sorted so the output is stable. */
export function buildProps(dirs: string[]): Record<string, Part[]> {
  const out: Record<string, Part[]> = {}
  for (const dir of dirs)
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".d.ts")))
      out[file.slice(0, -5)] = partsFromDts(
        readFileSync(`${dir}/${file}`, "utf8")
      )
  return Object.fromEntries(
    Object.entries(out).sort(([a], [b]) => (a < b ? -1 : 1))
  )
}

if (import.meta.main) {
  writeFileSync(
    "dist/props.json",
    JSON.stringify(buildProps(["dist/components", "dist/hooks"]))
  )
}
