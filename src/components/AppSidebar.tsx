
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Warehouse, Package, BarChart3, ListChecks, Bot, Settings, Users, ChevronDown, ChevronUp, LogOut, FileText, LayoutDashboard, History } from "lucide-react"; // Added History
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
  SidebarGroupContent,
  useSidebar, // Import useSidebar
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
  const { state, isMobile, setOpenMobile } = useSidebar(); // Get isMobile and setOpenMobile

  const isActive = (path: string) => {
    // For dynamic paths like /inventory/[id], check if pathname starts with the base path
    if (path.includes("[") && path.includes("]")) {
      const basePath = path.substring(0, path.indexOf("["));
      return pathname.startsWith(basePath);
    }
    if (path === "/reports" && pathname.startsWith("/reports")) return true; // Ensure reports and its sub-paths are active
    return pathname === path || (path !== "/" && pathname.startsWith(path));
  };
  
  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

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
              onClick={handleLinkClick}
            >
              <Link href="/warehouses">
                <Warehouse />
                <span>Warehouses</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* Inventory link might be dynamic or context-dependent. 
              For now, item details and history are accessed via warehouses/[warehouseId] page.
              A dedicated top-level /inventory page might list all items across all warehouses,
              which is a feature for later.
          */}
          {/* <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive("/inventory")} // A general inventory overview if implemented
              tooltip={state === "collapsed" ? "Inventory" : undefined}
              onClick={handleLinkClick}
            >
              <Link href="/inventory"> 
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
              onClick={handleLinkClick}
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
              onClick={handleLinkClick}
            >
              <Link href="/stocktake">
                <ListChecks />
                <span>Stocktake</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           {/* AI Features Menu (Example) */}
           <SidebarGroup className="pt-4">
            <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center">
              AI Tools
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/ai/stock-suggestions")}
                  tooltip={state === "collapsed" ? "Stock Suggestions" : undefined}
                  onClick={handleLinkClick}
                >
                  <Link href="/ai/stock-suggestions">
                    <Bot />
                    <span>Stock Suggestions</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarGroupContent>
          </SidebarGroup>
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
