import type { ComponentEntry, ComponentIndex } from "../lib/component-index.mts"

export const entry = (
  name: string,
  description: string,
  extra: Partial<ComponentEntry> = {}
): ComponentEntry => ({
  name,
  type: "ui",
  title: name[0]!.toUpperCase() + name.slice(1),
  description,
  import: `@scope/ui/${name}`,
  rootImport: true,
  exports: [],
  variants: null,
  dependencies: [],
  install: [],
  links: {},
  baseUiDoc: null,
  source: [{ path: `src/components/${name}.tsx`, code: `// ${name}` }],
  ...extra,
})

export const index: ComponentIndex = {
  package: "@scope/ui",
  version: "1.0.0",
  components: [
    entry("button", "Clickable control."),
    entry("dialog", "Modal window over the page.", {
      exports: ["Dialog", "DialogTitle"],
      baseUiDoc: "dialog",
    }),
    entry("tooltip", "Hint on hover.", {
      exports: ["Tooltip", "TooltipProvider"],
    }),
    entry("sonner", "Toasts.", {
      exports: ["Toaster"],
      dependencies: ["sonner", "next-themes", "cn"],
      install: ["sonner@^2.0.8", "next-themes@~0.4.6"],
    }),
    entry("card", "Panel."),
    entry("alert-dialog", "Modal dialog that asks to confirm."),
    entry("calendar", "Date grid."),
  ],
}

export const baseUiDoc = (name: string) =>
  name === "dialog"
    ? "# Dialog\n\nDemo.\n\n## API reference\n\n### Root\n| Prop |"
    : null
