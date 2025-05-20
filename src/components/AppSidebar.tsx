
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Warehouse, Package, ListChecks, Bot, Settings, Users, ChevronDown, ChevronUp, LogOut, FileText, Archive as ArchiveIcon, UserCircle } from "lucide-react"; // Added UserCircle
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
  useSidebar,
  SidebarTrigger, // Ensure SidebarTrigger is imported if used in layout.tsx
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile } = useSidebar();

  const isActive = (path: string) => {
    if (path.includes("[") && path.includes("]")) {
      const basePath = path.substring(0, path.indexOf("["));
      return pathname.startsWith(basePath);
    }
    if (path === "/reports" && pathname.startsWith("/reports")) return true;
    if (path === "/archive" && pathname.startsWith("/archive")) return true;
    return pathname === path || (path !== "/" && pathname.startsWith(path));
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className={cn(
        "flex items-center h-14",
        state === 'collapsed' ? 'justify-center px-2' : 'px-4 justify-start gap-2'
      )}>
        {/* Logo and brand name removed from sidebar header */}
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
              isActive={isActive("/archive")}
              tooltip={state === "collapsed" ? "Archive" : undefined}
              onClick={handleLinkClick}
            >
              <Link href="/archive">
                <ArchiveIcon />
                <span>Archive</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/profile")}
              tooltip={state === "collapsed" ? "Profile" : undefined}
              onClick={handleLinkClick}
            >
              <Link href="/profile">
                <UserCircle />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/stocktake")}
              tooltip={state === "collapsed" ? "Stocktake" : undefined}
              onClick={handleLinkClick}
              disabled // Assuming stocktake is not yet implemented
              className="cursor-not-allowed opacity-50"
            >
              <Link href="/stocktake">
                <ListChecks />
                <span>Stocktake</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
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
              <AvatarFallback>FP</AvatarFallback>
            </Avatar>
            <div className={cn(
              "flex flex-col transition-[opacity]",
              state === "collapsed" && "opacity-0 hidden"
            )}>
              <span className="text-sm font-medium text-sidebar-foreground">Admin User</span>
              <span className="text-sm text-sidebar-foreground/70">admin@ezinventory.com</span>
            </div>
          </div>
      </SidebarFooter>
    </Sidebar>
  );
}
