import type { NextConfig } from "next"
import { createMDX } from "fumadocs-mdx/next"

const basePath = "/earth-ui"
const withMDX = createMDX()

const config: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  reactStrictMode: true,
  // Static export has no image optimizer; the synced examples use next/image.
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
}

export default withMDX(config)
