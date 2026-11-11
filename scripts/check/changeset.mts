// Fails a PR that changes shipped package code without a changeset.
//
//   node scripts/check/changeset.mts origin/main
//
// Opt out with an empty changeset (`pnpm changeset --empty`) for a change that intentionally ships no release.
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const SHIPPED =
  /^(src\/|cli\/(?!test\/)(?!.*\.test\.)|registry\/|styles\.css$|tsdown\.config\.ts$)/
const CHANGESET = /^\.changeset\/(?!README\.md$).+\.md$/

/** Message when a package change has no added changeset, else null. */
export function missingChangeset(
  changed: string[],
  added: string[]
): string | null {
  const shipped = changed.filter((f) => SHIPPED.test(f))
  if (!shipped.length || added.some((f) => CHANGESET.test(f))) return null
  return `These files change the published package but no changeset was added:\n  ${shipped.join("\n  ")}\nRun \`pnpm changeset\` (or \`pnpm changeset --empty\` if this change ships no release) and commit the new .changeset/*.md file.`
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const base = process.argv[2] ?? "origin/main"
  const diff = (...flags: string[]) =>
    execFileSync("git", ["diff", "--name-only", ...flags, `${base}...HEAD`], {
      encoding: "utf8",
    })
      .split("\n")
      .filter(Boolean)
  const message = missingChangeset(diff(), diff("--diff-filter=A"))
  if (message) {
    console.error(message)
    process.exit(1)
  }
  console.log("changeset check passed")
}
