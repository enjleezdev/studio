
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { Home, Warehouse, Package, FileText, Archive as ArchiveIcon, UserCircle, Bot, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent, 
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { UserProfile }  from "@/lib/types";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

const USER_PROFILE_LS_KEY = 'userProfileData';

// MiniAppLogo definition is kept in case it's used elsewhere or for future adjustments,
// but it's not rendered in the SidebarHeader in this version.
const MiniAppLogo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("h-6 w-6", className)} 
  >
    <rect width="8" height="8" x="3" y="3" rx="2"/>
    <path d="M7 11v4a2 2 0 0 0 2 2h4"/>
    <rect width="8" height="8" x="13" y="13" rx="2"/>
  </svg>
);


export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const [profileUsername, setProfileUsername] = React.useState<string | null>("User");
  const [profileEmail, setProfileEmail] = React.useState<string | null>("user@example.com");

  const loadProfileData = React.useCallback(() => {
    try {
      const storedProfileString = localStorage.getItem(USER_PROFILE_LS_KEY);
      if (storedProfileString) {
        const profile = JSON.parse(storedProfileString) as UserProfile;
        setProfileUsername(profile.username || "User");
        setProfileEmail(profile.email || "user@example.com");
      } else {
        const defaultProfile: UserProfile = {
          id: 'default-user', 
          username: 'Admin',
          email: 'admin@example.com', 
          usernameChanged: false,
          createdAt: new Date().toISOString(), 
        };
        localStorage.setItem(USER_PROFILE_LS_KEY, JSON.stringify(defaultProfile));
        setProfileUsername(defaultProfile.username);
        setProfileEmail(defaultProfile.email);
      }
    } catch (error) {
      console.error('Failed to load user profile for sidebar:', error);
      setProfileUsername("User"); 
      setProfileEmail("user@example.com"); 
    }
  }, []);

  React.useEffect(() => {
    loadProfileData();
    const handleProfileUpdate = () => {
      loadProfileData();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [loadProfileData]);


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

  const handleSignOut = async () => {
    if (isMobile) {
      setOpenMobile(false);
    }
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/signin');
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({
        title: "Logout Failed",
        description: "Could not log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
       <SidebarHeader className={cn(
        "flex items-center h-14", // Keep height for structure
        state === 'collapsed' ? 'justify-center px-2' : 'px-4 justify-start'
      )}>
        {/* Logo and name removed as per request */}
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
          {/* Log Out Button */}
          <SidebarMenuItem className="mt-auto absolute bottom-16 w-[calc(100%-1rem)] group-data-[collapsible=icon]:w-[calc(100%-0.5rem)]">
            <Separator className="my-2" />
             <SidebarMenuButton
              onClick={handleSignOut}
              tooltip={state === "collapsed" ? "Log Out" : undefined}
              variant="default" 
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <LogOut />
              <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="mt-auto">
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
              "flex flex-col transition-[opacity] overflow-hidden",
              state === "collapsed" && "opacity-0 hidden"
            )}>
              <span className="text-sm font-medium text-sidebar-foreground text-ellipsis whitespace-nowrap">{profileUsername || "User"}</span>
              <span className="text-xs text-muted-foreground text-ellipsis whitespace-nowrap">{profileEmail || "user@example.com"}</span>
            </div>
          </div>
      </SidebarFooter>
    </Sidebar>
  );
}
