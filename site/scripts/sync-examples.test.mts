// Keep/skip and import-rewrite rules for sync-examples. Run with `pnpm --filter site test`.

import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import {
  assertExamplesPin,
  classify,
  pinTag,
  readmeRef,
} from "./sync-examples.mts"

const nova = (c: string) => `import { X } from "@/styles/base-nova/ui/${c}"\n`

test("rewrites base-nova and base-rhea ui imports, including multi-line", () => {
  const code = `import {\n  A,\n} from "@/styles/base-nova/ui/card"\n${`import { B } from "@/styles/base-rhea/ui/button"\n`}export default () => null\n`
  const r = classify("card-demo", code)
  assert.equal(r.keep, true)
  assert.ok(r.code.includes('} from "@asif-sirajudeen/earth-ui/card"'))
  assert.ok(r.code.includes('from "@asif-sirajudeen/earth-ui/button"'))
  assert.ok(!r.code.includes("@/styles"))
})

test("maps use-highlighted-code", () => {
  const r = classify(
    "code-block-demo",
    `import { useHighlightedCode } from "@/registry/bases/base/hooks/use-highlighted-code"\n`
  )
  assert.equal(r.keep, true)
  assert.ok(r.code.includes('"@asif-sirajudeen/earth-ui/use-highlighted-code"'))
})

test("skips rtl by name or import", () => {
  assert.deepEqual(classify("accordion-rtl", nova("accordion")), {
    keep: false,
    reason: "rtl",
  })
  const r = classify(
    "x-demo",
    `import { A } from "@/styles/base-nova/ui-rtl/accordion"\n`
  )
  assert.deepEqual(r, { keep: false, reason: "rtl" })
  assert.deepEqual(
    classify("x-demo", `import { L } from "@/components/language-selector"\n`),
    { keep: false, reason: "rtl" }
  )
})

test("maps use-mobile", () => {
  const r = classify(
    "x-demo",
    `import { useIsMobile } from "@/hooks/use-mobile"\n`
  )
  assert.ok(r.keep)
  assert.ok(r.code.includes('"@asif-sirajudeen/earth-ui/use-mobile"'))
})

test("skips local imports other than the mapped ones", () => {
  for (const spec of [
    "@/components/markdown",
    "@/lib/ai",
    "@/registry/new-york-v4/ui/card",
    "@/hooks/use-other",
  ])
    assert.deepEqual(classify("x-demo", `import a from "${spec}"\n`), {
      keep: false,
      reason: "local-import",
      detail: spec,
    })
})

test("skips npm packages outside the allowlist, keeps allowed ones", () => {
  // Not site dependencies, so the site build could not resolve them.
  for (const spec of [
    "@tabler/icons-react",
    "@ai-sdk/react",
    "zod",
    "embla-carousel-react",
    "@base-ui/react/dialog",
  ])
    assert.deepEqual(classify("x-demo", `import a from "${spec}"\n`), {
      keep: false,
      reason: "package",
      detail: spec,
    })
  for (const spec of [
    "react",
    "lucide-react",
    "sonner",
    "recharts",
    "cn",
    "input-otp",
    "date-fns",
    "react-day-picker",
    "@shadcn/react/questionnaire",
    "next/link",
    "next/image",
  ])
    assert.equal(
      classify("x-demo", `import a from "${spec}"\n`).keep,
      true,
      spec
    )
})

test("catches side-effect and dynamic imports", () => {
  assert.deepEqual(classify("x", `import "@tabler/icons-react"\n`), {
    keep: false,
    reason: "package",
    detail: "@tabler/icons-react",
  })
  assert.deepEqual(classify("x", `const m = await import("zod")\n`), {
    keep: false,
    reason: "package",
    detail: "zod",
  })
})

test("ignores from/import inside strings and JSX attributes", () => {
  const code = `${nova("field")}export default () => <label htmlFor="time-from" id="re-import">x</label>\n`
  assert.equal(classify("calendar-time", code).keep, true)
})

test("ignores CSS @import inside a code sample string", () => {
  const code = `${nova("code-block")}const css = \`@import "tailwindcss";\`\n`
  assert.equal(classify("code-block-languages", code).keep, true)
})

test("explicit SKIP map wins", () => {
  const r = classify("x-demo", nova("card"), { "x-demo": "drift" })
  assert.deepEqual(r, {
    keep: false,
    reason: "upstream-bug",
    detail: "drift",
  })
})

const readme = (ref: string) =>
  `Copied from x \`apps/v4/examples/base\` at ${ref} (${"a".repeat(40)}), with imports`

test("pinTag builds the upstream tag from devDependencies.shadcn", () => {
  assert.equal(
    pinTag({ devDependencies: { shadcn: "4.23.0" } }),
    "shadcn@4.23.0"
  )
  assert.throws(() => pinTag({}), /not set/)
})

test("readmeRef reads the recorded ref", () => {
  assert.equal(readmeRef(readme("shadcn@4.23.0")), "shadcn@4.23.0")
  assert.equal(readmeRef("no ref here"), undefined)
})

test("assertExamplesPin throws when README ref differs from the pin", () => {
  const pkg = { devDependencies: { shadcn: "4.23.0" } }
  assertExamplesPin(readme("shadcn@4.23.0"), pkg)
  assert.throws(
    () => assertExamplesPin(readme("shadcn@4.22.0"), pkg),
    /needs shadcn@4.23.0/
  )
  assert.throws(
    () => assertExamplesPin(readme("main"), pkg),
    /needs shadcn@4.23.0/
  )
})

test("committed examples are synced at the pinned shadcn tag", () => {
  const read = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8")
  assertExamplesPin(
    read("../examples/README.md"),
    JSON.parse(read("../../package.json"))
  )
})
