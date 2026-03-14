import type { Metadata } from "next";
import { DocsSidebar } from "@/components/docs-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: {
    default: "Dressed Docs",
    template: "%s - Dressed Docs",
  },
};

export default function DocsLayout({ children }: Readonly<React.PropsWithChildren>) {
  return (
    <SidebarProvider>
      <div className="fixed inset-0 -z-1 bg-sidebar" />
      <DocsSidebar />
      <SidebarInset className="overflow-x-hidden">{children}</SidebarInset>
    </SidebarProvider>
  );
}
