import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: the site is published as plain files to GitHub Pages, no Node server involved.
  output: "export",
  // Pages has no image optimization server, so ship images as-is.
  images: { unoptimized: true },
  // GitHub Pages needs an actual index.html per folder route (e.g. /projects/index.html).
  trailingSlash: true,
};

export default nextConfig;
