---
"@asif-sirajudeen/earth-ui": minor
---

Add shadcn's code-highlighting hook, `useHighlightedCode`, on its own subpath, `/use-highlighted-code`. It is not exported from the package root. New optional peer dependency: `shiki`. Install it only if you import the hook; apps without it never resolve shiki.
