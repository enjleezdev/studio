"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Warehouse, Package, BarChart3, ListChecks, Bot, Settings, Users, ChevronDown, ChevronUp, LogOut, FileText, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const AppLogo = () => (
  <div className="flex items-center gap-2 px-2 py-1">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
    <h1 className="text-xl font-semibold text-foreground">StockPilot</h1>
  </div>
);


export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();

  const isActive = (path: string) => {
    if (path === "/inventory" && pathname.startsWith("/inventory")) return true;
    return pathname === path || (path !== "/" && pathname.startsWith(path));
  };
  
  // This component might be used if we introduce warehouse selection within inventory link
  // For now, inventory is accessed by clicking a warehouse from the /warehouses page.
  // const inventoryPath = selectedWarehouseId ? `/inventory/${selectedWarehouseId}` : '/inventory';


  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/warehouses")}
              tooltip={state === "collapsed" ? "Warehouses" : undefined}
            >
              <Link href="/warehouses">
                <Warehouse />
                <span>Warehouses</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* Inventory link might be dynamic or context-dependent. For now, accessed via warehouses. */}
          {/* <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive(inventoryPath)}
              tooltip={state === "collapsed" ? "Inventory" : undefined}
              // disabled={!selectedWarehouseId} // Potentially disable if no warehouse selected
            >
              <Link href={inventoryPath}>
                <Package />
                <span>Inventory</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem> */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/reports")}
              tooltip={state === "collapsed" ? "Reports" : undefined}
            >
              <Link href="/reports">
                <FileText />
                <span>Reports</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/stocktake")}
              tooltip={state === "collapsed" ? "Stocktake" : undefined}
            >
              <Link href="/stocktake">
                <ListChecks />
                <span>Stocktake</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Separator className="my-2" />
         <div className={cn(
            "flex items-center gap-3 p-2 transition-all",
            state === "collapsed" && "justify-center"
          )}>
            <Avatar className="size-8">
              <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar" />
              <AvatarFallback>SP</AvatarFallback>
            </Avatar>
            <div className={cn(
              "flex flex-col transition-[opacity]",
              state === "collapsed" && "opacity-0 hidden"
            )}>
              <span className="text-sm font-medium text-sidebar-foreground">Admin User</span>
              <span className="text-xs text-sidebar-foreground/70">admin@stockpilot.com</span>
            </div>
          </div>
      </SidebarFooter>
    </Sidebar>
  );
}
