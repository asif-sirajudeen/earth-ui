// Regenerates styles.css from the pinned shadcn CLI, the way the file was first built:
// shadcn's tailwind.css pasted in, plus the `shadcn init` output (neutral tokens, base-nova) minus fonts.
//
//   pnpm styles           rewrite styles.css
//   pnpm styles --check   exit 1 if styles.css differs from what this script generates
//
// Needs the network: `shadcn init` runs in a throwaway Vite project and resolves base-nova from ui.shadcn.com.
import { execFileSync } from "node:child_process"
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const shadcn = JSON.parse(
  readFileSync("node_modules/shadcn/package.json", "utf8")
).version as string

/** Runs `shadcn init --defaults` (base-nova, neutral) in a scratch project and returns the CSS it writes. */
function initOutput(): string {
  const dir = mkdtempSync(join(tmpdir(), "earth-ui-styles-"))
  try {
    mkdirSync(join(dir, "src"))
    // shadcn only inits a project it recognises, so give it the markers of a Vite app.
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({
        name: "scratch",
        private: true,
        devDependencies: { vite: "^6.0.0", "@tailwindcss/vite": "^4.0.0" },
        dependencies: {
          tailwindcss: "^4.0.0",
          react: "^19",
          "react-dom": "^19",
        },
      })
    )
    writeFileSync(join(dir, "vite.config.ts"), "export default {}\n")
    const tsconfig = JSON.stringify({
      files: [],
      compilerOptions: { baseUrl: ".", paths: { "@/*": ["./src/*"] } },
      references: [],
    })
    writeFileSync(join(dir, "tsconfig.json"), tsconfig)
    writeFileSync(join(dir, "tsconfig.app.json"), tsconfig)
    writeFileSync(join(dir, "src/index.css"), '@import "tailwindcss";\n')
    execFileSync(
      "node_modules/.bin/shadcn",
      ["init", "--cwd", dir, "--yes", "--defaults"],
      { stdio: "inherit" }
    )
    return readFileSync(join(dir, "src/index.css"), "utf8")
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

/** The init output from `@custom-variant dark` on, without the font setup earth-ui leaves to the consumer. */
function theme(initCss: string): string {
  const start = initCss.indexOf("@custom-variant dark")
  if (start < 0)
    throw new Error("shadcn init output has no @custom-variant dark")
  const css = initCss
    .slice(start)
    .replace(/^ *--font-(heading|sans):.*\n/gm, "")
    .replace(/ {2}html \{\n {4}@apply font-sans;\n {4}\}\n/, "")
  if (/font-sans|font-heading/.test(css))
    throw new Error(
      "font setup is still in the theme: the init output changed shape"
    )
  return css
}

const tailwind = readFileSync(
  "node_modules/shadcn/dist/tailwind.css",
  "utf8"
).trim()

// The committed file ends with a blank line, which the init output does not have; keep it so --check is byte-exact.
const styles = `/*
 * @asif-sirajudeen/earth-ui stylesheet: tw-animate-css, shadcn's Tailwind variants and utilities, and the base-nova theme tokens.
 * Consumers must \`@import "tailwindcss";\` before importing this file.
 * This file does not import Tailwind itself, so preflight is not included twice.
 */

/* Animation utilities (tw-animate-css). Must come before the shadcn block: both define the accordion keyframes and shadcn's version must win. */
@import "tw-animate-css";

/* ejected from shadcn@${shadcn} (dist/tailwind.css, copied verbatim; diff against the new version when upgrading the shadcn CLI) */
${tailwind}

/* end of shadcn@${shadcn} block */

/* Tells the consumer's Tailwind to scan the built components for classes. */
@source "./dist/**/*.js";

${theme(initOutput())}

`

if (process.argv.includes("--check")) {
  if (readFileSync("styles.css", "utf8") !== styles) {
    console.error(
      "styles.css differs from the generated output. Run `pnpm styles` and review the diff."
    )
    process.exit(1)
  }
  console.log("styles.css matches the generated output.")
} else {
  writeFileSync("styles.css", styles)
  console.log(`Wrote styles.css from shadcn@${shadcn}.`)
}
