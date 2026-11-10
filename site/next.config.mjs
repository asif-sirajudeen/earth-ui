import { createMDX } from "fumadocs-mdx/next"

const basePath = "/earth-ui"
const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
  output: "export",
  basePath,
  trailingSlash: true,
  reactStrictMode: true,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
}

export default withMDX(config)
