import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"

// Real data: the built CLI (dist/cli.js, dist/props.json) over the installed Base UI docs.
// Parsed CLI output, probed loosely.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type J = any
export const built = existsSync("dist/cli.js") && existsSync("dist/props.json")
export const real = {
  skip: built ? false : "run pnpm build first (dist/ is missing)",
}
export const cli = (...args: string[]) =>
  execFileSync("node", ["dist/cli.js", ...args], { encoding: "utf8" })
export const realDocs = (name: string) => JSON.parse(cli("docs", name))
export const partNamed = (d: J, name: string) =>
  d.props.parts.find((p: J) => p.name === name)
export const baseUiProp = (d: J, part: string, name: string) =>
  d.props.baseUi.parts
    .find((p: J) => p.name === part)
    .props.find((p: J) => p.name === name)
