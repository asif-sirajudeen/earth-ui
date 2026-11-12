"use client"

import { useSyncExternalStore } from "react"
import { NativeSelect, NativeSelectOption } from "@asif-sirajudeen/earth-ui"

import {
  STYLE_THEME_KEY,
  STYLE_THEMES,
  type StyleTheme,
} from "@/lib/style-theme"

const EVENT = "earth-ui-style-theme"
const subscribe = (onChange: () => void) => {
  window.addEventListener(EVENT, onChange)
  return () => window.removeEventListener(EVENT, onChange)
}
const current = (): StyleTheme =>
  (document.documentElement.dataset.theme as StyleTheme | undefined) ?? "base"

function apply(theme: StyleTheme) {
  if (theme === "base") delete document.documentElement.dataset.theme
  else document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(STYLE_THEME_KEY, theme)
  } catch {}
  window.dispatchEvent(new Event(EVENT))
}

/** Switches every preview between the base tokens and a theme from themes/. The docs chrome keeps fumadocs' own colors. */
export function ThemeSelect() {
  const theme = useSyncExternalStore(subscribe, current, () => "base")
  return (
    <NativeSelect
      size="sm"
      className="w-full"
      aria-label="Style theme"
      value={theme}
      onChange={(e) => apply(e.target.value as StyleTheme)}
    >
      {STYLE_THEMES.map((t) => (
        <NativeSelectOption key={t} value={t}>
          {t[0]!.toUpperCase() + t.slice(1)}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}
