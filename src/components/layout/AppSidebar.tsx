import { useState } from "react"
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  Bot,
  BarChart3,
  Settings,
  Webhook,
  User
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useLanguage } from "@/hooks/useLanguage"
import { useUserProfile } from "@/hooks/useUserProfile"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const { t } = useLanguage()
  const { hasModule, loading } = useUserProfile()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const allMenuItems = [
    { title: t("menu.dashboard"), url: "/", icon: LayoutDashboard, always: true },
    { title: t("menu.clients"), url: "/clientes", icon: Users, always: true },
    { title: t("menu.agenda"), url: "/agenda", icon: Calendar, module: 'agenda' as const },
    { title: t("menu.financial"), url: "/financeiro", icon: DollarSign, module: 'financeiro' as const },
    { title: t("menu.whatsapp"), url: "/whatsapp", icon: MessageSquare, module: 'whatsapp' as const },
    { title: t("menu.iachat"), url: "/iachat", icon: Bot, module: 'iachat' as const },
    { title: t("menu.reports"), url: "/relatorios", icon: BarChart3, always: true },
  ]

  const menuItems = allMenuItems.filter(item => 
    item.always || (item.module && hasModule(item.module))
  )

  const integrationItems = [
    { title: t("common.settings"), url: "/configuracoes", icon: Settings },
  ]

  const isActive = (path: string) => currentPath === path
  const getNavCls = (isActiveRoute: boolean) =>
    isActiveRoute 
      ? "bg-primary text-primary-foreground font-medium shadow-glow" 
      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        {/* Logo HBIOSS */}
        <div className="p-4 border-b border-sidebar-border">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              </div>
              <div>
                <span className="font-bold text-xl text-sidebar-foreground tracking-wide">HBIOSS</span>
                <div className="text-xs text-sidebar-foreground/60">Business CRM</div>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto relative overflow-hidden">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            </div>
          )}
        </div>

        {/* Menu Principal */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase text-xs font-medium px-4 py-2">
            {!collapsed && "Menu Principal"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={() => getNavCls(isActive(item.url))}
                    >
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Configurações */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase text-xs font-medium px-4 py-2">
            {!collapsed && "Configurações"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {integrationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={() => getNavCls(isActive(item.url))}
                    >
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}