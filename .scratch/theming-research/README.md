# Theming in shadcn/ui and the shadcn ecosystem, and what it means for earth-ui

Scope: shadcn/ui and shadcn-based projects only. Primary sources only (repo source, official docs). Researched against `shadcn-ui/ui` `main` and the local copies in `src/` (bases.ts, styles.tsx, themes.ts, style-nova.css, README.md).

## TL;DR

1. A shadcn "style" (nova, vega, maia, ...) is a CSS file of `@apply` rules keyed by `cn-*` hook classes. At install time the CLI folds those rules into each component's class strings. The installed component has no hook left, so a style is an install-time choice, not a runtime one.
2. A shadcn "theme" is only CSS variables (`cssVars.theme|light|dark`). `:root` holds light, `.dark` holds dark, `@theme inline` maps them to Tailwind utilities. There are no component-tier tokens.
3. The shadcn CLI writes `cssVars` into fixed selectors only (`:root`, `.dark`, `@theme`). Switching among several themes at runtime is not a shadcn feature. Projects do it themselves with a class or `data-theme` attribute, orthogonal to `.dark`.
4. tweakcn exports one theme as a `registry:style` item (default selectors, overwrites the consumer's tokens). thegridcn and usva show the multi-theme pattern: one CSS block per theme under `[data-theme="x"]`.
5. For earth-ui: ship token themes as extra CSS files plus `registry:style` items using the `css` field with a `[data-theme]` selector. Do not ship multiple styles; the identical-to-upstream rule makes nova/vega a separate component set.

---

## 1. shadcn "styles" and how they are implemented

### Class strings vs style CSS vs tokens

All three layers exist, at different times:

- Authored component source (in the shadcn repo) contains only `cn-*` hook classes. Example: the Base UI button is `cva("cn-button group/button inline-flex ...", { variant: { default: "cn-button-variant-default", ... } })` in [registry/bases/base/ui/button.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/button.tsx). Only structural, style-independent classes are inline.
- A style is a CSS file that maps each hook to utilities, e.g. `.cn-accordion-trigger { @apply ... rounded-lg py-2.5 ... }` wrapped in `.style-nova { ... }`. See `src/style-nova.css` (1825 lines) and the repo's [registry/styles/](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/styles) (`style-nova|vega|maia|lyra|mira|luma|sera|rhea.css`). Compare `.style-vega .cn-accordion-trigger` (`rounded-md py-4`) with nova (`rounded-lg py-2.5`): a style changes spacing, radius, structure, not colors.
- Tokens (`--radius`, colors) are a third, separate layer. Styles reference token utilities (`bg-muted`, `ring-ring/50`) but define none.

### Install-time inlining

`createStyleMap` parses a style CSS file with PostCSS, collects each `cn-*` rule's `@apply` list into a map ([create-style-map.ts](https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/styles/create-style-map.ts)). `transformStyleMap` then rewrites string literals in `cva(...)` calls, `className` attributes and `cn(...)` calls, replacing `cn-*` tokens with the mapped utilities ([transform-style-map.ts](https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/styles/transform-style-map.ts)). A small allowlist (`cn-menu-target`, `cn-menu-translucent`, `cn-logical-sides`, `cn-rtl-flip`, `cn-font-heading`) is kept as live hooks.

Result: what `shadcn add button` writes for base-nova is a component with fully inlined classes. earth-ui's `src/components/button.tsx` confirms this (no `cn-` classes, a long inline cva string).

### Can a style be applied at runtime?

- In shadcn's own docs app, yes. The `/create` preview adds `style-<name>` and `base-color-<name>` classes to `<body>` and injects a `<style id="design-system-theme-vars">` with `:root`/`.dark` variables ([design-system-provider.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/app/(app)/(create)/components/design-system-provider.tsx)). That works only because the preview components still carry `cn-*` hooks and all style CSS is loaded.
- For an installed project, no. `components.json` says of `style`: "This cannot be changed after initialization" ([components-json docs](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/components-json.mdx)). The supported way to change style is to reinstall components: `shadcn apply <preset>` "apply a new preset, reinstall your existing components, and update your theme, colors, CSS variables, fonts, and icons" ([changelog 2026-04](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/changelog/2026-04-shadcn-apply.mdx)). `apply --only theme` or `--only font` skips component reinstall ([cli.mdx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/cli.mdx)).

### Bases, styles, presets, `shadcn create`

- Bases: `base` (Base UI), `radix`, `aria` (React Aria) are `registry:style` items in `src/bases.ts`. Each is an authored component set under `registry/bases/<base>/`. The v4 [registry README](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/README.md) states the model: every base crossed with every style CSS yields a generated combination (`base-nova`, `radix-vega`, ...); `new-york-v4` is the legacy, hand-authored registry.
- Styles in the repo today: vega, nova, maia, lyra, mira, luma, sera, rhea (`PRESET_STYLES` in [preset.ts](https://github.com/shadcn-ui/ui/blob/main/packages/registry/src/preset/preset.ts); descriptions in `src/styles.tsx`: Vega "Clean, neutral, and familiar", Nova "Reduced padding and margins", Maia "Rounded, with generous spacing", Lyra "Boxy and sharp. For mono fonts", Mira "Made for compact interfaces").
- `shadcn create` ([changelog 2025-12](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/changelog/2025-12-shadcn-create.mdx)): "Your config doesn't just change colors, it rewrites the component code to match your setup." That is the install-time inlining above.
- A preset is a base62 code that bit-packs base, style, baseColor, theme, chartColor, iconLibrary, font, fontHeading, radius, menuAccent, menuColor ([preset.ts](https://github.com/shadcn-ui/ui/blob/main/packages/registry/src/preset/preset.ts); decode example in [changelog 2026-04 preset](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/changelog/2026-04-preset-commands.mdx)). `shadcn init --preset`, `apply`, `preset decode|resolve|url|open` are the CLI entry points ([cli.mdx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/cli.mdx)).
- Build pipeline: `pnpm registry:build` generates combinations, `public/r/styles/<combo>`, and compiled `styles/<style>/ui/*` for the docs ([registry README](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/README.md)).

## 2. shadcn themes

### Base colors and theme colors

`THEMES` in `src/themes.ts` (1086 lines) is a list of `registry:theme` items, each with `cssVars: { light, dark }` covering the full token set. Names: neutral, stone, zinc, mauve, olive, mist, taupe (neutral-family "base colors") plus amber, blue, cyan, emerald, fuchsia, green, indigo, lime, orange, pink, purple, red, rose, sky, teal, violet, yellow (accent "themes"). `BASE_COLORS` is a filter of that list ([base-colors.ts](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/base-colors.ts)); `PRESET_THEMES` and `PRESET_BASE_COLORS` are in [preset.ts](https://github.com/shadcn-ui/ui/blob/main/packages/registry/src/preset/preset.ts). Docs: "`tailwind.baseColor` controls the default token values generated for your project when you run `init` or use a preset" ([theming.mdx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/theming.mdx)).

### Registry item types

From the schema ([registry/schema.ts](https://github.com/shadcn-ui/ui/blob/main/packages/registry/src/registry/schema.ts)) and [registry-item-json.mdx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/registry/registry-item-json.mdx): `registry:lib|block|component|ui|hook|page|file|theme|style|item|base|font`.

- `registry:theme`: only `cssVars` (and optionally `css`). Example in [examples.mdx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/registry/examples.mdx): `{ "type": "registry:theme", "cssVars": { "light": {...}, "dark": {...} } }`.
- `registry:style`: "Use for registry styles", can carry `dependencies`, `registryDependencies`, `cssVars`, `css`, and `"extends": "none"` to opt out of shadcn defaults.
- `registry:base`: "a complete design system base"; adds a `config` field (`style`, `iconLibrary`, `rsc`, `tsx`, `rtl`, `menuColor`, `menuAccent`, `tailwind.baseColor|css|prefix`, `aliases`, `registries`) that rewrites `components.json` ([examples.mdx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/registry/examples.mdx)).
- `registry:font`: font family, provider, CSS variable, npm package.

### How `cssVars` is defined and merged

Schema: `cssVars = { theme?, light?, dark? }`, each a string-to-string record; any other key is dropped by the zod object ([schema.ts](https://github.com/shadcn-ui/ui/blob/main/packages/registry/src/registry/schema.ts)). Merge logic in [update-css-vars.ts](https://github.com/shadcn-ui/ui/blob/main/packages/registry/src/updaters/update-css-vars.ts):

- `light` goes to the `:root` rule, `dark` to `.dark`, `theme` to `@theme` (v4 projects). Missing rules are created.
- Existing declarations are replaced only when `overwriteCssVars` is true, per the code comment "i.e for registry:theme and registry:style". Components never overwrite your variables; they only add missing ones.
- The updater also ensures `@custom-variant dark (&:is(.dark *))` exists.

The separate `css` field ([update-css.ts](https://github.com/shadcn-ui/ui/blob/main/packages/registry/src/updaters/update-css.ts)) accepts at-rules (`@layer`, `@utility`, `@plugin`, `@import`, `@keyframes`, ...) and, for any key not starting with `@`, `processRule(root, selector, properties)` at the top level. So an arbitrary selector such as `[data-theme="ocean"]` is writable through `css`, even though `cssVars` cannot target it. I read this from the code; I did not run the CLI to confirm merge behavior when the same selector already exists.

## 3. Token set and the Tailwind v4 mapping

Source: [theming.mdx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/theming.mdx) and the default theme in `src/themes.ts`.

Convention: surface token plus `-foreground` text token (`primary` / `primary-foreground`).

| Group | Variables |
| --- | --- |
| Surfaces | `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground` |
| Actions | `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `accent`, `accent-foreground`, `destructive` |
| Content | `muted`, `muted-foreground` |
| Lines | `border`, `input`, `ring` |
| Charts | `chart-1` to `chart-5` |
| Sidebar | `sidebar`, `sidebar-foreground`, `sidebar-primary`, `sidebar-primary-foreground`, `sidebar-accent`, `sidebar-accent-foreground`, `sidebar-border`, `sidebar-ring` |
| Shape | `radius` (base; `--radius-sm..4xl` derived: 0.6, 0.8, 1, 1.4, 1.8, 2.2, 2.6 x `--radius`) |
| Fonts | `font-sans`, `font-heading` via `cssVars.theme` (`font-heading` appears in [registry-item-json.mdx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/registry/registry-item-json.mdx) and the allowlisted `cn-font-heading`); `font-mono`/`font-serif` come from tweakcn, not from shadcn core |
| Shadows | Not part of shadcn core tokens (Tailwind's own `--shadow-*` apply). tweakcn adds `shadow-color/opacity/blur/spread/offset-x/offset-y` plus `shadow-2xs..2xl`, `tracking-normal`, `spacing` ([types/theme.ts](https://github.com/jnsahaj/tweakcn/blob/main/types/theme.ts)) |

Mapping to utilities, from the docs' default theme CSS: `@theme inline { --color-background: var(--background); ... --radius-lg: var(--radius); }`. The docs' stated reason for `inline` is the Tailwind v4 migration ([tailwind-v4.mdx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/tailwind-v4.mdx): "Add the `inline` option to `@theme`"). Practical consequence, my inference from that mapping: utilities compile to `var(--primary)` at the use site, so redefining `--primary` on any ancestor re-themes the subtree. That is what makes scoped themes possible without touching components.

Adding a token: define under `:root` and `.dark`, then add `--color-<name>: var(--<name>)` in `@theme inline` ([theming.mdx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/theming.mdx)).

No component-tier tokens: there is no `--button-bg` or `--card-radius`. Components consume only the semantic tier above, via Tailwind utilities. Per-component differences live in class strings (and therefore in styles, section 1), not in variables.

## 4. Dark mode

- Selector: `.dark` overrides the same variables. Variant: `@custom-variant dark (&:is(.dark *));` in the theming docs' default CSS ([theming.mdx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/(root)/theming.mdx)). Note `.dark *` matches descendants of `.dark`, not the `.dark` element itself; with the class on `<html>` this is harmless for variables, and `dark:` utilities apply to everything inside.
- Switching: [dark-mode docs](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/dark-mode/index.mdx) provide a `ThemeProvider` per framework. Next.js uses `next-themes` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `suppressHydrationWarning` on `<html>` ([next.mdx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/dark-mode/next.mdx)). Vite uses a hand-written provider that toggles `light`/`dark` classes on `documentElement` ([vite.mdx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/dark-mode/vite.mdx)). The docs site's own wrapper is [theme-provider.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/components/theme-provider.tsx) (`attribute="class"`, `disableTransitionOnChange`, `enableColorScheme`).
- Chart and sidebar tokens have dark values too; theme items carry the full set in both `light` and `dark`.

## 5. Ecosystem: theme editors, registries, runtime switching

### How shadcn's own site switches themes at runtime

The docs site keeps color mode and color theme as two independent axes. Mode: `next-themes`, class `dark`. Theme: `ActiveThemeProvider` removes any `theme-*` class from `<body>` and adds `theme-<name>` ([active-theme.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/components/active-theme.tsx)); the CSS is scoped per theme class, e.g. `.theme-mono .theme-container { --primary: ...; @variant dark { --primary: ... } }` ([legacy-themes.css](https://github.com/shadcn-ui/ui/blob/main/apps/v4/app/legacy-themes.css)). This is a docs-site pattern; the CLI does not generate it.

### tweakcn (jnsahaj/tweakcn, Apache-2.0)

- Visual editor; [README](https://github.com/jnsahaj/tweakcn/blob/main/README.md) calls it "a powerful Visual Theme Editor for tailwind CSS & shadcn/ui components".
- Export 1, code panel: generates `:root` and `.dark` blocks with color, font and shadow variables ([theme-style-generator.ts](https://github.com/jnsahaj/tweakcn/blob/main/utils/theme-style-generator.ts)).
- Export 2, registry: each preset becomes `public/r/themes/<name>.json` via [generate-theme-registry.ts](https://github.com/jnsahaj/tweakcn/blob/main/scripts/generate-theme-registry.ts). The item is `type: "registry:style"` with `cssVars: { theme: {font-*, radius, tracking-*}, light: {...colors, shadows, tracking-normal, spacing}, dark: {...} }` and `css: { "@layer base": { body: { "letter-spacing": "var(--tracking-normal)" } } }` ([themes.ts](https://github.com/jnsahaj/tweakcn/blob/main/utils/registry/themes.ts)). Colors are converted to oklch. Install command shape: `https://tweakcn.com/r/themes/<id>.json` ([code-panel.tsx](https://github.com/jnsahaj/tweakcn/blob/main/components/editor/code-panel.tsx)).
- Consequence: a tweakcn install is a one-theme overwrite of the consumer's `:root`/`.dark` (selectors are fixed by the CLI, section 2). tweakcn does not ship runtime multi-theme switching; it is an authoring and distribution tool. Its token schema adds fonts, shadows, tracking and spacing on top of shadcn's set.
- Its catalog is a single registry file of themes ([public/r/registry.json](https://github.com/jnsahaj/tweakcn/blob/main/public/r/registry.json)), which is a usable template for an earth-ui theme catalog.

### thegridcn (educlopez/thegridcn-ui, MIT)

Six themes (ares, tron, clu, athena, aphrodite, poseidon) on top of shadcn, installed via a shadcn registry ([README](https://github.com/educlopez/thegridcn-ui/blob/main/README.md)).

- Runtime switching: `ThemeProvider` sets `data-theme` on `<html>` ([theme-provider.tsx](https://github.com/educlopez/thegridcn-ui/blob/main/src/components/theme/theme-provider.tsx)); README: "Themes are `data-theme` attributes on `<html>`, so any CSS-variable-based component reacts automatically."
- Per-theme CSS under `src/styles/themes/*.css`, exported by [scripts/export-tokens.mjs](https://github.com/educlopez/thegridcn-ui/blob/main/scripts/export-tokens.mjs) to `public/tokens/<theme>.css` (`[data-theme="ares"] { --primary: ...; }`) and `.json`. Themes override only the tokens that differ (primary, secondary, muted, accent, border, ring, chart, sidebar, glow).
- Registry: its [registry.json](https://github.com/educlopez/thegridcn-ui/blob/main/registry.json) uses only `registry:base`, `registry:component`, `registry:font`. `base-vega`/`radix-vega` are `registry:base` items that set `components.json` and register the `@thegridcn` namespace. Themes are CSS files and token exports, not `registry:theme` items.

### usva (matt-pasek/usva, small project, 3 stars; closest structural analogue)

React design language on Base UI, "dual-distributed as an npm package and as a shadcn-compatible registry", with three themes sharing one token set ([llms.txt](https://usva.build/llms.txt), [README](https://github.com/matt-pasek/usva/blob/main/README.md)). Per README: themes are CSS files (`@usva-ui/tokens/themes/kajo.css`) imported next to `theme.css`; "switch with `data-theme` on any element, not only on `<html>`. scoping a theme to a subtree works." Tokens in `packages/tokens/` ([theme-vars.ts](https://github.com/matt-pasek/usva/blob/main/packages/tokens/src/theme-vars.ts)). It is not a shadcn fork (own components), so treat it as a pattern reference, not a shadcn-conformant example.

### Others seen, not deeply verified

The [awesome-shadcn-ui list](https://github.com/birobirobiro/awesome-shadcn-ui/blob/main/README.md) names more theme tools (`ui.jln.dev` 10000 themes, `shadcnpreset.com`, `identity-forge` theme kits via the CLI, `8bit-cnlibs` "40+ themes" on Base UI, `sebas-dv/shadcn-theme-editor` writing to `globals.css`). I did not open their repos; do not rely on them for claims.

### Common patterns across the above

| Concern | Pattern |
| --- | --- |
| Axis for color mode | `.dark` class on `<html>` (shadcn, next-themes) |
| Axis for color theme | `data-theme="x"` (thegridcn, usva) or `theme-x` class (shadcn docs site) |
| What a theme overrides | Only semantic tokens (and optionally fonts, radius, shadow) |
| Where a theme lives | A CSS block, plus an optional registry item or JSON token export |
| Scoping | Put the attribute on any ancestor; `@theme inline` makes utilities follow |

---

## Fit for earth-ui

Facts used (read from the repo): `src/components/*.tsx` must equal what the pinned `shadcn add` writes for `base-nova`, enforced by `scripts/upstream/check.mts`. Tokens live in `styles.css` (`@theme inline` mapping about lines 640-690, `:root` at about 700, `.dark` at about 740). `styles.css` is exported as `./styles.css` in `package.json`. `scripts/lib/registry-items.mts` builds the `style` item (`registry:style`, name `style`, referenced as `@earth-ui/style` by every component) with `cssVars: parseTokens(css)` plus a `css` block containing `@custom-variant dark`, `@layer base`, and imports.

### A. Token themes (feasible, recommended)

Because components consume only semantic tokens, token themes need zero component changes and cannot trip the upstream check.

File layout (new files; `styles.css` keeps defining the default theme so existing consumers see no change):

```
styles.css                     # unchanged: default tokens in :root / .dark
themes/
  <name>.css                   # one scoped block per theme, light + dark
  index.css                    # optional: @import every theme
src/ (unchanged)
```

Package: add `"./themes/*.css": "./themes/*.css"` to `exports` and `themes/` to `files`. Consumers write `@import "@asif-sirajudeen/earth-ui/themes/ocean.css";` after `styles.css`.

Selector strategy (my recommendation; matches thegridcn and usva):

```css
/* themes/ocean.css: override semantic tokens only; define the full set in BOTH modes */
[data-theme="ocean"] {
  --primary: ...; --primary-foreground: ...; --ring: ...; --chart-1: ...; --sidebar-primary: ...;
}
.dark[data-theme="ocean"],
.dark [data-theme="ocean"] {
  --primary: ...; --primary-foreground: ...; --ring: ...; --chart-1: ...; --sidebar-primary: ...;
}
```

Reasoning on composition with dark mode:

- Two orthogonal axes: `.dark` (mode, owned by next-themes or the consumer's provider, as shadcn documents) and `data-theme` (palette). `<html class="dark" data-theme="ocean">` works; so does `data-theme` on a wrapper div for scoped sections.
- Specificity: `[data-theme="x"]` (0,1,0) ties with `.dark` (0,1,0), so a plain light block placed after `styles.css` would also override dark base values. The dark block `.dark[data-theme="x"]` / `.dark [data-theme="x"]` is (0,2,0) and wins regardless of order. Hence the rule: each theme must define the same variables in both blocks, otherwise a variable defined only in the light block leaks into dark mode.
- `@theme inline` in `styles.css` already maps utilities to `var(--token)`, so no `@theme` changes are needed per theme.
- Do not use `:root[data-theme]`: it blocks scoping to subtrees, which usva and the Base UI portals case rely on. Portals (dialogs, popovers) render under `<body>`, outside a wrapper `data-theme`; for scoped themes the consumer must put the attribute on `<html>`/`<body>`, or the overlay will fall back to the default theme. Document this limitation. (Base UI portal behavior is from general knowledge of the library; not verified here.)
- A `.dark` element's own `dark:` variants: `@custom-variant dark (&:is(.dark *))` does not match the `.dark` element itself; keep `.dark` on `<html>` as shadcn documents.

Registry items (all via the existing `shadcn build` path):

- Keep `style` as is (`registry:style`, default tokens, base layer, imports).
- Add one item per theme: `earth-theme-<name>`, `type: "registry:theme"`, using `css: { '[data-theme="ocean"]': { "--primary": "..." }, '.dark[data-theme="ocean"], .dark [data-theme="ocean"]': { ... } }`. I verified in `update-css.ts` that non-at-rule keys go through `processRule` at the top level; I did not run the CLI with this shape, so smoke-test `shadcn add` against a scratch project (earth-ui already has `scripts/smoke/registry.mts`).
- Do not use `cssVars.light/dark` for scoped themes. Those always land in `:root`/`.dark` and would overwrite the consumer's default tokens (`overwriteCssVars` is true for `registry:theme|style`). Offer that as a separate "make this the default" variant item (`earth-theme-<name>-default`) if wanted. This matches how tweakcn items behave.
- Optional `registry:base` item (like thegridcn's `base-vega`) only if earth-ui wants `shadcn init`-style one-shot setup (sets `components.json` plus registers the `@earth-ui` namespace). Not needed for themes.

Generation: author themes once as a small JSON/TS map (`light`/`dark` records, same shape as `src/themes.ts` in shadcn) and generate both `themes/<name>.css` and the registry items in `scripts/build/registry.mts`, like `parseTokens` does today for the style item. That keeps npm and registry in sync and testable (`scripts/test/lib/`).

Seed content: start from shadcn's own `registry:theme` palettes (`src/themes.ts`: zinc, blue, green, rose, ...) rather than inventing; they already contain all 30+ tokens in both modes. Convert each to the scoped block with a script. Skip the neutral-family "base colors" duplication unless wanted.

Optional runtime helper: a 20-line `ThemeSwitcher` example (not a component in `src/components`, so no upstream conflict) that sets `data-theme` on `document.documentElement` and persists it, plus an inline `<script>` to avoid flash. next-themes can also own `data-theme` (`attribute={["class","data-theme"]}` with `themes`), but that is next-themes behavior I did not verify here; verify before documenting.

Tokens that tweakcn adds (fonts, shadows, `tracking-normal`, `spacing`): shadcn core has none of them, and earth-ui's `styles.css` has no shadow or font tokens. Components use Tailwind's stock `shadow-*` and `font-sans`. A theme can still set `--font-sans` and `--radius`; shadow themes would need `@theme` overrides and are better left out of v1.

### B. Multiple styles (nova vs vega): not feasible as runtime themes; feasible only as separate component sets

- Styles are baked into class strings at install time (section 1). earth-ui's components are the baked nova output and must match upstream byte for byte. There is no `cn-*` hook left to retarget, so shipping `style-vega.css` would not change anything.
- Partial emulation via tokens, approximate and not true vega: `--radius` (nova and vega both derive radii from it, e.g. `rounded-lg`, `rounded-[min(var(--radius-md),10px)]`) and possibly `--font-sans`. Spacing/density differences (`py-2.5` vs `py-4`) are fixed utilities in the class strings and cannot be changed by tokens. Overriding `--spacing` would scale all layout, not just component padding, so do not market it as a style.
- A true second style means a second component set: `base-vega` output in its own directory (e.g. `src/components-vega/`), its own registry namespace or item suffix, and a second `upstream:check` run against `shadcn add --view` for `base-vega`. Cost: doubles files, deps, docs examples and bundle surface; two import paths. The identical-to-upstream rule still holds per set, so it is legal but expensive. Recommendation: do not do it now; ship token themes first and revisit if demand appears. If revisited, generate the vega set mechanically from the CLI rather than maintaining it by hand.
- Cheaper alternative for consumers who want vega: point them to `npx shadcn add` against shadcn's own registry for those components; earth-ui stays nova-only.

### C. Dark mode composition (summary)

`.dark` stays on `<html>` and keeps the `@custom-variant dark` from `styles.css`. A theme is an attribute, not a class, so the two never collide. Every theme file ships both modes. Default consumers who set no `data-theme` get today's `styles.css` tokens unchanged.

### D. What not to do

- Do not add component-tier tokens (`--earth-button-bg`) to `styles.css`: it adds API surface shadcn does not have, components cannot read them without source edits, and the upstream check would fail.
- Do not edit `src/components/*.tsx` to add theme hooks.
- Do not put scoped themes in `cssVars`.

## Open questions

1. Does `shadcn add` handle a `css` key that is a comma-separated selector list (`.dark[data-theme="x"], .dark [data-theme="x"]`) correctly, and does it merge into an existing rule on re-install? Needs a smoke test with the pinned CLI (`processRule` in [update-css.ts](https://github.com/shadcn-ui/ui/blob/main/packages/registry/src/updaters/update-css.ts) not read in full).
2. Is `registry:theme` or `registry:style` the right type for a scoped theme item? shadcn docs describe `registry:theme` as "for themes" and tweakcn uses `registry:style`; behavior for `css` seems identical (both pass `overwriteCssVars`). Pick one and stay consistent.
3. Portals and scoped themes: should earth-ui document `data-theme` on `<html>` only, or provide a container prop? Components must stay upstream-identical, so a container prop is not an option; confirm how Base UI portals inherit variables.
4. Which palettes to ship first, and should they be derived from shadcn's `themes.ts` (licensing is MIT in the repo; confirm) or authored for earth-ui brand?
5. Should next-themes own both `class` and `data-theme`, or should earth-ui document a two-provider setup? Needs a quick prototype.
6. Contrast: the oklch values in shadcn themes are tuned for shadcn components; does earth-ui want an automated WCAG check per theme in CI (not covered by any shadcn tooling found)?
7. Is `--radius` per theme desirable? It changes every component's shape, which blurs the "theme vs style" line; decide whether themes may set it.
8. Does earth-ui want to track shadcn's `preset` codes (map a preset to an earth-ui theme name)? Possible, since presets decode via `shadcn preset decode`, but not required.

## Smoke test results

Pinned CLI: `shadcn` 4.23.0 (`node_modules/.bin/shadcn --version`). Scratch: `/private/tmp/claude-502/-Users-asif-sirajudeen--claude-spares-spare-6LPmJB/1d21e297-f807-42c5-9845-4d8d18396250/scratchpad/theme-smoke` (project: base-nova `components.json`, `tailwind.css = src/index.css` with `@import "tailwindcss";` + `:root {--primary; --radius}` + `.dark {--primary}`). Tailwind 4.3.5 CLI installed in scratch.

Commands (local file path as item, no server needed): `shadcn add <abs path>/reg/theme-ocean.json --yes --overwrite`. Items: `theme-ocean.json` (`registry:theme`), `theme-ocean-style.json` (`registry:style`), `theme-forest.json`, `theme-ocean-split.json`; `css` only, no `cssVars`.

Result after ocean, then ocean again, then forest (CSS appended after the existing blocks):

```css
:root { --primary: oklch(0.2 0 0); --radius: 0.625rem; }   /* untouched */
.dark { --primary: oklch(0.9 0 0); }                       /* untouched */
  [data-theme="ocean"] {
    --primary: oklch(0.55 0.15 230);
    --radius: 1rem;
}
  .dark[data-theme="ocean"], .dark [data-theme="ocean"] {
    --primary: oklch(0.7 0.12 230);
}
  [data-theme="forest"] { ...150... }
  .dark[data-theme="forest"], .dark [data-theme="forest"] { ...150... }
```

| Question | Result |
|---|---|
| Comma selector key OK? | PASS. Written verbatim as one rule; Tailwind compiles it unchanged. |
| Re-install idempotent? | PASS. 2nd `add` (with and without `--overwrite`) leaves file byte-identical; no duplicates. |
| Multiple themes coexist? | PASS. ocean + forest blocks side by side. |
| Defaults untouched? | PASS. `:root` / `.dark` unchanged. |
| `registry:theme` vs `registry:style` | No difference: byte-identical CSS output; both re-run idempotently. |
| Split keys alternative | Also works (two separate rules, idempotent). Not needed. |
| Tailwind compile | PASS (`@tailwindcss/cli` v4.3.5, no errors; rules present in output). |

Notes: appended rules are indented 2 spaces with a 0-indent closing brace (cosmetic). `--radius` inside a theme key is applied like any other var. Errors: none encountered.

## base-vega vs base-nova

Scope: does shadcn's `base-vega` differ from `base-nova`, would earth-ui's `[data-theme]` token themes work on it, can tokens approximate it. Pinned CLI 4.23.0, registry as of 2026-11-11. Scratch (not committed): `/private/tmp/claude-502/-Users-asif-sirajudeen--claude-spares-spare-6LPmJB/1d21e297-f807-42c5-9845-4d8d18396250/scratchpad/vega-compare`.

### Method
- Two scratch projects (`/private/tmp/claude-502/-Users-asif-sirajudeen--claude-spares-spare-6LPmJB/1d21e297-f807-42c5-9845-4d8d18396250/scratchpad/vega-compare/nova`, `/private/tmp/claude-502/-Users-asif-sirajudeen--claude-spares-spare-6LPmJB/1d21e297-f807-42c5-9845-4d8d18396250/scratchpad/vega-compare/vega`) with earth-ui's `components.json`, only `style` changed. Same mechanism as `scripts/upstream/check.mts`: `shadcn add <item> --view`, `extractFiles` from that script, prettier with the repo config.
- 10 requested items: button input card dialog select tabs badge checkbox dropdown-menu sidebar. Pulled in as dependencies: sheet separator skeleton tooltip. 14 files per style.
- Sanity: all 14 nova outputs are byte-equal to `src/components/*.tsx` after prettier.
- Whole-library cross-check: diff of `style-vega.css` vs `style-nova.css` (both 1825 lines, upstream `apps/v4/registry/styles/`), rule by rule, `@apply` token multiset diff.
- Counts below are differing class tokens (nova-only + vega-only); a changed `h-8` to `h-9` counts 2. Classifier is regex based (`/private/tmp/claude-502/-Users-asif-sirajudeen--claude-spares-spare-6LPmJB/1d21e297-f807-42c5-9845-4d8d18396250/scratchpad/vega-compare/analyze.mjs`), so treat counts as approximate.

### 1. What differs (components)
Identical in vega: badge, separator, skeleton, tooltip. Differ: 10 of 14.

| file | tokens | radius scale (a) | color (a) | padding/gap | height/size | position | shadow | other |
|---|---|---|---|---|---|---|---|---|
| button | 22 | 11 | 0 | 0 | 5 | 0 | 1 | 5 (capped radius 4, text 1) |
| card | 17 | 0 | 1 | 6 | 0 | 0 | 1 | 9 |
| checkbox | 3 | 0 | 0 | 0 | 0 | 0 | 1 | 2 |
| dialog | 17 | 1 | 1 | 7 | 2 | 4 | 0 | 2 |
| dropdown-menu | 46 | 8 | 0 | 38 | 0 | 0 | 0 | 0 |
| input | 11 | 2 | 2 | 0 | 4 | 0 | 1 | 2 |
| select | 23 | 4 | 0 | 10 | 4 | 0 | 1 | 4 |
| sheet | 7 | 0 | 0 | 2 | 0 | 4 | 0 | 1 |
| sidebar | 4 | 0 | 0 | 4 | 0 | 0 | 0 | 0 |
| tabs | 10 | 0 | 0 | 8 | 2 | 0 | 0 | 0 |
| total (14 files) | 160 | 26 (16%) | 4 (3%) | 75 (47%) | 17 (11%) | 8 | 5 | 25 |

Whole style (all 441 `cn-*` rules; 160 differ; 689 differing tokens): padding/margin/gap 46%, radius scale 19%, height/width/size 14%, color 4%, other layout 4%, position 4%, shadow 3%, capped radius 2%, text size 2%, ring/border width 1%. Category (a) (radius scale + color + font) is 23%; (b) hard-coded is 77%.

Representative diffs (nova to vega):

```
button   rounded-lg -> rounded-md   h-8 -> h-9   h-7 -> h-8   h-9 -> h-10   outline: + shadow-xs
         sm: text-[0.8rem] and svg size-3.5 dropped; rounded-[min(var(--radius-md),12px)] -> rounded-[min(var(--radius-md),10px)]
input    h-8 rounded-lg transition-colors file:h-6 disabled:bg-input/50 dark:disabled:bg-input/80
      -> h-9 rounded-md shadow-xs transition-[color,box-shadow] file:h-7
card     [--card-spacing:--spacing(4)] -> shadow-xs [--card-spacing:--spacing(6)]; footer drops bg-muted/50 border-t
dialog   gap-4 p-4 sm:max-w-sm top-2 right-2 -> gap-6 p-6 sm:max-w-md top-4 right-4; footer loses bg-muted/50 -mx-4 -mb-4 rounded-b-xl border-t p-4
dropdown rounded-lg px-1.5 py-1 gap-1.5 -> px-2 py-1.5 gap-2 (items rounded-md -> rounded-sm)
tabs     h-8 px-1.5 py-0.5 -> h-9 px-2 py-1
sheet    top-3 right-3 gap-0.5 text-base -> top-4 right-4 gap-1.5
```

Net: vega is the roomier, flatter-bordered, lightly shadowed variant (controls 1 step taller, padding ~1 step up, radius 1 step down, `shadow-xs` on inputs, select, checkbox, card, outline button). Nova has no shadow-xs on those and uses tinted footers (`bg-muted/50`).

### 2. Same CSS variable names?
Yes. Evidence:
- `style.json` registry item for `base-nova` and `base-vega` (`https://ui.shadcn.com/r/styles/base-<x>/style.json`) is byte-identical after `json.tool`: `cssVars: {}`, same deps, same `css` (`@layer base` with `border-border outline-ring/50`).
- Neither style CSS defines a variable. The set of `var(--*)` the two files reference is identical (`--radius`, `--radius-md`, `--primary`, `--secondary`, `--foreground`, `--muted`, `--sidebar-*`; vega uses `--radius-md` 5 times, nova 9). Semantic colors used by vega are a subset of the nova set.
- Not run: `shadcn init` per preset (it scaffolds a Next app); theme/base-color items are style independent in `src/themes.ts`.

So a `[data-theme="ocean"]` block that overrides semantic tokens applies to vega exactly as to nova. Both use the same `@theme inline` mapping; vega just picks different utilities (`rounded-md` where nova has `rounded-lg`). A theme that sets `--radius` shifts both, but vega at `--radius: R` renders radii 0.8x of nova at `R`.

### 3. Can tokens approximate vega?
Short answer: no, only the radius quarter of it.
- Reachable by tokens: radius scale (19% of differing tokens) and, in principle, font. Radius step changes are lg to md (40 pairs), md to sm (13), xl to lg (1), ratio 0.8 and 0.75. Overriding `--radius-lg: calc(var(--radius) * 0.8)` and `--radius-md: calc(var(--radius) * 0.6)` fixes those, but also shrinks 13 `rounded-lg` and 19 `rounded-md` utilities that vega keeps unchanged. A single smaller `--radius` also shrinks the untouched `xl`/`4xl` radii (20 `rounded-xl` unchanged).
- Color (4%) is not reachable by value tuning: the diff is a different class (`bg-muted/50` dropped, `disabled:bg-input/50` dropped), not a different value.
- `min(var(--radius-md),Npx)` caps (2%): token only reaches below the hard-coded cap.
- Not reachable: padding, gap, heights, positions, shadow-xs additions, text sizes, ring/border widths, removed footer chrome: about 77% of the diff.
- `--spacing` does not work. Tailwind v4 scales every spacing utility from it, including the ones vega leaves identical. The needed ratios are not uniform: heights 7 to 8 (1.14), 8 to 9 (1.125), 9 to 10 (1.11); gaps 1 to 1.5 (1.5), 1.5 to 2 (1.33), 4 to 6 (1.5), 2.5 to 4 (1.6); card spacing 4 to 6 (1.5). One factor cannot fit both, and the global effect also resizes layouts, typography leading and every non-component spacing in the app.
- Verdict: tokens (`--radius`, `--font-sans`) can give vega-ish corners at best. They cannot produce vega's density or shadows. Shipping vega means different class strings.

### 4. Feasibility of vega as a second component set
No edits made; this is what would be needed.
- `scripts/upstream/check.mts`: the style is read from `components.json` in the cwd (`style: base-nova`); the script has no style parameter. Needs (a) a style arg or env (`--style vega`), (b) a second `components.json` (e.g. `components.vega.json`, `style: base-vega`) written to a temp dir and passed as `cwd` to the `execFile` calls (shadcn needs a `components.json` and a tailwind css file path in cwd; the scratch projects here needed only `src/index.css` with `@import "tailwindcss"`), and (c) the compare target dir (`src/components-vega`), since it diffs `existsSync(path)` using the path the CLI reports (`src/components/x.tsx`), so a path remap is needed. `registry.json` items would feed the name list for either set.
- `scripts/build/registry.mts` and `scripts/lib/registry-items.mts` hard-code `src/components`, `src/hooks`, `src/lib` and one `registry/metadata.ts`. A second set needs a parameterised source dir and a name suffix or namespace (item names are the file basenames, so `button` would collide), plus its own `style` item. `barrel.mts` writes one `src/index.ts`; `tsdown.config.ts` entries, `props.mts`, `examples.mts` (`site/examples`) and `package.json` exports/files would each need a second entry or subpath (`@asif-sirajudeen/earth-ui/vega`). `scripts/smoke/registry.mts` copies the one `components.json`.
- `scripts/upstream/ledger.mts` tracks only `style-nova.css` rule changes (`NOVA = "style-nova.css"`); a vega ledger needs the same for `style-vega.css`.
- Cost: nova and vega differ in 160 of 441 style rules, so the vega set is a near full copy (64 components, same deps). Radix is a separate axis and not considered here. Cheaper alternative stays as in section B: tell consumers to run `npx shadcn add` with a `base-vega` project for those components.

### 5. Side finding: check.mts does not compare sidebar.tsx
`shadcn add --view` lists at most 5 files ("Showing 5 of 8 files. Use --view <path> to view a specific file."). `shadcn add sidebar --view` prints only button, input, separator, skeleton, tooltip. `sheet` and `use-mobile` are covered by their own items, but `sidebar.tsx` is never printed, so `upstream:check` reports "0 drifted of 65 files" while we have 66 files (64 components + 2 hooks). I verified `shadcn add sidebar --view src/components/sidebar.tsx` does print it (724 lines, and it equals ours after prettier in a real install). Fix: after the loop, also run `--view <path>` for any registry file not seen. Not edited.

### Commands
```
S=/private/tmp/claude-502/-Users-asif-sirajudeen--claude-spares-spare-6LPmJB/1d21e297-f807-42c5-9845-4d8d18396250/scratchpad/vega-compare; export S
node $S/fetch.mts nova $S/out-nova input card dialog select tabs badge checkbox dropdown-menu sidebar button   # also in vega
# sidebar/sheet via real add (view caps at 5 files): (cd $S/vega && shadcn add sidebar sheet --yes --overwrite)
node $S/analyze.mjs style v     # per-rule diff of style-nova.css vs style-vega.css
node $S/analyze.mjs comp x v    # per-component token diff
curl -s https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/styles/style-vega.css -o $S/style-vega.css
```
