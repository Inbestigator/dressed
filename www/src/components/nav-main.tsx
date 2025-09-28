"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";

interface Item {
  title: string;
  url?: string;
  icon?: LucideIcon;
  items?: Item[];
}

export function NavMain({ items }: { items: Item[] }) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <Item key={item.title} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function Item({ item }: { item: Item }) {
  const path = usePathname().split("/");
  return (
    <Collapsible asChild defaultOpen={path.some((p) => p.toLowerCase() === item.title.toLowerCase())}>
      <SidebarMenuItem>
        <SidebarMenuButton asChild className="h-fit" tooltip={item.title}>
          <Link tabIndex={-1} className={!item.url ? "pointer-events-none select-none" : ""} href={item.url ?? "/docs"}>
            {item.icon && <item.icon />}
            {item.title}
          </Link>
        </SidebarMenuButton>
        {item.items?.length && (
          <>
            <CollapsibleTrigger asChild>
              <SidebarMenuAction className="data-[state=open]:rotate-90">
                <ChevronRight />
                <span className="sr-only">Toggle</span>
              </SidebarMenuAction>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub className="relative">
                {item.items.map((subItem) => (
                  <Item item={subItem} key={subItem.url} />
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </>
        )}
      </SidebarMenuItem>
    </Collapsible>
  );
}
