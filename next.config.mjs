/** @type {import('next').NextConfig} */
// Trigger build: Fix pnpm lockfile
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
}

export default nextConfig
