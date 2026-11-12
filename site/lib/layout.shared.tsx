import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"

import { ThemeSelect } from "@/components/theme-select"

export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: "earth-ui", url: "/docs" },
    githubUrl: "https://github.com/asif-sirajudeen/earth-ui",
    links: [{ type: "custom", children: <ThemeSelect /> }],
  }
}
