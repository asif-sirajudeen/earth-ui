import assert from "node:assert/strict"
import { test } from "node:test"

import { partsFromDts } from "../../build/props.mts"

// Fixtures: exact text of dist/components/*.d.ts and dist/hooks/*.d.ts.
const CARD = `import * as React from "react";
declare function Card({ className, size, ...props }: React.ComponentProps<"div"> & {
  size?: "default" | "sm";
}): React.JSX.Element;
declare function CardHeader({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element;
export { Card, CardHeader };`

const SHEET = `import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
declare function SheetTrigger({ ...props }: Dialog.Trigger.Props): React.JSX.Element;
declare function SheetContent({ className, children, side, showCloseButton, ...props }: Dialog.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
}): React.JSX.Element;
export { SheetContent, SheetTrigger };`

const CALENDAR = `import { Button } from "./button.js";
import * as React from "react";
import { DayButton, DayPicker, Locale } from "react-day-picker";
declare function Calendar({ className, classNames, showOutsideDays, captionLayout, buttonVariant, locale, formatters, components, ...props }: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}): React.JSX.Element;
declare function CalendarDayButton({ className, day, modifiers, locale, ...props }: React.ComponentProps<typeof DayButton> & {
  locale?: Partial<Locale>;
}): React.JSX.Element;
export { Calendar, CalendarDayButton };`

const RESIZABLE = `import * as ResizablePrimitive from "react-resizable-panels";
declare function ResizablePanelGroup({ className, ...props }: ResizablePrimitive.GroupProps): import("react").JSX.Element;
declare function ResizableHandle({ withHandle, className, ...props }: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean;
}): import("react").JSX.Element;
export { ResizableHandle, ResizablePanelGroup };`

const USE_MOBILE = `export declare function useIsMobile(): boolean;`

const USE_HIGHLIGHTED_CODE = `import * as React from "react";
export declare function useHighlightedCode(value: string, language: string): (string | number | bigint | boolean | React.JSX.Element[] | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined)[];`

test("card: size union, div forwarded", () => {
  assert.deepEqual(partsFromDts(CARD), [
    {
      name: "Card",
      forwards: "div",
      props: [{ name: "size", type: '"default" | "sm"' }],
    },
    { name: "CardHeader", forwards: "div", props: [] },
  ])
})

test("sheet: Base UI forwards qualified, own props listed", () => {
  const [content, trigger] = partsFromDts(SHEET)
  assert.deepEqual(trigger, {
    name: "SheetTrigger",
    forwards: "@base-ui/react/dialog Dialog.Trigger.Props",
    props: [],
  })
  assert.deepEqual(content, {
    name: "SheetContent",
    forwards: "@base-ui/react/dialog Dialog.Popup.Props",
    props: [
      { name: "side", type: '"top" | "right" | "bottom" | "left"' },
      { name: "showCloseButton", type: "boolean" },
    ],
  })
})

test("calendar: forwards react-day-picker DayPicker", () => {
  const [calendar, dayButton] = partsFromDts(CALENDAR)
  assert.deepEqual(calendar, {
    name: "Calendar",
    forwards: "react-day-picker DayPicker",
    props: [
      {
        name: "buttonVariant",
        type: 'React.ComponentProps<typeof Button>["variant"]',
      },
    ],
  })
  assert.equal(
    (dayButton as { forwards: string }).forwards,
    "react-day-picker DayButton"
  )
})

test("resizable: namespace import is dropped, withHandle listed", () => {
  assert.deepEqual(partsFromDts(RESIZABLE), [
    {
      name: "ResizableHandle",
      forwards: "react-resizable-panels SeparatorProps",
      props: [{ name: "withHandle", type: "boolean" }],
    },
    {
      name: "ResizablePanelGroup",
      forwards: "react-resizable-panels GroupProps",
      props: [],
    },
  ])
})

test("hooks: params and the return type as written", () => {
  assert.deepEqual(partsFromDts(USE_MOBILE), [
    { name: "useIsMobile", params: [], returns: "boolean" },
  ])
  const [hook] = partsFromDts(USE_HIGHLIGHTED_CODE) as {
    params: unknown[]
    returns: string
  }[]
  assert.deepEqual(hook!.params, [
    { name: "value", type: "string" },
    { name: "language", type: "string" },
  ])
  assert.ok(hook!.returns.startsWith("(string | number | bigint"))
  assert.ok(hook!.returns.endsWith("| null | undefined)[]"))
})

test("renamed exports, local aliases and non-components", () => {
  const dts = `type P = {
  a?: string;
};
declare const X$1: typeof Lib.Root;
declare function Y(props: React.ComponentProps<"div"> & P): void;
declare const helperVariants: () => string;
export { X$1 as X, Y, helperVariants };`
  assert.deepEqual(partsFromDts(dts), [
    { name: "X", forwards: "Lib.Root", props: [] },
    { name: "Y", forwards: "div", props: [{ name: "a", type: "string" }] },
  ])
})
