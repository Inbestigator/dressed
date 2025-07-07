import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
    ppr: true,
  },
  rewrites: async () => [
    {
      source: "/docs",
      destination: "/docs/home",
    },
  ],
};

export default nextConfig;
