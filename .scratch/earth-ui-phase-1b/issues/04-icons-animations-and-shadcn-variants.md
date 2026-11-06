# 04 — Icons, animations and shadcn variants arrive

**What to build:** The package gains what batch B needs: `lucide-react` icons, `tw-animate-css` animations and shadcn's custom Tailwind variants and utilities, without depending on the shadcn CLI. Separator, Spinner, Checkbox, Radio Group and Switch ship as the first components that use them. This ticket is small on purpose, because it also changes the stylesheet. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 03 — Drawer, direction and chat basics

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls separator, spinner, checkbox, radio-group, switch from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [ ] Dependencies: `lucide-react` (caret range on the current 1.x) and `tw-animate-css` (caret range on 1.4) are added as regular dependencies. Nothing else is added, and `shadcn` is not a dependency. Every range is set explicitly in the manifest, and no runtime library is a dev dependency only.
- [ ] Built files start with `"use client"` only where upstream's source does: separator, checkbox, radio-group, switch have it; spinner does not. The root entry does not.
- [ ] New public subpaths: `/separator`, `/spinner`, `/checkbox`, `/radio-group`, `/switch`. The root entry re-exports the new components and their prop types. The ticket records that renaming or removing any of them is a breaking change.
- [ ] The stylesheet imports `tw-animate-css` first, then holds the full shadcn Tailwind stylesheet from the pinned CLI version, copied verbatim under a comment that names that version (the same output as `shadcn eject`), then the existing theme. `shadcn init` and `shadcn eject` are not run in the package.
- [ ] The licence file keeps shadcn's MIT notice. No new notice is needed for a dependency.
- [ ] In the scratch app installed with pnpm, the nested `tw-animate-css` import resolves from the package's own folder with the Next.js PostCSS plugin. If it does not, `tw-animate-css` is vendored like the shadcn block, its MIT notice is added, and the spec is updated.
- [ ] The compiled CSS shows the shadcn variants in their real forms: horizontal and vertical match the `data-orientation` attribute, and checked and unchecked match Base UI's attributes.
- [ ] Separator renders in both orientations. Checkbox shows its check icon. Radio Group and Switch change state visibly. Spinner spins.
- [ ] Phase 1 components look the same as before the stylesheet change, in both themes.
- [ ] A dry-run pack still lists only allowed files: build output, the stylesheet, README, licence and the package manifest.
- [ ] The packed tarball installs into the scratch Next.js App Router app, and a production build succeeds with no missing-module or peer warnings. A client component page renders every new component.
- [ ] Every new component is checked in the browser in light mode and under the `.dark` class, with readable text. Interactive ones are operated with mouse and keyboard.
- [ ] Phase 1's server-component checks still pass: Button, Input, Label and `buttonVariants()` on a link.
- [ ] A changeset requests a minor release and names the components added and the stylesheet and dependency changes.
