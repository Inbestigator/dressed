"use client";

import * as React from "react";
import {
  Cog,
  Home,
  Puzzle,
  Reply,
  Terminal,
  Ear,
  Book,
  Network,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";

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
        icon: Network,
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
];

export function DocsSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="font-semibold">
                <Image
                  src="/dressed_small.webp"
                  width={32}
                  height={32}
                  alt="Dressed logo"
                  className="rounded-lg"
                />
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
