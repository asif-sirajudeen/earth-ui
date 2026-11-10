// Fails on any non-2xx meta.links URL in registry.json. Network check, so it runs on a schedule, not in PR CI.
import registry from "../registry.json" with { type: "json" }

type Item = { name: string; meta?: { links?: Record<string, string> } }

const checks = (registry.items as Item[]).flatMap((item) =>
  Object.entries(item.meta?.links ?? {}).map(([kind, url]) => ({
    label: `${item.name} ${kind}`,
    url,
  }))
)

const results = await Promise.all(
  checks.map(async ({ label, url }) => {
    try {
      const res = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(20_000),
      })
      return { label, url, status: String(res.status), ok: res.ok }
    } catch (error) {
      return { label, url, status: String(error), ok: false }
    }
  })
)

const bad = results.filter((r) => !r.ok)
for (const r of bad) console.error(`FAIL ${r.status} ${r.label} ${r.url}`)
console.log(`${results.length - bad.length}/${results.length} links ok`)
process.exit(bad.length ? 1 : 0)
