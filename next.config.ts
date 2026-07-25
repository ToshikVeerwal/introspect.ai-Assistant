import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  // Keep tracing inside this project even when another package-lock exists higher on the machine.
  outputFileTracingRoot: process.cwd(),
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
};

export default nextConfig;
