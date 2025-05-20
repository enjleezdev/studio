
'use client'; // Needs to be a client component to use useSidebar hook

import type { PropsWithChildren } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button"; // Keep for other potential uses, though not directly for SidebarTrigger here
import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils"; // For potential custom styling if needed
import { buttonVariants } from "@/components/ui/button"; // For applying button styles if a raw element was used

// New component for the header within SidebarInset
function MainHeader() {
  const { isMobile, toggleSidebar } = useSidebar();

  if (!isMobile) {
    return null; // Don't render the mobile header trigger on larger screens
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-start gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
      {/* SidebarTrigger itself is a Button. Pass props directly to it. */}
      {/* It already includes PanelLeft icon and sr-only text by default. */}
      <SidebarTrigger size="icon" variant="outline" />
    </header>
  );
}


export default function MainAppLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <MainHeader /> {/* Add the header with the mobile trigger */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto overflow-x-hidden"> {/* ADDED overflow-x-hidden HERE */}
         {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

