// Fails when a minimumReleaseAgeExclude entry in pnpm-workspace.yaml has aged past minimumReleaseAge,
// so the exemption can be deleted. Needs the network (npm registry). Run weekly by upstream-check.yml.
//
//   node scripts/check-release-age.mts
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

/** `minimumReleaseAge` (minutes) and the `name@version` exclude entries from pnpm-workspace.yaml text. */
export function parseWorkspace(yaml: string): {
  minutes: number
  entries: string[]
} {
  const minutes = Number(/^minimumReleaseAge:\s*(\d+)/m.exec(yaml)?.[1])
  if (!minutes)
    throw new Error("pnpm-workspace.yaml: minimumReleaseAge not set")
  const list = /^minimumReleaseAgeExclude:\s*\n((?:[ \t]+-.*\n?)*)/m.exec(yaml)
  const entries = [...(list?.[1] ?? "").matchAll(/^\s+-\s*["']?([^"'\s#]+)/gm)]
  return { minutes, entries: entries.map((m) => m[1]!) }
}

/** Entries published more than `minutes` before `now`. `published` maps entry -> ISO time. */
export function staleEntries(
  published: Record<string, string>,
  minutes: number,
  now: Date
): string[] {
  return Object.entries(published)
    .filter(([, at]) => now.getTime() - Date.parse(at) > minutes * 60_000)
    .map(([entry]) => entry)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { minutes, entries } = parseWorkspace(
    readFileSync("pnpm-workspace.yaml", "utf8")
  )
  const published: Record<string, string> = {}
  for (const entry of entries) {
    const at = entry.lastIndexOf("@")
    const [name, version] = [entry.slice(0, at), entry.slice(at + 1)]
    const res = await fetch(
      `https://registry.npmjs.org/${name.replace("/", "%2F")}`
    )
    if (!res.ok) throw new Error(`${entry}: registry answered ${res.status}`)
    const time = ((await res.json()) as { time: Record<string, string> }).time
    if (!time[version]) throw new Error(`${entry}: version not on npm`)
    published[entry] = time[version]
  }
  const stale = staleEntries(published, minutes, new Date())
  if (stale.length) {
    console.error(
      `minimumReleaseAgeExclude entries past the ${minutes} minute limit; delete them:\n  ${stale.join("\n  ")}`
    )
    process.exit(1)
  }
  console.log(`${entries.length} release-age exclusions, none stale`)
}
