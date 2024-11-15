import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: () => [
    {
      source: "/docs",
      destination: "/docs/home",
    },
  ],
};

export default nextConfig;
