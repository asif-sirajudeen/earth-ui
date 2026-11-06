---
"@asif-sirajudeen/earth-ui": minor
---

Add the Sonner Toaster on its own subpath, `/sonner`. It is not exported from the package root, where `Toaster` stays Toast's. New optional peer dependencies: `sonner` and `next-themes`. Install both only if you import `/sonner`, so your app's `toast()` calls and theme provider share one copy with the package.
