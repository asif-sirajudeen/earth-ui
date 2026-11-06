# 04 — Icons, animations and shadcn variants arrive

**What to build:** The package gains what batch B needs: `lucide-react` icons, `tw-animate-css` animations and shadcn's custom Tailwind variants and utilities, without depending on the shadcn CLI. Separator, Spinner, Checkbox, Radio Group and Switch ship as the first components that use them. This ticket is small on purpose, because it also changes the stylesheet. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 03 — Drawer, right-to-left direction and chat message parts join the package

**Status:** code done (commits ad08e66, 730b3bb); scratch-app browser check pending (batch B); unchecked items need it.

- [x] The shadcn CLI `add` command pulls separator, spinner, checkbox, radio-group, switch from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift for each.
- [x] Dependencies: `lucide-react` and `tw-animate-css` are added as regular dependencies, with the range that the spec's ranges rule gives. Nothing else is added, and `shadcn` is not a dependency.
- [x] Built files start with `"use client"` only where upstream's source does: separator, checkbox, radio-group, switch have it; spinner does not. The root entry does not.
- [x] New public subpaths: `/separator`, `/spinner`, `/checkbox`, `/radio-group`, `/switch`. The root entry re-exports the new components and their prop types.
- [x] The stylesheet imports `tw-animate-css` first, then holds the full shadcn Tailwind stylesheet from the pinned CLI version, copied verbatim under a comment that names that version (the same output as `shadcn eject`), then the existing theme. `shadcn init` and `shadcn eject` are not run in the package.
- [x] The licence file keeps shadcn's MIT notice. No new notice is needed for a dependency.
- [ ] In the scratch app installed with pnpm, the nested `tw-animate-css` import resolves from the package's own folder with the Next.js PostCSS plugin. If it does not, `tw-animate-css` is vendored like the shadcn block, its MIT notice is added, and the spec is updated.
- [x] The compiled CSS shows the shadcn variants in their real forms: horizontal and vertical match the `data-orientation` attribute, and checked and unchecked match Base UI's attributes.
- [ ] Separator renders in both orientations. Checkbox shows its check icon. Radio Group and Switch change state visibly. Spinner spins.
- [ ] Phase 1 components look the same as before the stylesheet change, in both themes.
- [ ] Spec 1b's per-ticket release checklist passes (Testing Decisions).
