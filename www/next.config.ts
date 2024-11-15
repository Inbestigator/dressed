import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  rewrites: () => [
    {
      source: "/docs",
      destination: "/docs/home",
    },
  ],
};

export default nextConfig;
