import type { NextConfig } from "next";

export default {
  rewrites: async () => [
    {
      source: "/docs",
      destination: "/docs/home",
    },
  ],
} satisfies NextConfig;
