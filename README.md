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

## Credits and license

The components and theme are adapted from [shadcn/ui](https://ui.shadcn.com) (MIT, Copyright (c) 2023 shadcn) and are built on [Base UI](https://base-ui.com).

MIT. See [LICENSE](./LICENSE), which also keeps the shadcn/ui notice.
