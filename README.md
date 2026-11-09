# @asif-sirajudeen/earth-ui

shadcn-based React components built on Base UI, shipped as a versioned package. It covers every component in shadcn's `base-nova` style.

## Install

```sh
pnpm add @asif-sirajudeen/earth-ui
```

Peer dependencies: `react` 19, `react-dom` 19 and `tailwindcss` 4.

## CSS setup

In your global stylesheet, import Tailwind **first**, then the package stylesheet:

```css
@import "tailwindcss";
@import "@asif-sirajudeen/earth-ui/styles.css";
```

The package stylesheet does not import Tailwind itself. It adds the theme tokens and tells Tailwind to scan the package's built components for classes.

## Usage

Import from the package root:

```tsx
import { Button, Input, Label } from "@asif-sirajudeen/earth-ui";

export function SignupForm() {
  return (
    <form className="grid gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
      <Button type="submit">Sign up</Button>
    </form>
  );
}
```

Or import one component from its subpath:

```tsx
import { Button } from "@asif-sirajudeen/earth-ui/button";
import { Input } from "@asif-sirajudeen/earth-ui/input";
import { Label } from "@asif-sirajudeen/earth-ui/label";
```

Style a link as a button with `buttonVariants`:

```tsx
import Link from "next/link";
import { buttonVariants } from "@asif-sirajudeen/earth-ui";

<Link href="/docs" className={buttonVariants({ variant: "outline" })}>
  Docs
</Link>;
```

## Optional subpaths

Two modules are not exported from the package root and need peer dependencies that you install yourself:

| Subpath | Exports | Install |
| --- | --- | --- |
| `@asif-sirajudeen/earth-ui/sonner` | Sonner's `Toaster` | `sonner` and `next-themes` |
| `@asif-sirajudeen/earth-ui/use-highlighted-code` | `useHighlightedCode` (syntax highlighting for Code Block) | `shiki` |

The root `Toaster` is Base UI Toast's. Use the Sonner one only if your app already uses sonner. Call `toast()` from your own `sonner` import, and mount the `next-themes` provider yourself.

## Dark mode

Dark styles apply under a `.dark` class on an ancestor, usually `<html>`. With [next-themes](https://github.com/pacocoursey/next-themes), use `attribute="class"` and add `suppressHydrationWarning` to `<html>`:

```tsx
import { ThemeProvider } from "next-themes";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class">{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

## Look up components with the CLI

The package ships an `earth-ui` command. It answers from the installed version and works offline. Every command prints JSON.

```sh
npx @asif-sirajudeen/earth-ui list
npx @asif-sirajudeen/earth-ui search modal --limit 5
npx @asif-sirajudeen/earth-ui docs dialog
npx @asif-sirajudeen/earth-ui source dialog
npx @asif-sirajudeen/earth-ui help
```

- `list` prints every component with its title, description and import path.
- `search <query>` ranks components by name, title, description and exported names.
- `docs <name>` prints the import path, exported parts, variants and dependencies. For components built on Base UI, it also prints the props tables from the Base UI docs that ship with the installed `@base-ui/react`.
- `source <name>` prints the component's TSX source. Read it to see how a component is built; import the component from the package, do not copy it. `@/` imports in the source name other earth-ui modules, such as `@/components/button`.
- `help` (or `--help`, `-h`) lists the commands with usage and an example.

In a project that has the package installed, `pnpm exec earth-ui` and `npm exec earth-ui` also work. Do not run `npx earth-ui` without the scope: that name belongs to a different npm package.

### For AI coding agents

Add this block to your project's `AGENTS.md` (or `CLAUDE.md`):

```md
## earth-ui

UI comes from the `@asif-sirajudeen/earth-ui` npm package. Do not copy component source and do not run `shadcn add`.
Before writing UI, run `npx @asif-sirajudeen/earth-ui search <need>`, then `npx @asif-sirajudeen/earth-ui docs <name>`.
Import from the `import` path that `docs` prints.
```

## Install with the shadcn CLI

The components are also published as a shadcn registry under the `@earth-ui` namespace. Use it to copy the source into your project instead of installing the npm package.

> The registry is not hosted yet. The URL below is a placeholder until it is.

1. Add the namespace to your `components.json`:

   ```json
   {
     "registries": {
       "@earth-ui": "https://<registry-host>/r/{name}.json"
     }
   }
   ```

2. Add components:

   ```sh
   npx shadcn@latest add @earth-ui/button
   ```

Every component depends on `@earth-ui/style`, which installs the first time you add one. It adds the theme tokens, the `dark` variant and the base layer to your CSS file, together with `tw-animate-css` and `shadcn/tailwind.css`.

To update a component, review the changes first, then overwrite your copy:

```sh
npx shadcn@latest add @earth-ui/button --diff
npx shadcn@latest add @earth-ui/button --overwrite
```

`--overwrite` replaces your local edits to that file.

Always use the `@earth-ui/` prefix. A bare name such as `button` installs the official shadcn component, not the Earth UI one.

## Credits and license

The components and theme are adapted from [shadcn/ui](https://ui.shadcn.com) (MIT, Copyright (c) 2023 shadcn) and are built on [Base UI](https://base-ui.com).

MIT. See [LICENSE](./LICENSE), which also keeps the shadcn/ui notice.
