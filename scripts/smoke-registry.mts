// Installs the built registry (public/r) into a throwaway consumer project, the way a user would.
//
//   pnpm registry:smoke             dry-run every item (fast, no network for the registry)
//   pnpm registry:smoke --install   real install, typecheck, Tailwind compile, token and idempotency checks
//
// Run `pnpm registry` first. The consumer's style is radix-vega, like the shadcn directory's health check.
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const install = process.argv.includes("--install");
const repo = process.cwd();
const shadcn = join(repo, "node_modules/.bin/shadcn");
const registry = JSON.parse(readFileSync("public/r/registry.json", "utf8"));
const names: string[] = registry.items.map((item: { name: string }) => item.name);

const server = createServer((req, res) => {
  const name = req.url?.match(/^\/r\/([\w-]+\.json)$/)?.[1];
  try {
    const body = readFileSync(join(repo, "public/r", name ?? "-"));
    res.writeHead(200, { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
const { port } = server.address() as { port: number };

const app = mkdtempSync(join(tmpdir(), "earth-ui-smoke-"));
// Async on purpose: a sync spawn blocks the event loop, so the registry server above could never answer.
// stdin closed: any CLI prompt fails the run instead of hanging CI.
const run = (cmd: string, args: string[]) =>
  new Promise<void>((done, fail) => {
    const child = spawn(cmd, args, { cwd: app, stdio: ["ignore", "inherit", "inherit"], timeout: 10 * 60_000 });
    child.on("error", fail);
    child.on("close", (code) => (code === 0 ? done() : fail(new Error(`${cmd} ${args.slice(0, 2).join(" ")} … exited ${code}`))));
  });
const sha = (file: string) => createHash("sha256").update(readFileSync(join(app, file))).digest("hex");
const add = (items: string[], ...flags: string[]) =>
  run(shadcn, ["add", ...items.map((n) => `@earth-ui/${n}`), "--yes", ...flags]);

try {
  const config = JSON.parse(readFileSync("components.json", "utf8"));
  config.style = "radix-vega";
  config.tailwind.css = "app.css";
  config.registries = { "@earth-ui": `http://127.0.0.1:${port}/r/{name}.json` };
  writeFileSync(join(app, "components.json"), JSON.stringify(config, null, 2));
  writeFileSync(join(app, "app.css"), '@import "tailwindcss";\n');
  writeFileSync(
    join(app, "package.json"),
    JSON.stringify({
      name: "smoke",
      private: true,
      type: "module",
      dependencies: { react: "^19", "react-dom": "^19" },
      devDependencies: { "@types/react": "^19", "@types/react-dom": "^19", tailwindcss: "^4", "@tailwindcss/cli": "^4", typescript: "^5" },
    }),
  );
  cpSync(resolve("tsconfig.json"), join(app, "tsconfig.json"));
  const tsconfig = JSON.parse(readFileSync(join(app, "tsconfig.json"), "utf8"));
  tsconfig.compilerOptions.types = ["react", "react-dom"];
  tsconfig.compilerOptions.paths = { "@/*": ["./*"] };
  tsconfig.include = ["**/*.ts", "**/*.tsx"];
  tsconfig.exclude = ["node_modules"];
  writeFileSync(join(app, "tsconfig.json"), JSON.stringify(tsconfig, null, 2));

  if (!install) {
    await add(names, "--dry-run");
    console.log(`\n✔ dry-run resolved ${names.length} items`);
  } else {
    await run("npm", ["install", "--no-audit", "--no-fund", "--loglevel=error"]);
    await add(names, "--overwrite");
    await run("npx", ["--no-install", "tsc", "--noEmit", "-p", "."]);
    await run("npx", ["--no-install", "@tailwindcss/cli", "-i", "app.css", "-o", join(app, "out.css")]);

    const css = readFileSync(join(app, "app.css"), "utf8");
    const block = (selector: string) => css.slice(css.indexOf(`${selector} {`), css.indexOf("}", css.indexOf(`${selector} {`)));
    for (const [selector, token] of [[":root", "--sidebar-primary:"], [".dark", "--sidebar-primary:"], ["@theme inline", "--color-sidebar-primary:"]] as const) {
      if (!css.includes(`${selector} {`) || !block(selector).includes(token)) throw new Error(`app.css: ${token} missing from ${selector}`);
    }

    const before = [sha("app.css"), sha("package.json")];
    await add(["style"], "--overwrite");
    if (sha("app.css") !== before[0] || sha("package.json") !== before[1]) {
      throw new Error("re-adding @earth-ui/style changed app.css or package.json (not idempotent)");
    }
    console.log("\n✔ installed, typechecked, compiled CSS, tokens in place, re-add is idempotent");
  }
} finally {
  server.close();
  if (!process.env.KEEP_SMOKE_APP) rmSync(app, { recursive: true, force: true });
  else console.log(`kept ${app}`);
}
