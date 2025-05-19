import type { PropsWithChildren } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function MainAppLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
         {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
