---
"@asif-sirajudeen/earth-ui": minor
---

CLI fixes from the stress test:

- New `earth-ui setup` command. It prints the CSS import lines, the dark-mode rule, providers and mounted elements, and optional peer dependencies.
- New `earth-ui examples <name>` command. It returns the synced Examples, `-demo` first, each with the non-package modules it imports.
- `docs` changes:
  - `props` is now structured as `{ parts, baseUi }` and covers every component, including hooks and third-party wrappers.
  - HTML entities are decoded.
  - `--full` adds the complete Base UI reference as `reference`.
  - New `install` field lists the optional peer dependencies you must add.
  - `variants` now lists every string-literal-union prop, not only CVA ones.
- `search` changes:
  - It returns `topics` that point to `setup` and the `render` convention.
  - It adds a `hint` when nothing matches.
- `help` documents every `docs` field (`fields`) and states the `render` (no `asChild`) convention (`conventions`). At a terminal it prints readable text. When piped, or with `--json`, it prints JSON.
- `source` changes:
  - It adds `importNote`.
  - `--raw` prints plain TSX.
- JSON output prints each innermost object on one line.
