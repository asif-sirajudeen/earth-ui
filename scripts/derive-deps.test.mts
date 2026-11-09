import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { deriveDeps, importSpecifiers, topLevelPackage, withRange } from "./derive-deps.mts";

test("topLevelPackage collapses subpaths, keeps scope", () => {
  assert.equal(topLevelPackage("@base-ui/react/button"), "@base-ui/react");
  assert.equal(topLevelPackage("@base-ui/react"), "@base-ui/react");
  assert.equal(topLevelPackage("shiki/core"), "shiki");
  assert.equal(topLevelPackage("cn"), "cn");
});

test("importSpecifiers finds from-imports and side-effect imports", () => {
  const code = `
import { a } from "cn"
import type { B } from '@/components/button'
import "side-effect"
export { c } from "lucide-react"
const x = "from 'not-an-import'"
`;
  assert.deepEqual(importSpecifiers(code), ["cn", "@/components/button", "side-effect", "lucide-react"]);
});

test("highlighter's dynamic imports are covered by its static shiki import", () => {
  const code = readFileSync("src/lib/highlighter.tsx", "utf8");
  const dynamic = [...code.matchAll(/import\(\s*["']([^"']+)["']/g)].map((m) => topLevelPackage(m[1]!));
  const static_ = new Set(importSpecifiers(code).map(topLevelPackage));
  for (const name of dynamic) assert.ok(static_.has(name), `dynamic import of ${name} has no static import`);
});

const pkg = {
  dependencies: { "@base-ui/react": "^1.9.0", cn: "~0.5.2", "lucide-react": "^1.70.0" },
  peerDependencies: { react: "^19", sonner: "^2.0.8", shiki: "^4.6.0", tailwindcss: "^4" },
};
const itemNames = new Set(["button", "use-mobile"]);

test("deriveDeps maps npm deps with ranges, peers included, react/tailwind skipped", () => {
  const { dependencies } = deriveDeps(
    ["react", "cn", "@base-ui/react/button", "sonner", "shiki/core", "tailwindcss"],
    { pkg, itemNames },
  );
  assert.deepEqual(dependencies, ["@base-ui/react@^1.9.0", "cn@~0.5.2", "shiki@^4.6.0", "sonner@^2.0.8"]);
});

test("deriveDeps throws on a package missing from package.json", () => {
  assert.throws(() => deriveDeps(["left-pad"], { pkg, itemNames }), /left-pad.*not in package.json/);
});

test("deriveDeps throws on a relative import", () => {
  assert.throws(() => deriveDeps(["./button"], { pkg, itemNames }), /relative/);
});

test("deriveDeps maps @/components and @/hooks to the @earth-ui namespace", () => {
  const { registryDependencies } = deriveDeps(["@/components/button", "@/hooks/use-mobile"], {
    pkg,
    itemNames,
  });
  assert.deepEqual(registryDependencies, ["@earth-ui/button", "@earth-ui/use-mobile"]);
});

test("deriveDeps leaves @/lib imports to deriveItems", () => {
  assert.deepEqual(deriveDeps(["@/lib/highlighter"], { pkg, itemNames }), { dependencies: [], registryDependencies: [] });
});

test("deriveDeps throws on an unknown @/components import", () => {
  assert.throws(() => deriveDeps(["@/components/nope"], { pkg, itemNames }), /nope/);
});

test("withRange rejects a range that does not form name@range", () => {
  assert.equal(withRange("cn", pkg), "cn@~0.5.2");
  assert.throws(() => withRange("bad", { dependencies: { bad: "has space" } }), /name@range/);
});
