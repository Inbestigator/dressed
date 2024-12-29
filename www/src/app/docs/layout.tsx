import type { Metadata } from "next";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DocsSidebar } from "@/components/docs-sidebar";

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
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
