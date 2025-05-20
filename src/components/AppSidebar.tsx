
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react"; // Import React for useState and useEffect
import { Home, Warehouse, Package, FileText, Archive as ArchiveIcon, UserCircle, Bot } from "lucide-react";
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
  SidebarGroupContent, // Ensure this is imported
  useSidebar,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { UserProfile }  from "@/lib/types";

const USER_PROFILE_LS_KEY = 'userProfileData';

export function AppSidebar() {
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const [profileUsername, setProfileUsername] = React.useState<string | null>("User");

  React.useEffect(() => {
    try {
      const storedProfileString = localStorage.getItem(USER_PROFILE_LS_KEY);
      if (storedProfileString) {
        const profile = JSON.parse(storedProfileString) as UserProfile;
        if (profile && profile.username) {
          setProfileUsername(profile.username);
        } else {
          setProfileUsername("User"); // Fallback if username is not in profile
        }
      } else {
         // Initialize a default profile if none exists, similar to profile page
        const defaultProfile: UserProfile = {
          id: 'default-user',
          username: 'Admin',
          password: 'password123', 
          usernameChanged: false,
        };
        localStorage.setItem(USER_PROFILE_LS_KEY, JSON.stringify(defaultProfile));
        setProfileUsername(defaultProfile.username);
      }
    } catch (error) {
      console.error('Failed to load user profile for sidebar:', error);
      setProfileUsername("User"); // Fallback on error
    }
  }, []);


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
        {/* Header content (logo and name) removed as per user request to clear it */}
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
           <SidebarGroup className="pt-4">
            <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center">
              AI Tools
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/ai/stock-suggestions")}
                  tooltip={state === "collapsed" ? "Enjleez AI Assistant" : undefined}
                  onClick={handleLinkClick}
                >
                  <Link href="/ai/stock-suggestions">
                    <Bot />
                    <span>Enjleez AI Assistant</span>
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
              <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar"/>
              <AvatarFallback>{profileUsername ? profileUsername.substring(0, 2).toUpperCase() : 'FP'}</AvatarFallback>
            </Avatar>
            <div className={cn(
              "flex flex-col transition-[opacity]",
              state === "collapsed" && "opacity-0 hidden"
            )}>
              <span className="text-sm font-medium text-sidebar-foreground">{profileUsername || "User"}</span>
              {/* Email line removed as UserProfile type does not contain email */}
            </div>
          </div>
      </SidebarFooter>
    </Sidebar>
  );
}
