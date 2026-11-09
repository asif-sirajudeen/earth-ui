// Authored metadata per registry item, keyed by item name (the file basename in src/components or src/hooks).
// Everything else (type, files, dependencies) is derived by scripts/build-registry.mts.
// A component or hook without an entry here fails the build.
import type { ItemMetadata } from "../scripts/registry-items.mts"

export const metadata: Record<string, ItemMetadata> = {
  accordion: {
    title: "Accordion",
    description:
      "Vertically stacked headings that each expand to reveal a section of content.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/accordion",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/accordion-example.tsx",
        api: "https://base-ui.com/react/components/accordion.md",
      },
    },
  },
  "alert-dialog": {
    title: "Alert Dialog",
    description:
      "Modal dialog that interrupts the user and asks them to confirm an important action.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/alert-dialog",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/alert-dialog-example.tsx",
        api: "https://base-ui.com/react/components/alert-dialog.md",
      },
    },
  },
  alert: {
    title: "Alert",
    description: "Callout that draws attention to a short, important message.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/alert",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/alert-example.tsx",
      },
    },
  },
  "aspect-ratio": {
    title: "Aspect Ratio",
    description: "Keeps content at a fixed width-to-height ratio.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/aspect-ratio",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/aspect-ratio-example.tsx",
      },
    },
  },
  attachment: {
    title: "Attachment",
    description:
      "File or media attachment card with a preview, title, description and actions.",
  },
  avatar: {
    title: "Avatar",
    description: "User image with a text fallback.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/avatar",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/avatar-example.tsx",
        api: "https://base-ui.com/react/components/avatar.md",
      },
    },
  },
  badge: {
    title: "Badge",
    description: "Small label for a status, count or category.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/badge",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/badge-example.tsx",
      },
    },
  },
  breadcrumb: {
    title: "Breadcrumb",
    description: "Shows the path to the current page in a hierarchy of links.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/breadcrumb",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/breadcrumb-example.tsx",
      },
    },
  },
  bubble: {
    title: "Bubble",
    description: "Chat bubble with grouped messages and reactions.",
  },
  "button-group": {
    title: "Button Group",
    description: "Groups related buttons into one connected control.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/button-group",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/button-group-example.tsx",
      },
    },
  },
  button: {
    title: "Button",
    description:
      "Button with variants and sizes, or a component that looks like a button.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/button",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/button-example.tsx",
      },
    },
  },
  calendar: {
    title: "Calendar",
    description: "Date picker grid built on React DayPicker.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/calendar",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/calendar-example.tsx",
        api: "https://react-day-picker.js.org",
      },
    },
  },
  card: {
    title: "Card",
    description: "Container with a header, content and footer.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/card",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/card-example.tsx",
      },
    },
  },
  carousel: {
    title: "Carousel",
    description: "Swipeable slide carousel built on Embla.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/carousel",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/carousel-example.tsx",
        api: "https://www.embla-carousel.com/get-started/react",
      },
    },
  },
  chart: {
    title: "Chart",
    description:
      "Recharts wrapper with theme-aware colors, tooltips and legends.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/chart",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/chart-example.tsx",
      },
    },
  },
  checkbox: {
    title: "Checkbox",
    description: "Control that toggles between checked and unchecked.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/checkbox",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/checkbox-example.tsx",
        api: "https://base-ui.com/react/components/checkbox.md",
      },
    },
  },
  "code-block": {
    title: "Code Block",
    description:
      "Code display with a header, title, copy button and syntax highlighting.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/code-block",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/code-block-example.tsx",
      },
    },
  },
  collapsible: {
    title: "Collapsible",
    description: "Panel that expands and collapses its content.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/collapsible",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/collapsible-example.tsx",
        api: "https://base-ui.com/react/components/collapsible.md",
      },
    },
  },
  combobox: {
    title: "Combobox",
    description: "Input with a filterable list of suggestions.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/combobox",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/combobox-example.tsx",
        api: "https://base-ui.com/react/components/combobox.md",
      },
    },
  },
  command: {
    title: "Command",
    description:
      "Command menu with search, groups and keyboard navigation, built on cmdk.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/command",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/command-example.tsx",
        api: "https://github.com/dip/cmdk",
      },
    },
  },
  "context-menu": {
    title: "Context Menu",
    description: "Menu that opens on right-click or long press.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/context-menu",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/context-menu-example.tsx",
        api: "https://base-ui.com/react/components/context-menu.md",
      },
    },
  },
  dialog: {
    title: "Dialog",
    description: "Modal window over the page, for focused tasks.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/dialog",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/dialog-example.tsx",
        api: "https://base-ui.com/react/components/dialog.md",
      },
    },
  },
  direction: {
    title: "Direction",
    description:
      "Provides left-to-right or right-to-left direction to its subtree.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/direction",
        api: "https://base-ui.com/react/utils/direction-provider.md",
      },
    },
  },
  drawer: {
    title: "Drawer",
    description: "Panel that slides in from the edge of the screen.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/drawer",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/drawer-example.tsx",
        api: "https://base-ui.com/react/components/drawer.md",
      },
    },
  },
  "dropdown-menu": {
    title: "Dropdown Menu",
    description: "Menu of actions or options opened from a trigger.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/dropdown-menu",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/dropdown-menu-example.tsx",
        api: "https://base-ui.com/react/components/menu.md",
      },
    },
  },
  empty: {
    title: "Empty",
    description: "Empty state with an icon, title, description and actions.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/empty",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/empty-example.tsx",
      },
    },
  },
  field: {
    title: "Field",
    description: "Form field layout with label, description and error message.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/field",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/field-example.tsx",
      },
    },
  },
  "hover-card": {
    title: "Hover Card",
    description: "Preview card shown when hovering over a link.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/hover-card",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/hover-card-example.tsx",
        api: "https://base-ui.com/react/components/hover-card.md",
      },
    },
  },
  "input-group": {
    title: "Input Group",
    description: "Input with inline addons such as icons, text or buttons.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/input-group",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/input-group-example.tsx",
      },
    },
  },
  "input-otp": {
    title: "Input OTP",
    description: "One-time password input with separate character slots.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/input-otp",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/input-otp-example.tsx",
        api: "https://input-otp.rodz.dev",
      },
    },
  },
  input: {
    title: "Input",
    description: "Text input field.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/input",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/input-example.tsx",
      },
    },
  },
  item: {
    title: "Item",
    description: "Flexible list row with media, content and actions.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/item",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/item-example.tsx",
      },
    },
  },
  kbd: {
    title: "Kbd",
    description: "Displays a keyboard key or shortcut.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/kbd",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/kbd-example.tsx",
      },
    },
  },
  label: {
    title: "Label",
    description: "Accessible label for a form control.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/label",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/label-example.tsx",
        api: "https://base-ui.com/react/components/label.md",
      },
    },
  },
  marker: {
    title: "Marker",
    description: "Inline marker with an icon and content, for annotating text.",
  },
  menubar: {
    title: "Menubar",
    description: "Horizontal menu bar of dropdown menus, like a desktop app.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/menubar",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/menubar-example.tsx",
        api: "https://base-ui.com/react/components/menubar.md",
      },
    },
  },
  "message-scroller": {
    title: "Message Scroller",
    description:
      "Scroll container for a message list that keeps the newest message in view.",
  },
  message: {
    title: "Message",
    description: "Chat message with avatar, header, content and footer.",
  },
  "native-select": {
    title: "Native Select",
    description: "Styled native HTML select element.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/native-select",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/native-select-example.tsx",
      },
    },
  },
  "navigation-menu": {
    title: "Navigation Menu",
    description: "Site navigation links with dropdown panels.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/navigation-menu",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/navigation-menu-example.tsx",
        api: "https://base-ui.com/react/components/navigation-menu.md",
      },
    },
  },
  pagination: {
    title: "Pagination",
    description: "Page navigation with previous, next and page links.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/pagination",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/pagination-example.tsx",
      },
    },
  },
  popover: {
    title: "Popover",
    description: "Floating panel anchored to a trigger.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/popover",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/popover-example.tsx",
        api: "https://base-ui.com/react/components/popover.md",
      },
    },
  },
  progress: {
    title: "Progress",
    description: "Bar that shows how far a task has progressed.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/progress",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/progress-example.tsx",
        api: "https://base-ui.com/react/components/progress.md",
      },
    },
  },
  questionnaire: {
    title: "Questionnaire",
    description:
      "Step-by-step questions with choices and a progress indicator.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/questionnaire",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/questionnaire-example.tsx",
      },
    },
  },
  "radio-group": {
    title: "Radio Group",
    description: "Set of options where only one can be selected.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/radio-group",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/radio-group-example.tsx",
        api: "https://base-ui.com/react/components/radio-group.md",
      },
    },
  },
  resizable: {
    title: "Resizable",
    description: "Panel groups with draggable resize handles.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/resizable",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/resizable-example.tsx",
        api: "https://github.com/bvaughn/react-resizable-panels",
      },
    },
  },
  "scroll-area": {
    title: "Scroll Area",
    description: "Scroll container with custom scrollbars.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/scroll-area",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/scroll-area-example.tsx",
        api: "https://base-ui.com/react/components/scroll-area.md",
      },
    },
  },
  select: {
    title: "Select",
    description: "Dropdown for choosing one option from a list.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/select",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/select-example.tsx",
        api: "https://base-ui.com/react/components/select.md",
      },
    },
  },
  separator: {
    title: "Separator",
    description: "Horizontal or vertical divider line.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/separator",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/separator-example.tsx",
        api: "https://base-ui.com/react/components/separator.md",
      },
    },
  },
  sheet: {
    title: "Sheet",
    description: "Dialog that slides in from a side of the screen.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/sheet",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/sheet-example.tsx",
        api: "https://base-ui.com/react/components/dialog.md",
      },
    },
  },
  sidebar: {
    title: "Sidebar",
    description:
      "Collapsible app sidebar with groups, menus and a mobile sheet.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/sidebar",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/sidebar-example.tsx",
      },
    },
  },
  skeleton: {
    title: "Skeleton",
    description: "Placeholder shown while content loads.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/skeleton",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/skeleton-example.tsx",
      },
    },
  },
  slider: {
    title: "Slider",
    description: "Control for choosing a value or range by dragging.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/slider",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/slider-example.tsx",
        api: "https://base-ui.com/react/components/slider.md",
      },
    },
  },
  sonner: {
    title: "Sonner",
    description: "Themed toast notifications built on Sonner.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/sonner",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/sonner-example.tsx",
        api: "https://sonner.emilkowal.ski",
      },
    },
  },
  spinner: {
    title: "Spinner",
    description: "Animated loading indicator.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/spinner",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/spinner-example.tsx",
      },
    },
  },
  switch: {
    title: "Switch",
    description: "Toggle between on and off.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/switch",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/switch-example.tsx",
        api: "https://base-ui.com/react/components/switch.md",
      },
    },
  },
  table: {
    title: "Table",
    description: "Styled HTML table with header, body, footer and caption.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/table",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/table-example.tsx",
      },
    },
  },
  tabs: {
    title: "Tabs",
    description: "Switches between panels of content in the same place.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/tabs",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/tabs-example.tsx",
        api: "https://base-ui.com/react/components/tabs.md",
      },
    },
  },
  textarea: {
    title: "Textarea",
    description: "Multi-line text input.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/textarea",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/textarea-example.tsx",
      },
    },
  },
  toast: {
    title: "Toast",
    description: "Temporary notification built on Base UI Toast.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/toast",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/toast-example.tsx",
        api: "https://base-ui.com/react/components/toast.md",
      },
    },
  },
  "toggle-group": {
    title: "Toggle Group",
    description: "Set of toggle buttons where one or several can be on.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/toggle-group",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/toggle-group-example.tsx",
        api: "https://base-ui.com/react/components/toggle-group.md",
      },
    },
  },
  toggle: {
    title: "Toggle",
    description: "Two-state button that can be on or off.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/toggle",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/toggle-example.tsx",
        api: "https://base-ui.com/react/components/toggle.md",
      },
    },
  },
  tooltip: {
    title: "Tooltip",
    description: "Short label shown on hover or focus.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/tooltip",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/tooltip-example.tsx",
        api: "https://base-ui.com/react/components/tooltip.md",
      },
    },
  },
  trace: {
    title: "Trace",
    description:
      "Timeline of steps with icons, titles, descriptions and collapsible details.",
    meta: {
      links: {
        docs: "https://ui.shadcn.com/docs/components/base/trace",
        examples:
          "https://ui.shadcn.com/code/apps/v4/registry/bases/base/examples/trace-example.tsx",
      },
    },
  },
  "use-highlighted-code": {
    title: "useHighlightedCode",
    description:
      "Hook that highlights code with Shiki, loading languages and themes on demand.",
  },
  "use-mobile": {
    title: "useIsMobile",
    description:
      "Hook that reports whether the viewport is below the mobile breakpoint.",
  },
}
