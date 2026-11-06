# Spec 1b: Cover every base-nova component (phase 1b)

Status: ready-for-agent
As of: 2026-11-06
Plan: [Earth UI Plan](https://claude.ai/artifact/G2EioWL8tqdYYbkos8c1fk)
Builds on: `docs/specs/phase-1-package.md`
Inventory: `docs/research/base-nova-inventory.md` (every base-nova registry item checked against the registry JSON, shadcn CLI 4.23.0 output and npm metadata on 2026-11-06)
Tickets: `.scratch/earth-ui-phase-1b/issues/`

## Problem Statement

Phase 1 proved the pipeline with three primitives: Button, Input and Label. An app that needs a dialog, a menu, a tooltip or a date picker must still copy shadcn source into its own tree. Each copy is a fork, and the drift problem that phase 1 set out to remove comes back for every component the package does not ship.

As an app developer, I want every shadcn component I use to arrive from the package. As the maintainer, I want to add the rest of shadcn's Base UI style without breaking what phase 1 shipped. The remaining components need more than the first three did: icons, animation utilities, shadcn's custom Tailwind variants, and in some cases third-party libraries.

## Solution

Ship all 61 remaining `base-nova` UI components through the phase 1 pipeline, in 20 small releases grouped into three batches:

- **Batch A**, 19 components in 3 tickets. They need nothing new: only Base UI, class-variance-authority, `cn` and React.
- **Batch B**, 33 components in 8 tickets. They need `lucide-react` icons, shadcn's custom variants and utilities, or `tw-animate-css` animations. The first B ticket adds all three. The others add only components.
- **Batch C**, 9 components in 8 tickets, one per third-party library. The libraries are react-day-picker, embla, recharts, cmdk, input-otp, react-resizable-panels, `@shadcn/react` and sonner. A final ticket holds the optional code-highlighting hook (shiki), pending an open decision.

Every ticket is one minor release through Changesets. Each release is checked in the scratch Next.js app before its Version PR merges. The empty `form` registry item is excluded because it has no files.

## User Stories

1. As an app developer, I want every shadcn `base-nova` component from the package, so that I never copy shadcn source into my app.
2. As an app developer, I want each new component importable from the package root, so that one import line still brings in what I need.
3. As an app developer, I want each new component importable from its own subpath, so that I can keep imports explicit.
4. As an app developer, I want the same single stylesheet import to keep working, so that new components need no extra CSS setup.
5. As an app developer, I want menus, dialogs, popovers and tooltips to animate open and closed as they do on the shadcn site, so that the package matches the reference design.
6. As an app developer, I want orientation-aware components such as Separator, Tabs, Slider and Toggle Group to style correctly in both orientations, so that layout does not break.
7. As an app developer, I want the icons inside components to render without me installing an icon library, so that a Checkbox shows its check mark out of the box.
8. As an app developer, I want third-party libraries such as the date picker and the chart library to install with the package, so that I do not chase missing modules.
9. As an app developer, I want every library the package uses to support React 19, so that my React 19 app has no peer conflicts.
10. As an app developer, I want one copy of each context-bearing library in my app, so that theme state I set is the theme state the component reads.
11. As an app developer, I want components I do not import to stay out of my bundle, so that adding the chart component to the package does not grow my login page.
12. As an app developer, I want each batch to arrive as a normal minor release with a changelog, so that I can see which components a release added.
13. As an app developer, I want light and dark themes to work for every new component, so that overlays and menus stay readable in dark mode.
14. As an app developer using the App Router, I want new components to work inside my client components, so that I can build interactive screens with them.
15. As an app developer, I want overlay components to keep their keyboard and focus behaviour, so that dialogs and menus stay accessible.
16. As an app developer, I want the sidebar to adapt to mobile widths, so that the shadcn sidebar behaves as documented.
17. As an app developer, I want Toast as the default notification component, so that notifications run on Base UI like everything else.
18. As an app developer who already uses sonner and next-themes, I want an optional Sonner Toaster on its own subpath, so that I can keep my existing setup.
19. As an app developer who wants highlighted code, I want the code-highlighting hook on its own subpath, so that apps without code blocks never install or resolve the highlighter.
20. As an app developer, I want TypeScript types for every new component, so that my editor shows the props and variants.
21. As the maintainer, I want every component pulled with the shadcn CLI `add` command and checked with `add --diff`, so that upstream changes stay easy to follow.
22. As the maintainer, I want each ticket sized for one context window, so that an agent can finish it in one session.
23. As the maintainer, I want tickets ordered so that a component never ships before the components it imports, so that each release builds on its own.
24. As the maintainer, I want package dependencies to match what the source actually imports, so that the registry's missing or extra declarations never reach consumers.
25. As the maintainer, I want shadcn's Tailwind variants and utilities without depending on the shadcn CLI, so that consumers do not install a 70 MB CLI.
26. As the maintainer, I want the vendored shadcn rules marked with the shadcn version they came from, so that I can diff them when I upgrade the CLI.
27. As the maintainer, I want `"use client"` to follow the upstream source exactly, so that client boundaries stay where shadcn put them.
28. As the maintainer, I want each new public subpath listed in its ticket, so that I know which renames would be breaking changes.
29. As the maintainer, I want internal hooks kept off the public API, so that I can change them without a major release.
30. As the maintainer, I want the pre-release check to exercise every new interactive component in a real browser, so that a missing variant or animation is caught before CI publishes.
31. As the maintainer, I want a changeset in every batch ticket, so that each batch produces its own minor version and changelog.
32. As the maintainer, I want the known `buttonVariants` border quirk tracked as an open decision, so that I decide on it once rather than per component.
33. As the maintainer, I want blocks, examples and fonts excluded with a reason, so that the scope stays the component package.
34. As the maintainer, I want the shadcn and tw-animate-css licence notices kept, so that vendored and depended-on code meets their MIT terms.

## Implementation Decisions

**Scope and batching**

- The inventory covers all 65 `registry:ui` items in shadcn's `base-nova` registry. Three shipped in phase 1, 61 are planned, and one is excluded: `form`, whose registry item has no files.
- Batch rules:
  - **A**: no new npm dependencies and no new CSS.
  - **B**: needs `lucide-react`, shadcn's custom variants and utilities, or `tw-animate-css`, but no other library.
  - **C**: needs any other third-party library that its own file imports.
- An item whose dependency ships in a later batch is promoted into that batch. Only `item` is promoted, because it imports `separator`, which is in batch B.
- `code-block` ships in batch B (ticket 06) as a component only. Its own file needs only batch-B features and never imports the `use-highlighted-code` hook, although `shadcn add code-block` would also write the hook and add `shiki` (dry run, inventory). Whether to ship the hook is an open decision.
- The tickets form a single chain, from 01 to 20:
  - every ticket ships after the ones before it, and no component ships before a component it imports (checked by script);
  - the chain keeps the root entry, the package manifest and the changesets free of merge conflicts.
- Ticket size follows a rough guide: up to eight simple components or three heavy ones per ticket, such as overlays, menus or the sidebar. C tickets have one library each. The first B ticket carries only five components, because it also changes the stylesheet and the dependencies.
- Non-UI registry items are excluded: 30 blocks, 68 examples, 52 fonts, 2 styles, 1 demo component, and the `utils` lib, which `cn` replaces. The two hooks that UI items depend on are planned. `use-mobile` ships with the sidebar. `use-highlighted-code` and its highlighter lib ship with `code-block`.

**shadcn variants and utilities: vendor, do not depend**

- Copy the full contents of the shadcn package's Tailwind stylesheet into the package stylesheet, verbatim, under a comment that names the shadcn version.
- This is the same output as the CLI's own `eject` command. That command inlines the file under an "ejected from shadcn@version" comment and removes the shadcn dependency. Because the package never runs `init`, the content is copied, not ejected in place. It is the same file from the same pinned version.
- Why not depend on the `shadcn` package:
  - it is the CLI;
  - it has 32 runtime dependencies, including Babel, ts-morph and an MCP server;
  - it installs at about 70 MB.

  Consumers would install all of that to get about 640 lines of CSS.
- Why the whole file and not a hand-picked subset:
  - Batch B uses all nine custom variants, plus `no-scrollbar`, the scroll-fade family, shimmer and the accordion keyframes.
  - A subset would have to be re-picked on every CLI upgrade.
  - Tailwind emits keyframes only when they are used. The cost of unused rules is a few `@property` declarations.
- This is required, not cosmetic. In a Tailwind probe without the file, `data-horizontal:` compiled to a `data-horizontal` attribute selector. Base UI sets `data-orientation` instead, so orientation styles on Separator, Tabs, Slider and others would silently not apply.
- Upgrade path: when the shadcn CLI version changes, diff its Tailwind stylesheet against the vendored block, and update the block with the version comment.
- The existing licence file already carries shadcn's MIT notice. No new notice is needed.

**tw-animate-css: dependency plus import**

- Add `tw-animate-css` as a regular dependency, with its range set by the ranges rule below, and import it at the top of the package stylesheet.
- Order inside the package stylesheet: the `tw-animate-css` import comes first, then the vendored shadcn block, then the theme. Both files define the accordion keyframes, and the later definition wins. Only shadcn's version reads Base UI's accordion panel height. This matches the import order in the registry's own style item.
- The consumer's order does not change: Tailwind first, then the package stylesheet. tw-animate-css is pure CSS, has no peer dependencies, and is MIT.
- Unverified: whether the nested import resolves from the package's own folder under pnpm's strict layout with the Next.js PostCSS plugin. The first B ticket checks this. Fallback: if it does not resolve, vendor tw-animate-css the same way as the shadcn block, with its MIT notice added to the licence file.

**Dependencies: regular by default, peers only for shared context**

- Rule: package dependencies list exactly what the shipped source imports, with explicit ranges.
  - No `registry:ui` item declares `lucide-react`, and `shadcn add` never installs it; only the `registry:style` items do, for `shadcn init`. It also leaves out `@base-ui/react` and `class-variance-authority` for most items.
  - The registry over-declares `date-fns` for the calendar, which nothing imports.
  - The registry pins `react-day-picker@latest` and `recharts@3.8.0`.

  Every ticket reconciles the manifest with the actual imports and removes anything extra that the CLI added.
- `lucide-react` is a regular dependency. Its icons are leaf components with no shared context, and bundlers drop unused icons.
- Third-party libraries are regular dependencies, as Base UI was in phase 1. The root entry re-exports every component, so bundlers must be able to resolve every import. An optional peer that is reachable from the root entry would break builds for apps that did not install it.
- Exception: a library whose state the app also uses must be a peer dependency, so that the app and the package share one copy. That state can be React context or a module-level store.
  - `next-themes` is a peer for this reason. A second copy would make the Sonner Toaster read a theme provider the app never mounted.
  - `sonner` is a peer too. Apps call its `toast()` function directly, and that call must reach the same store as the package's Toaster.
- Rule for optional peers: an optional peer may only be imported by a module that is not re-exported from the root entry, and that module gets its own explicit subpath.
  - Sonner follows this rule, with `sonner` and `next-themes` as optional peers. The root cannot export it anyway, because Toast already exports `Toaster`.
  - If it ships (open decision), the code-highlighting hook (needs `shiki`) follows it too.
- Ranges: use the current minor for 0.x packages, following the `cn` precedent. For example, `@shadcn/react` is pinned to `~0.3.1`. Use a caret range for 1.x and later. For recharts, keep the upstream pin's minor (`~3.8.0`) until the chart is checked against a newer minor.
- Every library accepts React 19 (inventory, third-party table):
  - lucide-react, embla, input-otp, recharts, next-themes, react-day-picker and Base UI cover 16.8 or 17 up to 19;
  - cmdk, sonner and react-resizable-panels accept 18 or 19;
  - `@shadcn/react` needs React 19 or later.
- Known costs, accepted:
  - cmdk depends on Radix dialog primitives, so Radix comes in as a transitive dependency of Command only. Spec 1 says Radix is not used.
  - recharts has a required `react-is` peer, which npm and pnpm install automatically.
- Revisit Base UI as a peer in phase 2, as Spec 1 says. `direction` re-exports Base UI's direction provider, so its context only reaches components from the same Base UI copy.

**`"use client"`**

- Follow the upstream registry source exactly, with `rsc: true`. The CLI keeps the directives that the source has. Of the 61 new items, 39 have the directive and 22 do not (inventory).
- Maintainer decision (2026-11-06): new components only need to work in client components. Rendering them in server components is not a requirement and is not checked. Spec 1's server checks for Button, Input, Label and `buttonVariants()` stay in place.
- Recorded risk: seven files without the directive call Base UI's `useRender`. Those are attachment, badge, breadcrumb, bubble, button-group, item and marker. `useRender` reaches a React hook that the server build of React does not export, so these may fail if a server component renders them. The client-only decision covers this. Do not add directives that differ from upstream.

**Public API cost**

- Each new component file becomes a public subpath through the existing wildcard. That adds 61 subpaths. Every ticket lists the subpaths it adds, and renaming or removing any of them later is a breaking change.
- The root entry re-exports each new component and its prop types, with two exceptions:
  - Sonner is subpath-only, because `Toaster` collides with Toast. It is the only collision among the 390 exported names.
  - The code-highlighting hook gets its own explicit subpath (optional-peer rule). It does not go through the wildcard.
- Helper files that could leak:
  - The CLI writes hooks and libs outside the components folder, so the wildcard does not reach them.
  - The mobile-breakpoint hook stays internal. It is not re-exported from the root, because Sidebar is its only user.
  - The highlighter lib is reachable only through the hook's subpath.
- Every subpath-only module needs its own build entry. The build emits only modules reachable from the root entry: in a test build on 2026-11-06, a component file the root did not import was not emitted. The wildcard can only map to files the build emits. Today this applies to Sonner and the code-highlighting hook.
- `direction` re-exports two Base UI names. This ties that subpath to Base UI's API.

**Release cadence**

- One Changesets minor release per ticket, 20 in all, from the release after 0.1.1 onwards. 0.x minors may break, but these releases only add.
- Each ticket's changeset names the components it adds.
- The first B ticket's changeset also names the stylesheet change.
- Each C ticket's changeset names the new dependency or peer.

**Open decisions (need the maintainer)**

- Upstream quirk carried forward: a bare `buttonVariants()` call still emits the conflicting `border-transparent` and `border-border`. The outline Link border is missing in light mode. Many new components compose Button or `buttonVariants`, including pagination, calendar, carousel, dialog and sidebar, so the effect spreads. Decide once whether to patch locally or wait for upstream; until then, keep the source unchanged.
- Whether to ship Sonner at all. The CLI hides it in Base UI projects and points to Toast, and it brings a theme-library peer. It is planned last so that the decision can wait.
- Whether the seven directive-less `useRender` components need server support later.
- Whether to ship the code-highlighting hook and its optional `shiki` peer at all (ticket 20). Code Block ships without it.

## Testing Decisions

- There are still no automated tests. Phase 1's packed-tarball check in a scratch Next.js App Router app stays the seam, extended per batch.
- A good check tests what a consumer sees: the packed package installs and builds, and every new component renders styled and behaves in a browser.
- Each batch adds these steps to the manual pre-release check:
  1. Pack, install into the scratch app, and run a production build with no missing-module or peer warnings for the new dependencies.
  2. Render every new component from a client component page.
  3. Exercise each interactive component in the browser. Overlays and menus open and close with their animation. Toggles, checkboxes, radios, switches and tabs change state visibly. Orientation-aware components are checked in both orientations.
  4. Check light and dark themes for every new component.
  5. Check that each built file starts with `"use client"` only where its upstream source does.
  6. Check that the tarball holds only the allowed files, and that the root entry and each new subpath resolve.
  7. Check that `shadcn add <name> --diff` shows no upstream drift for the ticket's components.
- The first B ticket also confirms three things:
  1. The stylesheet's `tw-animate-css` import resolves in the scratch app installed with pnpm.
  2. The vendored shadcn variants compile to their `data-orientation` and `data-state` forms.
  3. The accordion keyframes come from shadcn's definition.
- C tickets confirm that the root entry builds in an app that has not installed any optional peer.
- Phase 1's risk acceptance still applies. A skipped check can ship a broken version, which is fixed by the next patch and a deprecation.

### Per-ticket release checklist

Every phase 1b ticket passes all of these, in addition to its own criteria:

1. The shadcn CLI `add` command pulls the ticket's components from the `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
2. The manifest's dependencies match what the package source actually imports, with every range set explicitly per the ranges rule. Any extra dependency the CLI adds is removed, and no runtime library is a dev dependency only.
3. Built files start with `"use client"` only where upstream's source does. The root entry does not.
4. The root entry re-exports the new components and their prop types, and each new component resolves from its own subpath.
5. A dry-run pack lists only allowed files: build output, the stylesheet, README, licence and the package manifest.
6. The packed tarball installs into the scratch Next.js App Router app, and a production build succeeds with no missing-module or peer warnings. A client component page renders every new component.
7. Every new component is checked in the browser in light mode and under the `.dark` class, with readable text. Interactive ones are operated with mouse and keyboard.
8. Phase 1's server-component checks still pass: Button, Input, Label and `buttonVariants()` on a link.
9. A changeset requests a minor release and names the components added.

## Out of Scope

- shadcn blocks and the `registry.json` registry (phase 2).
- Examples and the docs app (phase 4).
- Fonts and font variables.
- Server-component rendering of new components.
- Fixing upstream quirks, including the `buttonVariants` border conflict.
- Brand tokens.
- React 18 or Tailwind 3.
- Automated tests and visual regression.
- Making Base UI a peer dependency (phase 2).

## Further Notes

- Upstream moves fast. The registry had 65 UI items on 2026-11-06, including eight AI-chat items: attachment, bubble, message, message-scroller, questionnaire, marker, trace and code-block. Each ticket re-checks its components with `add --diff` against the CLI version it uses. If upstream adds an item, add a ticket to the end of the chain.
- `cn-toast` and `cn-input-otp` are class names in upstream source that nothing defines. Keep them as they are, unstyled.
- Still unverified (see the inventory):
  - nested `tw-animate-css` import resolution under pnpm with the Next.js PostCSS plugin;
  - server rendering of the seven directive-less `useRender` components;
  - whether a bundler resolves an optional peer through an unused subpath (expected not to).
