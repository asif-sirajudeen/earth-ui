// Mirrors shadcn-ui/ui apps/v4/eslint.config.mjs. That config extends
// eslint-config-next/core-web-vitals; this repo is not a Next.js app, so the
// Next block is inlined below (react + react-hooks recommended, Next's jsx-a11y
// picks) without the @next/next and import rules.
import jsxA11y from "eslint-plugin-jsx-a11y"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config(
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/no-unknown-property": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "jsx-a11y/alt-text": ["warn", { elements: ["img"], img: ["Image"] }],
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",
      "react/jsx-no-target-blank": "off",
    },
  },
  ...tseslint.configs.recommended,
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "public/r/**",
      "site/.next/**",
      "site/out/**",
      "site/.source/**",
      "site/content/docs/components/**",
      // Research scratch, not shipped; rsc-probe.mjs calls hooks at top level on purpose.
      "docs/**",
    ],
  },
  {
    // Same overrides as upstream.
    rules: {
      "react-hooks/incompatible-library": "off",
      "react-hooks/purity": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
    },
  },
  {
    // Pulled verbatim by `shadcn add`; upstream ships the same setState-in-effect
    // code. Overridden here, not inline, so a re-pull does not drop the disable.
    files: ["src/components/carousel.tsx", "src/hooks/use-mobile.ts"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  }
)
