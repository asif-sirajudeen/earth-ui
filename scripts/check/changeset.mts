// Flags a PR that changes shipped package code without a changeset. Never fails: always exits 0.
//
//   node scripts/check/changeset.mts origin/main [--comment-file <path>]
//
// Prints the message plus a GitHub `::warning::` annotation. With --comment-file, writes the PR comment body to
// <path> (an empty file when nothing is missing) so CI can post it.
// Opt out with an empty changeset (`pnpm changeset --empty`) for a change that intentionally ships no release.
import { execFileSync } from "node:child_process"
import { writeFileSync } from "node:fs"
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

/** PR comment body for a missingChangeset message, else null. */
export function changesetComment(message: string | null): string | null {
  if (!message) return null
  const files = message
    .split("\n")
    .filter((l) => l.startsWith("  "))
    .map((l) => `- \`${l.trim()}\``)
  return `<!-- changeset-check -->
**No changeset in this PR**

These files change the published package:

${files.join("\n")}

Add one with \`pnpm changeset\`, or \`pnpm changeset --empty\` if this change ships no release, and commit the new \`.changeset/*.md\` file.

The next release only includes changes that have a changeset.
`
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const flag = args.indexOf("--comment-file")
  const commentFile = flag === -1 ? undefined : args.splice(flag, 2)[1]
  const base = args[0] ?? "origin/main"
  const diff = (...flags: string[]) =>
    execFileSync("git", ["diff", "--name-only", ...flags, `${base}...HEAD`], {
      encoding: "utf8",
    })
      .split("\n")
      .filter(Boolean)
  const message = missingChangeset(diff(), diff("--diff-filter=A"))
  if (commentFile) writeFileSync(commentFile, changesetComment(message) ?? "")
  if (message) {
    console.log(message)
    console.log(
      "::warning title=No changeset::This PR changes the published package but adds no changeset."
    )
  } else console.log("changeset check passed")
}
