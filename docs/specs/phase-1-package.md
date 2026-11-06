# Spec 1: Publish the Earth UI package (phase 1)

Status: ready-for-agent
As of: 2026-11-06
Plan: [Earth UI Plan](https://claude.ai/artifact/G2EioWL8tqdYYbkos8c1fk)
Research: `docs/research/eds-npm-package-and-registry.md`

## Problem Statement

Teams that build UI with shadcn copy component source into each app. Each app then owns a fork. A bug fix, an accessibility patch or a design change made once never reaches the other apps. Each team must find the change and re-copy it by hand, so the apps drift apart.

As an app developer, I want the shared primitives to arrive as a dependency I can upgrade. As the design-system maintainer, I want to ship a fix once and know every app gets it with a version bump.

## Solution

Ship the shadcn-based primitives as one versioned, public npm package, `@<npm-username>/earth-ui`, under the maintainer's personal npm scope.

Phase 1 ships three primitives: Button, Input and Label. They are built on Base UI and come with a theme stylesheet that uses the shadcn default tokens. An app installs the package, imports one stylesheet, and uses the components. When the maintainer releases a fix, the app runs one upgrade command and gets the fix with no code change.

Releases run through Changesets. The first version, 0.1.0, is published by hand. Every later version is published from GitHub Actions through npm trusted publishing.

## User Stories

1. As an app developer, I want to install the design system with one package-manager command, so that I can start using it without copying files.
2. As an app developer, I want to import Button, Input and Label from the package root, so that one import line brings in what I need.
3. As an app developer, I want to import a single component from its own subpath, so that I can keep imports explicit when I prefer.
4. As an app developer, I want to import one stylesheet to get the theme and the component styles, so that I do not have to configure Tailwind content paths by hand.
5. As an app developer, I want the stylesheet to make Tailwind generate the utilities the components use, so that no component renders unstyled.
6. As an app developer, I want light and dark themes to work through the `.dark` class, so that I can switch themes with the tool I already use, such as next-themes.
7. As an app developer using the Next.js App Router, I want to use the components inside server components, so that I do not have to add `"use client"` wrappers myself.
8. As an app developer, I want TypeScript types for every component and its props, so that my editor shows variants and catches mistakes.
9. As an app developer, I want Button to offer the shadcn variants and sizes, so that I can express primary, secondary, destructive, outline, ghost and link actions.
10. As an app developer, I want to pass `className` to every component, so that I can make local layout adjustments without forking.
11. As an app developer, I want Input and Label to work together for accessible forms, so that each field has a programmatic label.
12. As an app developer, I want unused components to be dropped from my bundle, so that importing one component does not ship all of them.
13. As an app developer, I want the package to declare React and Tailwind as peer dependencies, so that my app keeps a single copy of each.
14. As an app developer, I want Base UI, class-variance-authority and `cn` installed automatically, so that I do not manage the package's internal helpers.
15. As an app developer, I want to upgrade with one command and get fixes with no code change, so that keeping up costs almost nothing.
16. As an app developer, I want a changelog for each release, so that I know what changed before I upgrade.
17. As an app developer, I want semver to signal breaking changes, so that I can trust minor and patch upgrades.
18. As an app developer, I want a README that shows install, the stylesheet import and a usage example, so that I can set up the package in minutes.
19. As an app developer, I want a clear install-time warning when my React or Tailwind version is unsupported, so that I learn about incompatibility before runtime.
20. As an app developer, I want a provenance badge on releases after 0.1.0, so that I can check that the package was built from the public repository.
21. As the maintainer, I want to copy primitives from shadcn's Base UI style with minimal edits, so that I can follow upstream improvements easily.
22. As the maintainer, I want each change to carry a changeset, so that versions and changelogs are generated, not written by hand.
23. As the maintainer, I want merges to main to open a "Version Packages" pull request, so that I can review the version bump and changelog before release.
24. As the maintainer, I want merging that pull request to publish to npm, so that releasing takes no manual steps after 0.1.0.
25. As the maintainer, I want CI to publish without a long-lived npm token, so that no publish secret can leak from the repository.
26. As the maintainer, I want to turn on "Require two-factor authentication and disallow tokens" after trusted publishing works, so that only CI and I can publish.
27. As the maintainer, I want a pre-release check against a packed tarball in a scratch Next.js app, so that I catch broken exports or missing styles before CI publishes.
28. As the maintainer, I want the build to emit one output file per source file, so that each component keeps its `"use client"` directive.
29. As the maintainer, I want to confirm that every built component file starts with `"use client"`, so that a bundler change cannot silently break App Router consumers.
30. As the maintainer, I want the repository to be a single package with no workspace tooling, so that phase 1 has the least setup to maintain.
31. As the maintainer, I want the licence file to keep shadcn's copyright notice next to mine, so that the package meets the MIT terms of the code it copies.
32. As the maintainer, I want `cn` pinned to its current minor, so that a 0.x release of `cn` cannot break consumers without my review.
33. As the maintainer, I want the theme to start from the shadcn defaults, so that phase 1 proves the delivery pipeline before branding work begins.
34. As the maintainer, I want a later brand-token release to be a normal minor version, so that it also tests the upgrade path for real.
35. As a reviewer at AnywhereWorks, I want to confirm the public release and the MIT licence before the first publish, so that company policy is met.

## Implementation Decisions

**Package identity and distribution**

- One public npm package, `@<npm-username>/earth-ui`, under the maintainer's personal npm scope. The npm username may differ from the GitHub username, so confirm it before the first publish.
- The licence is MIT. The licence file keeps shadcn's MIT copyright notice beside the maintainer's.
- The first version is 0.1.0. 0.x minor releases may contain breaking changes, as semver allows.
- The repository is a single package with no workspace and no Turborepo. It becomes a pnpm workspace in phase 2, when the docs app arrives.
- The repository is public on GitHub under the maintainer's personal account, so trusted publishing and provenance work.

**Components**

- Button, Input and Label, copied from shadcn's Base UI style (`base-nova`) with minimal edits.
- The components are built on Base UI (`@base-ui/react`), shadcn's default primitive library since July 2026. Radix is not used.
- Components use the `cn` package for class merging. `clsx` and `tailwind-merge` are not used.
- Components use the React 19 ref-as-prop pattern, with no `forwardRef`.

**Dependencies**

- Peer dependencies: `react ^19`, `react-dom ^19` and `tailwindcss ^4`.
- Regular dependencies: `@base-ui/react ^1.9.0`, `class-variance-authority`, and `cn` pinned to `~0.5.2`.
- Base UI's peer dependencies `date-fns` and `@date-fns/tz` are marked optional, so they do not reach consumers.
- Excluded: `lucide-react` and `tw-animate-css`. The three components render no icons and no animations. Add them only when a component needs them.
- Revisit Base UI as a peer dependency in phase 2, if registry blocks need to share one copy with the consuming app.

**Styles and theme**

- The package ships one stylesheet in its exports. Consumers import it from their main CSS file.
- The stylesheet holds the shadcn default `base-nova` tokens on `:root` and `.dark`. It maps them to Tailwind through `@theme inline`, declares the `.dark` custom variant, and declares an `@source` that points at the package's built output.
- The package ships no precompiled utility CSS. Tailwind in the consuming app generates the utilities.

**Public API (exports map)**

- Root entry: re-exports all components and their prop types.
- Subpath wildcard: each component is importable from its own subpath, such as `/button`. Every component file is public API, so renaming or splitting a component file is a breaking change.
- Stylesheet entry: the theme stylesheet.
- The package declares CSS files as its only side effects, so bundlers can drop unused components.

**Build**

- tsdown with `unbundle` mode, which gives one output file per source file. tsup is not used, because its README says it is no longer actively maintained.
- Output is ESM with TypeScript declaration files.
- Every component file and the root entry start with `"use client"`, because all three components are client components. This follows the Next.js advice to add the directive to library entry points.
- Fallback: if tsdown drops the directive in `unbundle` mode, add it to every output file with a build banner. tsdown's handling of directives in this mode is not documented (see the research file).

**Release**

- Changesets v3 handles versioning and changelogs. Every change to the package carries a changeset.
- `changesets/action` v2 runs on pushes to main. It opens a "Version Packages" pull request, and merging that pull request publishes to npm.
- Hybrid authentication, in this order:
  1. The maintainer publishes 0.1.0 from their machine with 2FA. This creates the package on npm.
  2. The maintainer pushes the repository to GitHub with the release workflow committed. npm requires the workflow file to exist before a trusted publisher can name it.
  3. The maintainer prepares the 0.1.1 change and its changeset on a branch.
  4. The maintainer adds a trusted publisher (GitHub Actions, this repository, the release workflow file) in the package's npm settings. This starts a 2-day window.
  5. The maintainer merges the 0.1.1 change and then the Version PR, so CI publishes 0.1.1 inside the window. Otherwise the configuration expires and must be recreated.
  6. The maintainer turns on "Require two-factor authentication and disallow tokens".
- The release workflow needs `id-token: write`, `contents: write` and `pull-requests: write`. It runs on a GitHub-hosted runner.
- The release workflow uses Node 24 LTS. Trusted publishing needs npm CLI 11.5.1 or later. Node 24.22.2 ships npm 11.19.1, but every Node 22 release ships npm 10.x.
- No `NPM_TOKEN` secret is stored in the repository.

## Testing Decisions

- No automated tests in phase 1. This was a deliberate scope decision.
- A good check tests what a consumer experiences: the packed package installs, builds and renders in a separate app. It does not test component internals, which are thin copies over Base UI.
- The one seam is the packed tarball consumed by a scratch Next.js App Router app outside the repository. It is not linked to the package source.
- Manual pre-release check, required before merging any "Version Packages" pull request:
  1. Build and pack the package.
  2. Install the tarball into the scratch app.
  3. Run a production build. A server component must render Button, Input and Label.
  4. Check that every Button variant is styled and that light and dark themes both work.
  5. Check that every built component file starts with `"use client"`.
- Phase 1 exit checks:
  1. A fresh Next.js app installs the published 0.1.0, imports the stylesheet, and renders all three components, styled, in light and dark themes.
  2. A visible Button fix released through CI as 0.1.1 reaches that app after one upgrade command, with no code change.
  3. The 0.1.1 release shows npm provenance.
- There is no prior test code in the repository.
- Risk accepted: CI publishes when the Version PR merges, so a skipped manual check can ship a broken public version.
  - npm never allows a published version number to be reused, even after an unpublish.
  - A broken release is fixed by publishing the next patch and deprecating the bad version.
  - Add an automated packed-tarball build check if this risk becomes real. The research file recommends one.

## Out of Scope

- The shadcn registry, `registry.json` and `shadcn build`.
- The CLI and MCP setup.
- The docs app.
- The conversion to a pnpm workspace.
- Components beyond Button, Input and Label.
- Earth or EDS brand tokens. Phase 1 uses the shadcn defaults.
- Support for React 18 or Tailwind 3.
- Automated tests and visual regression.
- Any change to the existing `@adaptavant/eds-core`.

## Further Notes

- **Needs internal review before the first publish.** Publishing company-related design-system code publicly, and licensing it as MIT, is an outward-facing and partly irreversible step. Confirm both with the AnywhereWorks security and legal teams before running the first `npm publish`.
- npm trusted publishing is set up in the package's own settings page, which implies that the package must exist first. The npm docs do not say this outright. That is why 0.1.0 is published by hand.
- The `cn` package is at 0.5.x. Review each `cn` minor release before widening the pin.
- Open assumptions carried from the research file:
  - tsdown's `"use client"` handling in `unbundle` mode is undocumented.
  - The rule that `@source` inside an imported package stylesheet resolves relative to that file is confirmed from Tailwind's source code only, not its docs.
  - The manual pre-release check covers both assumptions.
