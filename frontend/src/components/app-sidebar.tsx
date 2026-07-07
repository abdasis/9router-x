"use client"

import * as React from "react"
import { Link, useLocation } from "react-router-dom"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  BotIcon,
  BookOpenIcon,
  Settings2Icon,
  LifeBuoyIcon,
  SendIcon,
  FrameIcon,
  PieChartIcon,
  MapIcon,
  TerminalIcon,
  BarChart3Icon,
  ShieldIcon,
  TerminalSquareIcon,
  LayersIcon,
  CpuIcon,
  ToyBrickIcon,
  MonitorIcon,
  GlobeIcon,
  Link as LinkIcon,
} from "lucide-react"

const navMain = [
  {
    title: "Endpoint",
    url: "/dashboard/endpoint",
    icon: <TerminalSquareIcon />,
    isActive: true,
  },
  {
    title: "Providers",
    url: "/dashboard/providers",
    icon: <CpuIcon />,
  },
  {
    title: "Combos",
    url: "/dashboard/combos",
    icon: <LayersIcon />,
  },
  {
    title: "Usage",
    url: "/dashboard/usage",
    icon: <BarChart3Icon />,
  },
  {
    title: "Quota Tracker",
    url: "/dashboard/quota",
    icon: <PieChartIcon />,
  },
  {
    title: "MITM",
    url: "/dashboard/mitm",
    icon: <ShieldIcon />,
  },
  {
    title: "CLI Tools",
    url: "/dashboard/cli-tools",
    icon: <TerminalIcon />,
  },
  {
    title: "Docs",
    url: "/dashboard/docs",
    icon: <BookOpenIcon />,
  },
]

const mediaProviders = [
  { name: "Web Fetch & Search", url: "/dashboard/media-providers/web", icon: <GlobeIcon /> },
  { name: "Embedding", url: "/dashboard/media-providers/embedding", icon: <FrameIcon /> },
  { name: "Image", url: "/dashboard/media-providers/image", icon: <MapIcon /> },
  { name: "TTS", url: "/dashboard/media-providers/tts", icon: <MapIcon /> },
  { name: "STT", url: "/dashboard/media-providers/stt", icon: <MapIcon /> },
  { name: "Video", url: "/dashboard/media-providers/video", icon: <MapIcon /> },
]

const systemItems = [
  { title: "Proxy Pools", url: "/dashboard/proxy-pools", icon: <LinkIcon /> },
  { title: "Automation", url: "/dashboard/automation", icon: <BotIcon /> },
  { title: "Skills", url: "/dashboard/skills", icon: <ToyBrickIcon /> },
]

const debugItems = [
  { title: "Console Log", url: "/dashboard/console-log", icon: <MonitorIcon /> },
]

const supportItems = [
  { title: "Support", url: "#", icon: <LifeBuoyIcon /> },
  { title: "Feedback", url: "#", icon: <SendIcon /> },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation()

  const isActive = (url: string) => {
    if (url === "/dashboard/endpoint") {
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/endpoint")
    }
    return pathname.startsWith(url)
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <img src="/logo_v2.png" alt="9Router" className="size-8 rounded-lg" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">9Router v2</span>
                  <span className="truncate text-xs">by ahwanulm</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />

        {/* Media Providers */}
        <NavProjects projects={mediaProviders} />

        {/* System section */}
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarMenu>
            <Collapsible asChild defaultOpen={true}>
              <div className="group/collapsible">
                <CollapsibleContent>
                  {systemItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)}>
                        <Link to={item.url}>
                          {item.icon}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  {debugItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)}>
                        <Link to={item.url}>
                          {item.icon}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Settings */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/dashboard/profile")}>
                <Link to="/dashboard/profile">
                  <Settings2Icon />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <NavSecondary items={supportItems} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={{ name: "User", email: "", avatar: "" }} />
      </SidebarFooter>
    </Sidebar>
  )
}
