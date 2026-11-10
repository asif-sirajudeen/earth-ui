# @asif-sirajudeen/earth-ui

## 0.4.0

### Minor Changes

- 3c0d4ad: Export `useIsMobile` from the new `@asif-sirajudeen/earth-ui/use-mobile` subpath.

### Patch Changes

- b26d625: Fix broken `earth-ui docs` links for hover-card, label and carousel, and add docs links for attachment, bubble, marker, message and message-scroller.

## 0.3.0

### Minor Changes

- 19948db: Add the `earth-ui` CLI: `list`, `search`, `docs` and `source` print JSON about the installed components, including Base UI props tables and each component's TSX source. Run it with `npx @asif-sirajudeen/earth-ui <command>`.

## 0.2.2

### Patch Changes

- aa5b983: Revert the temporary Button text weight change from 0.2.1. Button text uses `font-medium` again, matching upstream shadcn.

## 0.2.1

### Patch Changes

- f4e435b: Button text uses `font-semibold` instead of `font-medium`. This is a temporary change to test the CI release pipeline, and the next patch reverts it.

## 0.2.0

### Minor Changes

- 91b82c5: Add Calendar, exported from the package root with its prop types and from the `/calendar` subpath. New dependency: `react-day-picker`.
- 2acdae2: Add Carousel, exported from the package root with its prop types and from the `/carousel` subpath. New dependency: `embla-carousel-react`.
- 70ed327: Add Chart, exported from the package root with its prop types and from the `/chart` subpath. New dependency: `recharts` (`~3.8.0`, the upstream pin's minor).
- cc72e45: Add Code Block, exported from the package root with its prop types and from the `/code-block` subpath. It renders plain code with a copy button and scroll fades, and needs no syntax highlighter.
- ba39756: Add Command, exported from the package root with its prop types and from the `/command` subpath. New dependency: `cmdk`, which brings Radix dialog primitives in as transitive dependencies.
- 5e1c92d: Add Textarea, Input Group, Alert, Badge, Card, Kbd, Skeleton and Empty. Each is exported from the package root with its prop types and from its own subpath: `/textarea`, `/input-group`, `/alert`, `/badge`, `/card`, `/kbd`, `/skeleton`, `/empty`.
- 9c2df85: Add Avatar, Aspect Ratio, Progress, Table, Toggle and Collapsible. Each is exported from the package root with its prop types and from its own subpath: `/avatar`, `/aspect-ratio`, `/progress`, `/table`, `/toggle`, `/collapsible`.
- 39a5f21: Add Drawer, Direction, Bubble, Marker and Message. Each is exported from the package root with its prop types and from its own subpath: `/drawer`, `/direction`, `/bubble`, `/marker`, `/message`. `/direction` re-exports Base UI's `DirectionProvider` and `useDirection`.
- ab595c4: Add Popover, Tooltip and Hover Card. Each is exported from the package root with its prop types and from its own subpath: `/popover`, `/tooltip`, `/hover-card`.
- 35d5c4d: Add Slider, Native Select, Breadcrumb, Button Group, Item, Field, Pagination and Toggle Group. Each is exported from the package root with its prop types and from its own subpath: `/slider`, `/native-select`, `/breadcrumb`, `/button-group`, `/item`, `/field`, `/pagination`, `/toggle-group`.
- ad08e66: Add Separator, Spinner, Checkbox, Radio Group and Switch. Each is exported from the package root with its prop types and from its own subpath: `/separator`, `/spinner`, `/checkbox`, `/radio-group`, `/switch`.

  The stylesheet now imports `tw-animate-css` and includes shadcn's Tailwind variants and utilities (copied verbatim from shadcn@4.23.0), so orientation, state and animation classes work. The consumer's CSS setup does not change. New dependencies: `lucide-react` and `tw-animate-css`.

- 90a1ef9: Add Input OTP, exported from the package root with its prop types and from the `/input-otp` subpath. New dependency: `input-otp`.
- 8bf1ac6: Add Dropdown Menu, Context Menu and Menubar. Each is exported from the package root with its prop types and from its own subpath: `/dropdown-menu`, `/context-menu`, `/menubar`.
- 7384962: Add Message Scroller and Questionnaire. Each is exported from the package root with its prop types and from its own subpath: `/message-scroller`, `/questionnaire`. New dependency: `@shadcn/react`.
- 660cf03: Add Dialog, Alert Dialog and Sheet. Each is exported from the package root with its prop types and from its own subpath: `/dialog`, `/alert-dialog`, `/sheet`.
- 873f1e6: Add Resizable, exported from the package root with its prop types and from the `/resizable` subpath. New dependency: `react-resizable-panels`.
- b2da2c5: Add Select, Combobox and Navigation Menu. Each is exported from the package root with its prop types and from its own subpath: `/select`, `/combobox`, `/navigation-menu`.
- 25f776d: Add the Sonner Toaster on its own subpath, `/sonner`. It is not exported from the package root, where `Toaster` stays Toast's. New optional peer dependencies: `sonner` and `next-themes`. Install both only if you import `/sonner`, so your app's `toast()` calls and theme provider share one copy with the package.
- fe4aa27: Add Tabs, Scroll Area, Accordion, Attachment and Trace. Each is exported from the package root with its prop types and from its own subpath: `/tabs`, `/scroll-area`, `/accordion`, `/attachment`, `/trace`.
- f245ac3: Add Toast and Sidebar. Each is exported from the package root with its prop types and from its own subpath: `/toast`, `/sidebar`. The root `Toaster` is Toast's. Sidebar's mobile-breakpoint hook ships internally and is not part of the public API.
- d64e260: Add shadcn's code-highlighting hook, `useHighlightedCode`, on its own subpath, `/use-highlighted-code`. It is not exported from the package root. New optional peer dependency: `shiki`. Install it only if you import the hook; apps without it never resolve shiki.
