import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const dir = path.dirname(fileURLToPath(import.meta.url));
const pages = process.env.PAGES === "1";
const basePath = pages ? "/cap" : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  outputFileTracingRoot: dir,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  turbopack: { root: dir },
  ...(pages
    ? {
        output: "export" as const,
        trailingSlash: true,
        images: { unoptimized: true },
        basePath,
        typescript: { ignoreBuildErrors: true },
      }
    : {}),
  webpack: (config) => {
    config.watchOptions = {
      ignored: ["**/node_modules/**", "**/.git/**", "**/.next/**", "../**"],
    };
    return config;
  },
};

export default nextConfig;
