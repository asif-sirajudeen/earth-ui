// Keep/skip and import-rewrite rules for sync-examples. Run with `pnpm --filter site test`.

import assert from "node:assert/strict"
import test from "node:test"

import { classify } from "./sync-examples.mjs"

const nova = (c) => `import { X } from "@/styles/base-nova/ui/${c}"\n`

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
  assert.equal(
    classify("x-demo", `import { L } from "@/components/language-selector"\n`)
      .reason,
    "rtl"
  )
})

test("skips local imports other than the mapped ones", () => {
  for (const spec of [
    "@/components/markdown",
    "@/lib/ai",
    "@/registry/new-york-v4/ui/card",
    "@/hooks/use-mobile",
  ])
    assert.deepEqual(classify("x-demo", `import a from "${spec}"\n`), {
      keep: false,
      reason: "local-import",
    })
})

test("skips npm packages outside the allowlist, keeps allowed ones", () => {
  for (const spec of ["date-fns", "@ai-sdk/react", "next/font/google", "zod"])
    assert.deepEqual(classify("x-demo", `import a from "${spec}"\n`), {
      keep: false,
      reason: "package",
    })
  for (const spec of [
    "react",
    "lucide-react",
    "sonner",
    "recharts",
    "react-day-picker",
    "react-day-picker/locale",
    "cn",
    "input-otp",
    "embla-carousel-react",
    "@base-ui/react/dialog",
    "@shadcn/react/questionnaire",
    "next/link",
    "next/image",
  ])
    assert.equal(classify("x-demo", `import a from "${spec}"\n`).keep, true, spec)
})

test("catches side-effect and dynamic imports", () => {
  assert.equal(classify("x", `import "date-fns"\n`).reason, "package")
  assert.equal(classify("x", `const m = await import("zod")\n`).reason, "package")
})

test("explicit SKIP map wins", () => {
  const r = classify("x-demo", nova("card"), { "x-demo": "drift" })
  assert.deepEqual(r, { keep: false, reason: "drift" })
})
