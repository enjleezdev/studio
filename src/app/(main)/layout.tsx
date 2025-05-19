
'use client'; // Needs to be a client component to use useSidebar hook

import type { PropsWithChildren } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";

// New component for the header within SidebarInset
function MainHeader() {
  const { isMobile } = useSidebar(); // No need for toggleSidebar here, SidebarTrigger handles it

  return (
    <>
      {isMobile && (
        <header className="sticky top-0 z-30 flex h-14 items-center justify-start gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
          {/* SidebarTrigger is part of the ui/sidebar component and handles toggling */}
          <SidebarTrigger asChild> 
            <Button size="icon" variant="outline">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SidebarTrigger>
          {/* You can add a logo or page title here if needed for mobile header */}
        </header>
      )}
    </>
  );
}


export default function MainAppLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <MainHeader /> {/* Add the header with the mobile trigger */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
         {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

