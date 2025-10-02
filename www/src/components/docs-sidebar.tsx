"use client";

import { Atom, Book, Cog, Ear, FunctionSquare, Home, Network, Puzzle, Reply, Server, Terminal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type * as React from "react";
import routeData from "@/../../packages/dressed/src/resources/make/data.json";
import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const files = new Set<string>();
for (const { docs } of routeData.routes) {
  const url = new URL(docs.see, "http://0");
  const segments = url.pathname.split("/").filter(Boolean);
  files.add(segments.pop() ?? "misc");
}

const data = [
  {
    title: "Home",
    url: "/docs",
    icon: Home,
  },
  {
    title: "Guide",
    url: "/docs/guide",
    icon: Book,
    items: [
      {
        title: "Getting started",
        url: "/docs/guide/getting-started",
      },
      {
        title: "Counter",
        url: "/docs/guide/counter",
      },
      {
        title: "Deploying",
        url: "/docs/guide/deploying",
        icon: Server,
        items: [
          {
            title: "Vercel",
            url: "/docs/guide/deploying/vercel",
          },
          {
            title: "Cloudflare",
            url: "/docs/guide/deploying/cf-workers",
          },
          {
            title: "Deno Deploy",
            url: "/docs/guide/deploying/deno-deploy",
          },
          {
            title: "Netlify",
            url: "/docs/guide/deploying/netlify",
          },
        ],
      },
    ],
  },
  {
    title: "Server Config",
    url: "/docs/server-config",
    icon: Cog,
  },
  {
    title: "Commands",
    url: "/docs/commands",
    icon: Terminal,
    items: [
      {
        title: "Config",
        url: "/docs/commands/config",
      },
      {
        title: "Options",
        url: "/docs/commands/options",
      },
    ],
  },
  {
    title: "Resources",
    icon: FunctionSquare,
    items: Array.from(files).map((f) => ({
      title: f
        .split("-")
        .map((w) => `${w[0].toUpperCase()}${w.slice(1)}`)
        .join(" "),
      url: `/docs/resources/${f}`,
    })),
  },
  {
    title: "Components",
    url: "/docs/components",
    icon: Puzzle,
  },
  {
    title: "Events",
    url: "/docs/events",
    icon: Ear,
  },
  {
    title: "Interactions",
    url: "/docs/interactions",
    icon: Reply,
  },
  {
    title: "Custom servers",
    url: "/docs/custom-servers",
    icon: Network,
  },
  {
    title: "React",
    url: "/docs/react",
    icon: Atom,
  },
];

export function DocsSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="font-semibold">
                <Image src="/dressed_small.webp" width={32} height={32} alt="Dressed logo" className="rounded-lg" />
                Dressed
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data} />
      </SidebarContent>
    </Sidebar>
  );
}
