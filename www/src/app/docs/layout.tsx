import type { Metadata } from "next";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DocsSidebar } from "@/components/docs-sidebar";
import UpdateBackground from "@/components/update-background";

export const metadata: Metadata = {
  title: "Dressed Docs",
  description: "",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DocsSidebar />
      <SidebarInset className="overflow-x-hidden">{children}</SidebarInset>
      <UpdateBackground color="var(--sidebar-background)" />
    </SidebarProvider>
  );
}
