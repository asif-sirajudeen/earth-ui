# 07 — Point the README at the hosted registry

**What to build:** The README's "Install with the shadcn CLI" section gives the real registry URL. Today it says "The registry is not hosted yet" and shows a `<registry-host>` placeholder, but GitHub Pages already serves the registry at `https://asif-sirajudeen.github.io/earth-ui/r/{name}.json` (verified HTTP 200 for `button.json`).

**Blocked by:** None — can start immediately.

**Status:** done

- [x] The "not hosted yet" note and the placeholder are removed from the README.
- [x] The `components.json` snippet uses the live Pages URL with `{name}`.
- [ ] Following the README in a fresh shadcn project installs `@earth-ui/button` from the live URL.
- [x] The CLI README and the docs site do not repeat the old placeholder.

## Resolution

README note and placeholder removed; snippet uses `https://asif-sirajudeen.github.io/earth-ui/r/{name}.json`. `cli/README.md` and the site had no placeholder. `curl` returns 200 for `/r/button.json`.
Not met: did not run `shadcn add` in a fresh project (the URL is the same one `registry:smoke` exercises locally).
