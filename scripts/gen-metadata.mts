// One-off migration that created registry/metadata.ts. Kept for provenance; registry/metadata.ts is now
// hand-edited and is the source of truth.
//
// Titles and descriptions are written below. meta.links were copied from the earlier hand-written item list,
// registry/registry-ui.ts, which is not in the repo (it was in `git stash` "On main: registry"). To rerun:
//   git show 'stash@{0}:registry/registry-ui.ts' > registry/registry-ui.ts
//   node scripts/gen-metadata.mts --force
// --force overwrites registry/metadata.ts, including any edits made since.
import { existsSync, writeFileSync } from "node:fs";

if (existsSync("registry/metadata.ts") && !process.argv.includes("--force")) {
  throw new Error("registry/metadata.ts exists and is hand-edited; pass --force to overwrite it");
}
if (!existsSync("registry/registry-ui.ts")) {
  throw new Error("registry/registry-ui.ts not found; restore it from the stash (see the header of this file)");
}
const { ui } = await import(process.cwd() + "/registry/registry-ui.ts");
const d: Record<string, [string, string]> = {
  accordion: ["Accordion", "Vertically stacked headings that each expand to reveal a section of content."],
  "alert-dialog": ["Alert Dialog", "Modal dialog that interrupts the user and asks them to confirm an important action."],
  alert: ["Alert", "Callout that draws attention to a short, important message."],
  "aspect-ratio": ["Aspect Ratio", "Keeps content at a fixed width-to-height ratio."],
  attachment: ["Attachment", "File or media attachment card with a preview, title, description and actions."],
  avatar: ["Avatar", "User image with a text fallback."],
  badge: ["Badge", "Small label for a status, count or category."],
  breadcrumb: ["Breadcrumb", "Shows the path to the current page in a hierarchy of links."],
  bubble: ["Bubble", "Chat bubble with grouped messages and reactions."],
  "button-group": ["Button Group", "Groups related buttons into one connected control."],
  button: ["Button", "Button with variants and sizes, or a component that looks like a button."],
  calendar: ["Calendar", "Date picker grid built on React DayPicker."],
  card: ["Card", "Container with a header, content and footer."],
  carousel: ["Carousel", "Swipeable slide carousel built on Embla."],
  chart: ["Chart", "Recharts wrapper with theme-aware colors, tooltips and legends."],
  checkbox: ["Checkbox", "Control that toggles between checked and unchecked."],
  "code-block": ["Code Block", "Code display with a header, title, copy button and syntax highlighting."],
  collapsible: ["Collapsible", "Panel that expands and collapses its content."],
  combobox: ["Combobox", "Input with a filterable list of suggestions."],
  command: ["Command", "Command menu with search, groups and keyboard navigation, built on cmdk."],
  "context-menu": ["Context Menu", "Menu that opens on right-click or long press."],
  dialog: ["Dialog", "Modal window over the page, for focused tasks."],
  direction: ["Direction", "Provides left-to-right or right-to-left direction to its subtree."],
  drawer: ["Drawer", "Panel that slides in from the edge of the screen."],
  "dropdown-menu": ["Dropdown Menu", "Menu of actions or options opened from a trigger."],
  empty: ["Empty", "Empty state with an icon, title, description and actions."],
  field: ["Field", "Form field layout with label, description and error message."],
  "hover-card": ["Hover Card", "Preview card shown when hovering over a link."],
  "input-group": ["Input Group", "Input with inline addons such as icons, text or buttons."],
  "input-otp": ["Input OTP", "One-time password input with separate character slots."],
  input: ["Input", "Text input field."],
  item: ["Item", "Flexible list row with media, content and actions."],
  kbd: ["Kbd", "Displays a keyboard key or shortcut."],
  label: ["Label", "Accessible label for a form control."],
  marker: ["Marker", "Inline marker with an icon and content, for annotating text."],
  menubar: ["Menubar", "Horizontal menu bar of dropdown menus, like a desktop app."],
  "message-scroller": ["Message Scroller", "Scroll container for a message list that keeps the newest message in view."],
  message: ["Message", "Chat message with avatar, header, content and footer."],
  "native-select": ["Native Select", "Styled native HTML select element."],
  "navigation-menu": ["Navigation Menu", "Site navigation links with dropdown panels."],
  pagination: ["Pagination", "Page navigation with previous, next and page links."],
  popover: ["Popover", "Floating panel anchored to a trigger."],
  progress: ["Progress", "Bar that shows how far a task has progressed."],
  questionnaire: ["Questionnaire", "Step-by-step questions with choices and a progress indicator."],
  "radio-group": ["Radio Group", "Set of options where only one can be selected."],
  resizable: ["Resizable", "Panel groups with draggable resize handles."],
  "scroll-area": ["Scroll Area", "Scroll container with custom scrollbars."],
  select: ["Select", "Dropdown for choosing one option from a list."],
  separator: ["Separator", "Horizontal or vertical divider line."],
  sheet: ["Sheet", "Dialog that slides in from a side of the screen."],
  sidebar: ["Sidebar", "Collapsible app sidebar with groups, menus and a mobile sheet."],
  skeleton: ["Skeleton", "Placeholder shown while content loads."],
  slider: ["Slider", "Control for choosing a value or range by dragging."],
  sonner: ["Sonner", "Themed toast notifications built on Sonner."],
  spinner: ["Spinner", "Animated loading indicator."],
  switch: ["Switch", "Toggle between on and off."],
  table: ["Table", "Styled HTML table with header, body, footer and caption."],
  tabs: ["Tabs", "Switches between panels of content in the same place."],
  textarea: ["Textarea", "Multi-line text input."],
  toast: ["Toast", "Temporary notification built on Base UI Toast."],
  "toggle-group": ["Toggle Group", "Set of toggle buttons where one or several can be on."],
  toggle: ["Toggle", "Two-state button that can be on or off."],
  tooltip: ["Tooltip", "Short label shown on hover or focus."],
  trace: ["Trace", "Timeline of steps with icons, titles, descriptions and collapsible details."],
  "use-highlighted-code": ["useHighlightedCode", "Hook that highlights code with Shiki, loading languages and themes on demand."],
  "use-mobile": ["useIsMobile", "Hook that reports whether the viewport is below the mobile breakpoint."],
};
const links = new Map<string, { links?: Record<string, string> } | undefined>(ui.map((i: any) => [i.name, i.meta]));
const lines = Object.entries(d).map(([name, [title, description]]) => {
  const meta = links.get(name);
  const m = meta && Object.keys(meta.links ?? {}).length ? `, meta: ${JSON.stringify(meta)}` : "";
  return `  ${JSON.stringify(name)}: { title: ${JSON.stringify(title)}, description: ${JSON.stringify(description)}${m} },`;
});
writeFileSync("registry/metadata.ts", `// Authored metadata per registry item, keyed by item name (the file basename in src/components or src/hooks).
// Everything else (type, files, dependencies) is derived by scripts/build-registry.mts.
// A component or hook without an entry here fails the build.
import type { ItemMetadata } from "../scripts/registry-items.mts";

export const metadata: Record<string, ItemMetadata> = {
${lines.join("\n")}
};
`);
console.log(Object.keys(d).length);
