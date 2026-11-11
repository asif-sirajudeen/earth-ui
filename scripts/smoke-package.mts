// Installs the packed npm tarball into a throwaway React 19 + Tailwind 4 app, the way a package-mode consumer would.
//
//   pnpm package:smoke
//
// Run `pnpm build` first (the tarball ships dist/). Checks, in order: tarball install (not a workspace link),
// imports from the root, a component subpath and each optional subpath type-check, `earth-ui setup` supplies app.css, Tailwind compiles a class
// that only the package's components use (so styles.css `@source` reaches the installed dist) and `--primary`, and the
// installed `earth-ui` bin runs. Counterpart of `registry:smoke --install` for copy mode.
import { spawn } from "node:child_process"
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const root = process.cwd()
const app = mkdtempSync(join(tmpdir(), "earth-ui-package-smoke-"))
const packDir = mkdtempSync(join(tmpdir(), "earth-ui-pack-"))

// Async on purpose, stdin closed: a prompt fails the run instead of hanging CI.
const run = (cmd: string, args: string[], cwd = app) =>
  new Promise<string>((done, fail) => {
    let out = ""
    const child = spawn(cmd, args, {
      cwd,
      stdio: ["ignore", "pipe", "inherit"],
      timeout: 10 * 60_000,
    })
    child.stdout.on("data", (d) => (out += d))
    child.on("error", fail)
    child.on("close", (code) =>
      code === 0
        ? done(out)
        : fail(new Error(`${cmd} ${args.slice(0, 2).join(" ")} exited ${code}`))
    )
  })

const SPECIFIERS = [
  "@asif-sirajudeen/earth-ui",
  "@asif-sirajudeen/earth-ui/button",
  "@asif-sirajudeen/earth-ui/sonner",
  "@asif-sirajudeen/earth-ui/use-highlighted-code",
  "@asif-sirajudeen/earth-ui/use-mobile",
]

// Used only inside button.tsx: it reaches the consumer's CSS only if `@source` scans the installed dist.
const SENTINEL = ".active\\:not-aria-\\[haspopup\\]\\:translate-y-px"

try {
  await run("pnpm", ["pack", "--pack-destination", packDir], root)
  const tarball = join(
    packDir,
    readdirSync(packDir).find((f) => f.endsWith(".tgz"))!
  )

  writeFileSync(
    join(app, "package.json"),
    JSON.stringify({
      name: "package-smoke",
      private: true,
      type: "module",
      dependencies: {
        "@asif-sirajudeen/earth-ui": `file:${tarball}`,
        react: "^19",
        "react-dom": "^19",
        tailwindcss: "^4",
        // Optional peers of the optional subpaths.
        sonner: "^2",
        "next-themes": "~0.4.6",
        shiki: "^4",
      },
      devDependencies: {
        "@types/react": "^19",
        "@types/react-dom": "^19",
        "@tailwindcss/cli": "^4",
        typescript: "^5",
      },
    })
  )
  writeFileSync(
    join(app, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        lib: ["ES2022", "DOM", "DOM.Iterable"],
        module: "ESNext",
        moduleResolution: "bundler",
        jsx: "react-jsx",
        strict: true,
        noEmit: true,
        skipLibCheck: false, // check the shipped .d.ts files too
      },
      include: ["src"],
    })
  )
  mkdirSync(join(app, "src"))
  writeFileSync(
    join(app, "src/app.tsx"),
    `import { Button, Input } from "@asif-sirajudeen/earth-ui"
import { Button as SubpathButton } from "@asif-sirajudeen/earth-ui/button"
import { Toaster } from "@asif-sirajudeen/earth-ui/sonner"
import { useHighlightedCode } from "@asif-sirajudeen/earth-ui/use-highlighted-code"
import { useIsMobile } from "@asif-sirajudeen/earth-ui/use-mobile"

export function App() {
  const mobile = useIsMobile()
  const html = useHighlightedCode("const a = 1", "ts")
  return (
    <>
      <Button variant="outline">{String(mobile)}</Button>
      <SubpathButton size="sm">{String(html)}</SubpathButton>
      <Input />
      <Toaster />
    </>
  )
}
`
  )

  await run("npm", ["install", "--no-audit", "--no-fund", "--loglevel=error"])
  // The stylesheet lines come from the installed CLI, the way a consumer would copy them.
  const setup = JSON.parse(
    await run("npx", ["--no-install", "earth-ui", "setup"])
  )
  writeFileSync(join(app, "app.css"), setup.css.lines.join("\n") + "\n")
  await run("npx", ["--no-install", "tsc", "--noEmit", "-p", "."])
  // tsc only resolves the "types" condition; importing each specifier in Node resolves the "default" one.
  for (const specifier of SPECIFIERS)
    await run("node", [
      "--input-type=module",
      "-e",
      `await import("${specifier}")`,
    ])
  await run("npx", [
    "--no-install",
    "@tailwindcss/cli",
    "-i",
    "app.css",
    "-o",
    "out.css",
  ])
  const css = readFileSync(join(app, "out.css"), "utf8")
  if (!css.includes(SENTINEL))
    throw new Error(
      `out.css has no ${SENTINEL}: styles.css @source does not reach the installed dist`
    )
  if (!css.includes("--primary"))
    throw new Error("out.css has no --primary: the theme tokens are missing")

  const list = JSON.parse(
    await run("npx", ["--no-install", "earth-ui", "list"])
  )
  if (!list.components.some((c: { name: string }) => c.name === "button"))
    throw new Error("earth-ui list does not include button")
  const dialog = JSON.parse(
    await run("npx", ["--no-install", "earth-ui", "docs", "dialog"])
  )
  if (dialog.name !== "dialog")
    throw new Error("earth-ui docs dialog did not return the dialog entry")

  const select = JSON.parse(
    await run("npx", ["--no-install", "earth-ui", "docs", "select"])
  )
  if (!(select.props?.baseUi?.parts?.length > 0))
    throw new Error("earth-ui docs select has no props.baseUi.parts")

  const ex = JSON.parse(
    await run("npx", ["--no-install", "earth-ui", "examples", "dialog"])
  )
  if (ex.examples[0]?.name !== "dialog-demo")
    throw new Error(
      "earth-ui examples dialog: first Example is not dialog-demo"
    )
  if (!ex.examples[0].code.includes("@asif-sirajudeen/earth-ui"))
    throw new Error(
      "earth-ui examples dialog: code does not import the package"
    )

  console.log(
    "\n✔ tarball installed, imports typecheck, Tailwind picks up package classes, bin runs"
  )
} finally {
  rmSync(packDir, { recursive: true, force: true })
  if (!process.env.KEEP_SMOKE_APP) rmSync(app, { recursive: true, force: true })
  else console.log(`kept ${app}`)
}
