import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  rewrites: async () => [
    {
      source: "/docs",
      destination: "/docs/home",
    },
    {
      source: "/docs/guide/deploying",
      destination: "/docs/guide",
    },
  ],
};

export default nextConfig;
