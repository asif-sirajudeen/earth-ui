/** @type {import('prettier').Config} */
module.exports = {
  endOfLine: "lf",
  semi: false,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "es5",
  printWidth: 80,
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./prettier.tailwind.css",
  tailwindFunctions: ["cn", "cva"],
  overrides: [
    {
      // The generated barrel (src/index.ts) is grouped as import / export /
      // types per component; the sort-imports plugin would hoist every import
      // to the top. Its options live here so the barrel never sees them.
      files: "**/*",
      excludeFiles: "src/index.ts",
      options: {
        importOrder: [
          "^(react/(.*)$)|^(react$)",
          "^(next/(.*)$)|^(next$)",
          "<THIRD_PARTY_MODULES>",
          "",
          "^@workspace/(.*)$",
          "",
          "^types$",
          "^@/types/(.*)$",
          "^@/config/(.*)$",
          "^@/lib/(.*)$",
          "^@/hooks/(.*)$",
          "^@/components/ui/(.*)$",
          "^@/components/(.*)$",
          "^@/registry/(.*)$",
          "^@/styles/(.*)$",
          "^@/app/(.*)$",
          "^@/www/(.*)$",
          "",
          "^[./]",
        ],
        importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
        plugins: [
          "@ianvs/prettier-plugin-sort-imports",
          "prettier-plugin-tailwindcss",
        ],
      },
    },
  ],
}
