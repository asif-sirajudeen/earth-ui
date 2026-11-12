import { Provider } from "@/components/provider"

import "./global.css"

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Blocking on purpose: it must set data-theme before the first paint. */}
        <script src={`${process.env.NEXT_PUBLIC_BASE_PATH}/style-theme.js`} />
      </head>
      <body className="flex min-h-screen flex-col">
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
