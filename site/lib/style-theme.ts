// The docs' style theme: "base" (styles.css defaults) or a theme from themes/ applied as data-theme on <html>.
export const STYLE_THEMES = ["base", "blue", "green", "setmore"] as const
export type StyleTheme = (typeof STYLE_THEMES)[number]
// public/style-theme.js reads the same key before paint.
export const STYLE_THEME_KEY = "earth-ui-style-theme"
