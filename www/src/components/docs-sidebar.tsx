"use client";

import * as React from "react";
import {
  Command,
  Github,
  Hash,
  Home,
  MessageCircle,
  Puzzle,
  Reply,
  Terminal,
  User,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
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

const data = {
  navMain: [
    {
      title: "Home",
      url: "/docs",
      icon: Home,
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
      ],
    },
    {
      title: "Components",
      url: "/docs/components",
      icon: Puzzle,
    },
    {
      title: "Interactions",
      url: "/docs/interactions",
      icon: Reply,
    },
    {
      title: "Channels",
      url: "/docs/channels",
      icon: Hash,
    },
    {
      title: "Guilds",
      url: "/docs/guilds",
      icon: Users,
    },
    {
      title: "Messages",
      url: "/docs/messages",
      icon: MessageCircle,
    },
    {
      title: "Threads",
      url: "/docs/threads",
      icon: Hash,
    },
    {
      title: "Users",
      url: "/docs/users",
      icon: User,
    },
  ],
  navSecondary: [
    {
      title: "GitHub",
      url: "https://github.com/inbestigator/dressed",
      icon: Github,
    },
  ],
};

export function DocsSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image
                    src="/dressed_small.webp"
                    width={256}
                    height={256}
                    alt="Dressed logo"
                    className="rounded-lg"
                  />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">Dressed</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}
