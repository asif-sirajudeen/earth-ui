// Applies the saved docs style theme before paint, so a saved theme does not flash the base one.
// The key must match STYLE_THEME_KEY in lib/style-theme.ts.
try {
  var theme = localStorage.getItem("earth-ui-style-theme")
  if (theme && theme !== "base") document.documentElement.dataset.theme = theme
} catch (e) {}
