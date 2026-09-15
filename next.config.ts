import type { NextConfig } from "next";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isUserSite = repositoryName?.endsWith(".github.io");
const basePath = process.env.PAGES_BASE_PATH ??
  (process.env.GITHUB_ACTIONS && repositoryName && !isUserSite ? `/${repositoryName}` : "");

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  typescript: { tsconfigPath: "tsconfig.pages.json" },
};

export default nextConfig;
