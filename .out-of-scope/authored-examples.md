# Hand-authored examples

earth-ui does not write its own docs-site examples. Every example is copied from shadcn's `apps/v4/examples/base` by the examples sync script, with only its imports rewritten to the package.

## Why this is out of scope

`CONTEXT.md` defines an **Example** as a usage file "copied from shadcn's examples" that imports from the package, so the code a reader sees is the code a consumer writes. That definition is what keeps examples cheap to maintain: re-syncing to a new shadcn version refreshes all of them, and no example drifts because someone edited it by hand.

Writing our own demos for components whose upstream demos we skip would:

- create a second class of example that the sync can't update, and that nobody notices going stale after an upgrade
- pull app-level dependencies into the docs site just to render a preview (`ai`, `@ai-sdk/react`, `streamdown`, `@tabler/icons-react`, `zod`)

A component without a `-demo` example still gets a docs page built from the examples that do sync, plus its API from the `earth-ui docs` CLI.

When an upstream demo becomes syncable (for example, when a missing export is added, as `use-mobile` unblocks `drawer-demo`), fix the export or add a `MAPPED` rule in the sync script instead of hand-writing the example.

## Prior requests

- #19: "Docs: 7 components have no -demo example"
