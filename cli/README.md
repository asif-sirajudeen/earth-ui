## earth-ui

UI components come from the `@asif-sirajudeen/earth-ui` npm package. Import them from the package. Do not copy component source into the project and do not run `shadcn add`.

Look components up with the `earth-ui` CLI before you write UI. It reads the installed version and works offline. Every command prints JSON, except `source --raw`, and `help` at a terminal, which prints text (`--json` forces JSON).

```sh
npx @asif-sirajudeen/earth-ui search <need>     # find components, e.g. search modal
npx @asif-sirajudeen/earth-ui docs <name>       # import path, parts, variants, props
npx @asif-sirajudeen/earth-ui examples <name>   # runnable Examples, the -demo first
npx @asif-sirajudeen/earth-ui source <name>     # TSX source (add --raw for plain text)
npx @asif-sirajudeen/earth-ui setup             # CSS imports, dark mode, providers, optional peers
npx @asif-sirajudeen/earth-ui list              # every component
npx @asif-sirajudeen/earth-ui help              # all commands
```

Steps:

0. Run `setup` once per project. Parts compose with `render={<Element />}`; there is no `asChild`.
1. Run `search` with what you need. Pick the best match.
2. Run `docs <name>`. Use its `import` path and its `exports` (the parts). Use only the `variants` it lists. Use `props` for the props of each part: `props.parts` has the props each part adds, `props.baseUi` the Base UI props. Add `--full` for the complete Base UI reference. `help` explains every `docs` field.
3. Run `source <name>` only to see how a component is built.

Always use the scoped command `npx @asif-sirajudeen/earth-ui`. The unscoped `npx earth-ui` runs a different npm package.
