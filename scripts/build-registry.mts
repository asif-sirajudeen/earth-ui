// Builds registry.json from src/ (items and deps derived) and registry/metadata.ts (titles, descriptions, links).
// The style item is built from the tokens in styles.css. Rules live in registry-items.mts.
//
// Run: pnpm registry   (then `shadcn build` turns registry.json into public/r/)
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { metadata } from "../registry/metadata.ts";
import type { PackageJson } from "./derive-deps.mts";
import { type SourceFile, deriveItems, styleItem } from "./registry-items.mts";

const read = (dir: string, ext: RegExp): SourceFile[] =>
  readdirSync(dir)
    .filter((name) => ext.test(name))
    .sort()
    .map((name) => ({ path: `${dir}/${name}`, code: readFileSync(`${dir}/${name}`, "utf8") }));

const pkg: PackageJson = JSON.parse(readFileSync("package.json", "utf8"));
const items = [
  ...deriveItems(
    { components: read("src/components", /\.tsx$/), hooks: read("src/hooks", /\.tsx?$/), libs: read("src/lib", /\.tsx?$/) },
    metadata,
    pkg,
  ),
  styleItem(readFileSync("styles.css", "utf8"), pkg),
];

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "earth-ui",
  homepage: "https://github.com/asif-sirajudeen/earth-ui",
  items,
};
writeFileSync("registry.json", JSON.stringify(registry, null, 2) + "\n");
console.log(`Wrote registry.json with ${items.length} items.`);
