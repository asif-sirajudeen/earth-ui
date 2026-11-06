---
"@asif-sirajudeen/earth-ui": minor
---

Add Separator, Spinner, Checkbox, Radio Group and Switch. Each is exported from the package root with its prop types and from its own subpath: `/separator`, `/spinner`, `/checkbox`, `/radio-group`, `/switch`.

The stylesheet now imports `tw-animate-css` and includes shadcn's Tailwind variants and utilities (copied verbatim from shadcn@4.23.0), so orientation, state and animation classes work. The consumer's CSS setup does not change. New dependencies: `lucide-react` and `tw-animate-css`.
