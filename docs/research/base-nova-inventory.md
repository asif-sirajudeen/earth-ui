# base-nova component inventory

As of: 2026-11-06
Feeds: `docs/specs/phase-1b-component-coverage.md`
Method: every fact below comes from shadcn's published registry JSON, from the files that shadcn CLI 4.23.0 actually wrote, or from npm registry metadata. Raw extracted data, the extraction scripts and the Tailwind probe live in `docs/research/base-nova-inventory/`; its README says how to re-run them.

## Sources

| What | Source |
| --- | --- |
| Item list (221 items, 65 `registry:ui`) | [base-nova registry.json](https://ui.shadcn.com/r/styles/base-nova/registry.json) |
| Per-item JSON (declared fields, raw source) | `https://ui.shadcn.com/r/styles/base-nova/<name>.json`, fetched for all 65 ui items plus `index`, `style`, `utils`, `use-mobile` and `use-highlighted-code` |
| Actual imports, `"use client"` and classes | `shadcn add --all -y -o`, then `shadcn add sonner -y -o`, run with CLI 4.23.0 in a scratch copy of this repo's `components.json`, `styles.css`, `tsconfig.json` and `package.json`. Registry source uses an `IconPlaceholder`; the CLI rewrites it to `lucide-react` because `iconLibrary` is `lucide`, so only the CLI output shows the real imports. |
| Hidden and deprecated items | `@shadcn/registry` 0.2.1 (CLI dependency), `dist/registry/constants.js` |
| shadcn utilities and variants | `shadcn@4.23.0` `dist/tailwind.css` (637 lines) |
| tw-animate-css utilities | `tw-animate-css@1.4.0` `dist/tw-animate.css` |
| Peer ranges | `npm view <pkg>@latest` on 2026-11-06, plus the versions the CLI installed |

## Counts

| Group | Count | Items |
| --- | --- | --- |
| `registry:ui` total | 65 | |
| Already shipped (phase 1) | 3 | button, input, label |
| Batch A: no new dependencies or CSS | 19 | tickets 01 to 03 |
| Batch B: icons, shadcn variants or animations | 33 | tickets 04 to 11 |
| Batch C: third-party libraries | 9 | tickets 12 to 19 (ticket 20 is the optional highlighting hook) |
| Excluded | 1 | form |

The ticket numbers refer to `.scratch/earth-ui-phase-1b/issues/`. "Own needs" counts only what the file itself uses. An item whose dependency ships in a later batch is promoted into that batch. Only `item` is promoted: it needs only batch-A features, but it imports `separator`, which is in batch B.

## Inventory

Column notes:
- **Actual npm imports** leaves out `react` and `react-dom`.
- **Undeclared** lists packages the source imports but the registry item does not list.
- **Icons** is the number of distinct `lucide-react` icons.
- **shadcn CSS** lists the custom variants and utilities from `shadcn/tailwind.css`.
- **tw-animate** is the number of distinct `tw-animate-css` classes.

| Batch | Ticket | Item | use client | registryDependencies | Declared deps | Actual npm imports | Undeclared | Icons | shadcn CSS | tw-animate | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| shipped | 1-0x | button | no | – | cn | @base-ui/react, class-variance-authority, cn | @base-ui/react, class-variance-authority | – | – | – | – |
| shipped | 1-0x | input | no | – | cn | @base-ui/react, cn | @base-ui/react | – | – | – | – |
| shipped | 1-0x | label | yes | – | cn | cn | – | – | – | – | – |
| A | 01 | alert | no | – | cn | class-variance-authority, cn | class-variance-authority | – | – | – | – |
| A | 01 | badge | no | – | cn | @base-ui/react, class-variance-authority, cn | @base-ui/react, class-variance-authority | – | – | – | – |
| A | 01 | card | no | – | cn | cn | – | – | – | – | – |
| A | 01 | empty | no | – | cn | class-variance-authority, cn | class-variance-authority | – | – | – | – |
| A | 01 | input-group | yes | button, input, textarea | cn | class-variance-authority, cn | class-variance-authority | – | – | – | – |
| A | 01 | kbd | no | – | cn | cn | – | – | – | – | – |
| A | 01 | skeleton | no | – | cn | cn | – | – | – | – | – |
| A | 01 | textarea | no | – | cn | cn | – | – | – | – | – |
| A | 02 | aspect-ratio | no | – | cn | cn | – | – | – | – | – |
| A | 02 | avatar | yes | – | cn | @base-ui/react, cn | @base-ui/react | – | – | – | – |
| A | 02 | collapsible | yes | – | – | @base-ui/react | @base-ui/react | – | – | – | – |
| A | 02 | progress | yes | – | cn | @base-ui/react, cn | @base-ui/react | – | – | – | – |
| A | 02 | table | yes | – | cn | cn | – | – | – | – | – |
| A | 02 | toggle | yes | – | cn | @base-ui/react, class-variance-authority, cn | @base-ui/react, class-variance-authority | – | – | – | – |
| A | 03 | bubble | no | – | cn | @base-ui/react, class-variance-authority, cn | @base-ui/react, class-variance-authority | – | – | – | – |
| A | 03 | direction | yes | – | @base-ui/react | @base-ui/react | – | – | – | – | – |
| A | 03 | drawer | yes | – | cn, @base-ui/react | @base-ui/react, cn | – | – | – | – | – |
| A | 03 | marker | no | – | cn | @base-ui/react, class-variance-authority, cn | @base-ui/react, class-variance-authority | – | – | – | – |
| A | 03 | message | no | – | cn | cn | – | – | – | – | – |
| B | 04 | checkbox | yes | – | cn | @base-ui/react, cn, lucide-react | @base-ui/react, lucide-react | 1 | data-checked | – | – |
| B | 04 | radio-group | yes | – | cn | @base-ui/react, cn | @base-ui/react | – | data-checked | – | – |
| B | 04 | separator | yes | – | cn | @base-ui/react, cn | @base-ui/react | – | data-horizontal, data-vertical | – | – |
| B | 04 | spinner | no | – | cn | cn, lucide-react | lucide-react | 1 | – | – | – |
| B | 04 | switch | yes | – | cn | @base-ui/react, cn | @base-ui/react | – | data-checked, data-disabled, data-unchecked | – | – |
| B | 05 | breadcrumb | no | – | cn | @base-ui/react, cn, lucide-react | @base-ui/react, lucide-react | 2 | – | – | – |
| B | 05 | button-group | no | separator | cn | @base-ui/react, class-variance-authority, cn | @base-ui/react, class-variance-authority | – | data-horizontal, data-vertical | – | – |
| B | 05 | field | yes | label, separator | cn | class-variance-authority, cn | class-variance-authority | – | data-checked, data-horizontal | – | – |
| B | 05 | item | no | separator | cn | @base-ui/react, class-variance-authority, cn | @base-ui/react, class-variance-authority | – | – | – | own needs: A; promoted by deps |
| B | 05 | native-select | no | – | cn | cn, lucide-react | lucide-react | 1 | – | – | – |
| B | 05 | pagination | no | button | cn | cn, lucide-react | lucide-react | 3 | – | – | – |
| B | 05 | slider | no | – | cn | @base-ui/react, cn | @base-ui/react | – | data-disabled, data-horizontal, data-vertical | – | – |
| B | 05 | toggle-group | yes | toggle | cn | @base-ui/react, class-variance-authority, cn | @base-ui/react, class-variance-authority | – | data-horizontal, data-vertical | – | – |
| B | 06 | accordion | no | – | cn | @base-ui/react, cn, lucide-react | @base-ui/react, lucide-react | 2 | data-closed, data-open, accordion keyframes | – | – |
| B | 06 | attachment | no | button | cn | @base-ui/react, class-variance-authority, cn | @base-ui/react, class-variance-authority | – | scroll-fade-x, shimmer | – | – |
| B | 06 | scroll-area | yes | – | cn | @base-ui/react, cn | @base-ui/react | – | data-horizontal, data-vertical | – | – |
| B | 06 | tabs | yes | – | cn | @base-ui/react, class-variance-authority, cn | @base-ui/react, class-variance-authority | – | data-active, data-horizontal, data-vertical | – | – |
| B | 06 | trace | no | collapsible | cn | cn, lucide-react | lucide-react | 1 | shimmer, shimmer-none | – | – |
| B | 06 | code-block | yes | button, use-highlighted-code | cn | class-variance-authority, cn, lucide-react | class-variance-authority, lucide-react | 2 | scroll-fade-x, scroll-fade-y | – | registry dep pulls shiki (not imported); ships without the hook |
| B | 07 | alert-dialog | yes | button | cn | @base-ui/react, cn | @base-ui/react | – | data-closed, data-open | 6 | – |
| B | 07 | dialog | yes | button | cn | @base-ui/react, cn, lucide-react | @base-ui/react, lucide-react | 1 | data-closed, data-open | 6 | – |
| B | 07 | sheet | yes | button | cn | @base-ui/react, cn, lucide-react | @base-ui/react, lucide-react | 1 | – | – | – |
| B | 08 | hover-card | yes | – | cn | @base-ui/react, cn | @base-ui/react | – | data-closed, data-open | 10 | – |
| B | 08 | popover | yes | – | cn | @base-ui/react, cn | @base-ui/react | – | data-closed, data-open | 10 | – |
| B | 08 | tooltip | yes | – | cn | @base-ui/react, cn | @base-ui/react | – | data-closed, data-open | 10 | – |
| B | 09 | context-menu | yes | – | cn | @base-ui/react, cn, lucide-react | @base-ui/react, lucide-react | 2 | data-closed, data-disabled, data-open | 10 | – |
| B | 09 | dropdown-menu | yes | – | cn | @base-ui/react, cn, lucide-react | @base-ui/react, lucide-react | 2 | data-closed, data-disabled, data-open | 10 | – |
| B | 09 | menubar | yes | dropdown-menu | cn | @base-ui/react, cn, lucide-react | @base-ui/react, lucide-react | 1 | data-closed, data-disabled, data-open | 10 | – |
| B | 10 | combobox | yes | button, input-group | cn, @base-ui/react | @base-ui/react, cn, lucide-react | lucide-react | 3 | data-closed, data-disabled, data-open, no-scrollbar | 10 | – |
| B | 10 | navigation-menu | no | – | cn | @base-ui/react, class-variance-authority, cn, lucide-react | @base-ui/react, class-variance-authority, lucide-react | 1 | data-active, data-closed, data-open | 12 | – |
| B | 10 | select | yes | – | cn | @base-ui/react, cn, lucide-react | @base-ui/react, lucide-react | 3 | data-closed, data-disabled, data-open | 10 | – |
| B | 11 | sidebar | yes | button, input, separator, sheet, skeleton, tooltip, use-mobile | cn | @base-ui/react, class-variance-authority, cn, lucide-react | @base-ui/react, class-variance-authority, lucide-react | 1 | data-active, data-open, no-scrollbar | – | also writes use-mobile.ts |
| B | 11 | toast | yes | button | cn, @base-ui/react | @base-ui/react, cn, lucide-react | lucide-react | 6 | – | – | – |
| C | 12 | calendar | yes | button | cn, react-day-picker@latest, date-fns | cn, lucide-react, react-day-picker | lucide-react | 3 | – | – | declared, not imported: date-fns; registry pins react-day-picker@latest |
| C | 13 | carousel | yes | button | cn, embla-carousel-react | cn, embla-carousel-react, lucide-react | lucide-react | 2 | – | – | – |
| C | 14 | chart | yes | card | cn, recharts@3.8.0 | cn, recharts | – | – | – | – | registry pins recharts@3.8.0 |
| C | 15 | command | yes | dialog, input-group | cn, cmdk | cmdk, cn, lucide-react | lucide-react | 2 | data-selected, no-scrollbar | – | – |
| C | 16 | input-otp | yes | – | cn, input-otp | cn, input-otp, lucide-react | lucide-react | 1 | – | 1 | inert hook class cn-input-otp |
| C | 17 | resizable | yes | – | cn, react-resizable-panels | cn, react-resizable-panels | – | – | – | – | – |
| C | 18 | message-scroller | yes | button | cn, @shadcn/react | @shadcn/react, cn, lucide-react | lucide-react | 1 | scroll-fade-b | – | – |
| C | 18 | questionnaire | yes | button | cn, @shadcn/react | @shadcn/react, cn, lucide-react | lucide-react | 1 | data-checked, data-disabled | – | – |
| C | 19 | sonner | yes | – | sonner, next-themes | lucide-react, next-themes, sonner | lucide-react | 5 | – | – | inert hook class cn-toast |
| excluded | – | form | – | – | – | – | – | – | – | – | Registry item has no files (empty `form.json`); nothing to ship. |

Patterns:

- **The registry under-declares dependencies for 50 of the 61 items that still need shipping.** No `registry:ui` item declares `lucide-react`, and `shadcn add` never installs it (the `registry:style` items `index` and `style` do declare it, so `shadcn init` installs it): after `add --all`, `package.json` had no `lucide-react`, although 25 files import it. `@base-ui/react` and `class-variance-authority` are also missing from most items, as phase 1 found.
- **The registry also over-declares and pins.**
  - `calendar` declares `date-fns` but does not import it. `react-day-picker` brings its own copy.
  - `calendar` declares `react-day-picker@latest`, and `chart` declares `recharts@3.8.0`. The CLI wrote `^10.0.2` and `^3.8.0`.
  - `code-block` lists `use-highlighted-code` as a registry dependency but never imports it. Even so, `shadcn add code-block --dry-run` creates `src/hooks/use-highlighted-code.ts` and `src/lib/highlighter.tsx` and adds `shiki`.
- **Inert hook classes.** `cn-toast` (sonner) and `cn-input-otp` (input-otp) are defined nowhere in the registry or in `shadcn/tailwind.css`, so they style nothing.

## Not `registry:ui`: excluded or planned

| Type | Count | Decision |
| --- | --- | --- |
| `registry:block` | 30 | Excluded. Page-level compositions belong to the phase 2 registry. |
| `registry:example` | 68 | Excluded. Docs examples belong to the phase 4 docs. |
| `registry:font` | 52 | Excluded. The consumer's font applies (Spec 1). |
| `registry:style` (`index`, `style`) | 2 | Excluded as items. Their `css` field (`@import "tw-animate-css"`, `@import "shadcn/tailwind.css"`, base layer) is the source of the stylesheet decision in Spec 1b. |
| `registry:component` (`example`) | 1 | Excluded. Demo wrapper. |
| `registry:lib` `utils` | 1 | Not needed. Components import `cn` from the `cn` package directly. |
| `registry:hook` `use-mobile` | 1 | **Planned** with `sidebar` (ticket 11). Internal only. It has no npm dependencies. |
| `registry:hook` `use-highlighted-code` (+ `lib/highlighter.tsx`) | 1 | **Open decision**: ship or drop (ticket 20, needs-human). It needs `shiki`. `code-block` ships without it in ticket 06. |

## Third-party packages

Resolved on 2026-11-06. Every package accepts React 19.

| Package | Latest | Licence | Peer dependencies | Used by | Notes |
| --- | --- | --- | --- | --- | --- |
| lucide-react | 1.70.0 | ISC | react ^16.5.1 \|\| ^17 \|\| ^18 \|\| ^19 | 25 items | Leaf components, no shared context |
| tw-animate-css | 1.4.0 | MIT | none | stylesheet | CSS only; export condition `style` |
| react-day-picker | 10.0.2 | MIT | react >=16.8.0 | calendar | Depends on `date-fns` and `@date-fns/tz` |
| embla-carousel-react | 8.6.0 | MIT | react ^16.8 … ^19 | carousel | |
| recharts | 3.10.1 (registry pins 3.8.0) | MIT | react, react-dom, **react-is** ^16.8 … ^19 | chart | `react-is` is a required peer; 11 dependencies including redux toolkit and immer |
| cmdk | 1.1.1 | MIT | react, react-dom ^18 \|\| ^19 | command | **Depends on Radix** (`@radix-ui/react-dialog`, `-id`, `-primitive`, `-compose-refs`) |
| input-otp | 1.5.0 | MIT | react, react-dom ^16.8 … ^19 | input-otp | |
| react-resizable-panels | 4.18.1 | MIT | react, react-dom ^18 \|\| ^19 | resizable | |
| @shadcn/react | 0.3.1 | MIT | react >=19 (optional) | message-scroller, questionnaire | 0.x; exports only `./message-scroller` and `./questionnaire` |
| shiki | 4.6.0 | MIT | none | use-highlighted-code hook | Eight `@shikijs/*` dependencies; heavy install |
| sonner | 2.0.8 | MIT | react, react-dom ^18 \|\| ^19 | sonner | |
| next-themes | 0.4.6 | MIT | react, react-dom ^16.8 … ^19 | sonner | React context: an app and the package must share one copy |
| @base-ui/react | 1.9.0 | MIT | react ^17 \|\| ^18 \|\| ^19; date-fns, @date-fns/tz optional | 38 items (including button and input) | Already a dependency |

## Stylesheet facts

**`shadcn/tailwind.css` (shadcn 4.23.0) defines:**
- custom variants `data-open`, `data-closed`, `data-checked`, `data-unchecked`, `data-selected`, `data-disabled`, `data-active`, `data-horizontal`, `data-vertical`;
- `accordion-down` and `accordion-up` keyframes, which read `--accordion-panel-height` (Base UI);
- the `no-scrollbar` utility;
- the `scroll-fade` family, with `-x`, `-y`, `-t`, `-b`, `-l`, `-r`, `-s`, `-e`, `-*` and `-none` variants, plus `@property` rules;
- the `shimmer` family, plus `@property` rules and the `tw-shimmer` keyframes.

**`tw-animate-css` 1.4.0 defines:**
- `animate-in` and `animate-out`;
- the `fade-*`, `zoom-*`, `spin-*`, `blur-*`, `slide-in-from-*` and `slide-out-to-*` utilities;
- `animate-accordion-*`, `animate-collapsible-*` and `animate-caret-blink`;
- the animation timing utilities.

**Tailwind CLI 4.3.4 probe (inputs and outputs in `docs/research/base-nova-inventory/tailwind-probe/`).** One class string was compiled with and without `@import "tw-animate-css"; @import "shadcn/tailwind.css";`:
- Without them, `data-horizontal:` compiles to `[data-horizontal]` and `data-selected:` compiles to `[data-selected]`. Base UI sets `data-orientation="horizontal"`, so separator, tabs, slider and the other orientation-aware items would lose those styles.
- Without them, `animate-in`, `fade-in-0`, `zoom-in-95`, `no-scrollbar`, `scroll-fade-x`, `shimmer` and `animate-caret-blink` produce no CSS.
- With them, the custom variants compile to `:where([data-orientation="horizontal"])`, `:where([data-selected="true"])` and so on.
- Both files emit `@keyframes accordion-down`. The later rule wins, so `shadcn/tailwind.css` must come after `tw-animate-css`: its version reads Base UI's `--accordion-panel-height`.
- Only keyframes that are used are emitted. The `@property` rules from `shadcn/tailwind.css` are emitted.

**Native Tailwind `data-*` variants are enough for batch A.** `drawer` uses `data-swiping:` and `data-ending-style:`. Base UI sets those as plain attributes, so Tailwind's built-in `data-*` variant matches them.

## shadcn CLI facts (4.23.0)

- **`shadcn eject`** is described as "inline shadcn/tailwind.css and remove the shadcn dependency". It needs `@import "shadcn/tailwind.css"` in the CSS file named in `components.json`. It replaces that import with `/* ejected from shadcn@<version> */` followed by the full file, then removes `shadcn` from `package.json`. The CLI warns: "This action is not reversible. Future shadcn CLI updates to tailwind.css will not apply automatically."
- **The `shadcn` package is a CLI.** It has 32 runtime dependencies, including Babel, ts-morph, the MCP server and dotenvx, and a 70 MB install.
- **`add --all`** adds every `registry:ui` item except those in `DEPRECATED_COMPONENTS` or `COMPONENTS_HIDDEN_FROM_SELECTION`. For the `base` style that leaves out `sonner`, whose entry reads `hiddenIn: ["base"]`. Base UI's `toast` is the Base UI replacement for sonner. `sonner` can still be added by name.
- **`add` never changed `styles.css`.** No `registry:ui` item has `css` or `cssVars`; only the `index` and `style` items carry the stylesheet imports.

## Public API facts

- **One export-name collision.** `toast` and `sonner` both export `Toaster`, so the root entry cannot re-export both. This is the only collision among the 390 names exported by the 64 component files.
- **Every file the CLI writes into the components folder is a real component.** Hooks and lib files go to `src/hooks` and `src/lib`. They fall outside the `./*` subpath pattern, which maps to `dist/components`.
- **`direction` only re-exports Base UI's `DirectionProvider` and `useDirection`.**
- **Seven files without `"use client"` call Base UI's `useRender`:** attachment, badge, breadcrumb, bubble, button-group, item and marker.
  - `useRender` reaches `React.useRef`, which the `react-server` build of React 19.3.1 does not export.
  - Whether these files render inside a server component is unverified. The phase 1b check renders new components from client components only.
