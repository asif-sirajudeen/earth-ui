import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { deriveItems, ejectedShadcnBlock, findCycle, parseTokens, styleItem, type Sources } from "./registry-items.mts";

const pkg = {
  dependencies: { cn: "~0.5.2", "tw-animate-css": "^1.4.0" },
  peerDependencies: { react: "^19", shiki: "^4.6.0" },
};
const meta = (title: string) => ({ title, description: `${title} description.` });
const sources = (): Sources => ({
  components: [
    { path: "src/components/button.tsx", code: `import { cn } from "cn"` },
    { path: "src/components/card.tsx", code: `import { Button } from "@/components/button"` },
  ],
  hooks: [{ path: "src/hooks/use-code.ts", code: `import { load } from "@/lib/highlighter"` }],
  libs: [{ path: "src/lib/highlighter.tsx", code: `import "shiki/core"` }],
});
const metadata = () => ({ button: meta("Button"), card: meta("Card"), "use-code": meta("useCode") });

test("deriveItems builds one item per file, namespaced deps, style on ui items only", () => {
  const items = deriveItems(sources(), metadata(), pkg);
  const byName = Object.fromEntries(items.map((i) => [i.name, i]));
  assert.deepEqual(byName.card!.registryDependencies, ["@earth-ui/button", "@earth-ui/style"]);
  assert.deepEqual(byName.button!.dependencies, ["cn@~0.5.2"]);
  assert.equal(byName["use-code"]!.registryDependencies, undefined);
});

test("deriveItems attaches imported lib files and their deps to the item", () => {
  const hook = deriveItems(sources(), metadata(), pkg).find((i) => i.name === "use-code")!;
  assert.deepEqual(hook.files, [
    { path: "src/hooks/use-code.ts", type: "registry:hook" },
    { path: "src/lib/highlighter.tsx", type: "registry:lib" },
  ]);
  assert.deepEqual(hook.dependencies, ["shiki@^4.6.0"]);
});

test("deriveItems throws on a source file without metadata", () => {
  const { card: _, ...rest } = metadata();
  assert.throws(() => deriveItems(sources(), rest, pkg), /card/);
});

test("deriveItems throws on an empty description", () => {
  assert.throws(() => deriveItems(sources(), { ...metadata(), card: { title: "Card", description: " " } }, pkg), /card/);
});

test("deriveItems throws on metadata without a source file", () => {
  assert.throws(() => deriveItems(sources(), { ...metadata(), ghost: meta("Ghost") }, pkg), /ghost/);
});

test("deriveItems throws on a lib file no item imports", () => {
  const s = sources();
  s.libs.push({ path: "src/lib/orphan.ts", code: "" });
  assert.throws(() => deriveItems(s, metadata(), pkg), /orphan/);
});

test("deriveItems throws on an @/lib import with no file", () => {
  const s = sources();
  s.hooks[0]!.code = `import { x } from "@/lib/missing"`;
  s.libs = [];
  assert.throws(() => deriveItems(s, metadata(), pkg), /missing/);
});

test("deriveItems throws on an undeclared package", () => {
  const s = sources();
  s.components[0]!.code = `import pad from "left-pad"`;
  assert.throws(() => deriveItems(s, metadata(), pkg), /left-pad/);
});

test("deriveItems throws on a dependency cycle", () => {
  const s = sources();
  s.components[0]!.code = `import { Card } from "@/components/card"`;
  assert.throws(() => deriveItems(s, metadata(), pkg), /cycle: (button -> card -> button|card -> button -> card)/);
});

test("findCycle ignores other namespaces", () => {
  assert.equal(findCycle([{ name: "a", type: "registry:ui", registryDependencies: ["@shadcn/a"] }]), null);
});

const css = `/* ejected from shadcn@4.23.0 (x) */
@theme inline { --ignored: 1; }
/* end of shadcn@4.23.0 block */
@theme inline {
    --color-primary: var(--primary);
}
:root {
    --primary: oklch(0.2 0 0);
}
.dark {
    --primary: oklch(0.9 0 0);
}`;

test("parseTokens reads the blocks after the shadcn marker, not the first @theme", () => {
  assert.deepEqual(parseTokens(css), {
    theme: { "color-primary": "var(--primary)" },
    light: { primary: "oklch(0.2 0 0)" },
    dark: { primary: "oklch(0.9 0 0)" },
  });
});

test("parseTokens throws on a missing block", () => {
  assert.throws(() => parseTokens(css.replace(".dark", ".night")), /\.dark/);
});

test("styleItem emits bare shadcn so the repo's exact CLI pin never reaches consumers", () => {
  const item = styleItem(css, { ...pkg, devDependencies: { shadcn: "4.23.0" } });
  assert.deepEqual(item.devDependencies, ["tw-animate-css@^1.4.0", "shadcn"]);
});

test("styles.css shadcn block equals the installed shadcn/tailwind.css", () => {
  const block = ejectedShadcnBlock(readFileSync("styles.css", "utf8"));
  assert.equal(block.trim(), readFileSync("node_modules/shadcn/dist/tailwind.css", "utf8").trim());
});

test("style item's hardcoded rules match styles.css", () => {
  const source = readFileSync("styles.css", "utf8").replace(/\s+/g, " ");
  for (const rule of ["@custom-variant dark (&:is(.dark *));", "@apply border-border outline-ring/50;", "@apply bg-background text-foreground;"]) {
    assert.ok(source.includes(rule), `styles.css no longer has "${rule}"; update styleItem`);
  }
});

test("styles.css yields tokens for every block", () => {
  const tokens = parseTokens(readFileSync("styles.css", "utf8"));
  assert.ok(tokens.light["sidebar-primary"] && tokens.dark["sidebar-primary"] && tokens.theme["color-sidebar-primary"]);
});
