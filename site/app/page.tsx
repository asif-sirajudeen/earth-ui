import { redirect } from "next/navigation"

// Static export has no server redirects, so Next emits a client-side redirect page. It adds basePath itself.
export default function Home() {
  redirect("/docs")
}
