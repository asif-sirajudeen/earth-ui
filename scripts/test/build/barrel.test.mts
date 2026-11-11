import assert from "node:assert/strict"
import { test } from "node:test"

import { buildIndex, parseExports } from "../../build/barrel.mts"

test("parseExports reads export lists, type exports and declarations", () => {
  const code = [
    "function Card() {}",
    "export type CardConfig = { a: string }",
    "export interface CardApi {}",
    "export function useCard() {}",
    "export {",
    "  type CardKind,",
    "  Card,",
    "  cardVariants,",
    "}",
  ].join("\n")
  assert.deepEqual(parseExports(code), {
    values: ["Card", "cardVariants", "useCard"],
    types: ["CardKind", "CardConfig", "CardApi"],
  })
})

test("parseExports rejects renamed exports", () => {
  assert.throws(() => parseExports("export { A as B }"), /Renamed export/)
})

test("buildIndex adds Props only for PascalCase values without one", () => {
  const out = buildIndex([
    {
      name: "card",
      exports: {
        values: ["Card", "CardTitle", "cardVariants", "useCard"],
        types: ["CardTitleProps"],
      },
    },
  ])
  assert.match(out, /export type CardProps = ComponentProps<typeof Card>/)
  assert.doesNotMatch(out, /CardTitleProps = /)
  assert.doesNotMatch(out, /cardVariantsProps|useCardProps/)
  assert.match(
    out,
    /export type \{ CardTitleProps \} from "\.\/components\/card"/
  )
})
