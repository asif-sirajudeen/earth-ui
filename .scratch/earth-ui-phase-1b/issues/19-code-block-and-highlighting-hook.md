# 19 — Code block and highlighting hook

**What to build:** An app developer can show code with Code Block. If they want syntax highlighting, they can install shiki and use the code-highlighting hook from its own subpath. Apps that do not want highlighting never install or resolve shiki. Source: Spec 1b, `docs/specs/phase-1b-component-coverage.md`.

**Blocked by:** 18 — Message scroller and questionnaire

**Status:** ready-for-agent

- [ ] The shadcn CLI `add` command pulls code-block from shadcn's `base-nova` style; nothing is copied by hand. Afterwards, `add --diff` shows no drift.
- [ ] Dependencies: `shiki` is added as an optional peer dependency with a caret range on 4.6. It is also a dev dependency for local builds, and is kept out of regular dependencies. The highlighting hook and its highlighter lib come with Code Block, as the CLI writes them. Every range is set explicitly in the manifest, and no runtime library is a dev dependency only.
- [ ] Every built file for code-block starts with `"use client"`, as upstream's source does. The root entry does not.
- [ ] New public subpath: `/code-block`. The root entry re-exports the new components and their prop types. The ticket records that renaming or removing it is a breaking change.
- [ ] The hook has its own explicit subpath export, `/use-highlighted-code`, listed before the component wildcard. It is not re-exported from the root. Renaming it later is a breaking change.
- [ ] Neither the hook nor the highlighter lib has `"use client"`, as in upstream's source. The hook is called only from client components.
- [ ] The built hook and highlighter keep their shiki imports external. tsdown does not bundle shiki into them.
- [ ] A scratch app without shiki builds and renders Code Block from the root entry. A scratch app with shiki renders highlighted code through the hook, in both themes.
- [ ] Code Block's copy button and its horizontal and vertical scroll fades work.
- [ ] A dry-run pack still lists only allowed files: build output, the stylesheet, README, licence and the package manifest.
- [ ] The packed tarball installs into the scratch Next.js App Router app, and a production build succeeds with no missing-module or peer warnings. A client component page renders every new component.
- [ ] Every new component is checked in the browser in light mode and under the `.dark` class, with readable text. Interactive ones are operated with mouse and keyboard.
- [ ] Phase 1's server-component checks still pass: Button, Input, Label and `buttonVariants()` on a link.
- [ ] A changeset requests a minor release and names the components added.
