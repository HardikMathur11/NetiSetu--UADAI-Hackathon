import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/contexts/AppContext';
import {
  LayoutDashboard,
  Upload,
  Database,
  TrendingUp,
  LineChart,
  Lightbulb,
  FileText,
  Settings,
  Home,
  Play,
  Info,
} from 'lucide-react';
import { AskNiti } from '@/components/AskNiti';

const navigationItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Upload Data', url: '/upload', icon: Upload },
  { title: 'Data Understanding', url: '/data-understanding', icon: Database },
  { title: 'Trend Analysis', url: '/trends', icon: TrendingUp },
  { title: 'Predictions', url: '/predictions', icon: LineChart },
  { title: 'Policy Insights', url: '/policies', icon: Lightbulb },
  { title: 'Summary Report', url: '/summary', icon: FileText },
];

const secondaryItems = [
  { title: 'Architecture', url: '/architecture', icon: Info },
  { title: 'Settings', url: '/settings', icon: Settings },
];

function SidebarContents() {
  const location = useLocation();
  const { isDemoMode, setIsDemoMode, guidedStep } = useApp();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link to="/" className="flex items-center gap-3">
          {/* Gradient N Logo from User Image */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-indigo-600 shadow-md">
            <span className="text-white font-black text-xl leading-none">N</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <div className="font-bold text-xl leading-none tracking-tight">
                <span className="text-white">Niti</span>
                <span className="text-orange-500">Setu</span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/80 font-medium mt-1">Policy Intelligence</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Demo Mode Toggle */}
        <div className="p-3 my-2 rounded-lg bg-sidebar-accent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-sidebar-primary" />
              {!collapsed && <span className="text-sm font-medium text-sidebar-foreground">Demo Mode</span>}
            </div>
            <Switch
              checked={isDemoMode}
              onCheckedChange={setIsDemoMode}
              className="data-[state=checked]:bg-sidebar-primary"
            />
          </div>
          {!collapsed && isDemoMode && (
            <div className="mt-2 flex items-center gap-1">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${guidedStep >= step ? 'bg-sidebar-primary' : 'bg-sidebar-border'
                    }`}
                />
              ))}
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!collapsed && (
          <div className="text-xs text-sidebar-foreground/60">
            <p>Government Data Hackathon 2026</p>
            <p className="mt-1">UIDAI Decision Support Demo</p>
          </div>
        )}
      </SidebarFooter>
    </>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
          <SidebarContents />
        </Sidebar>
        <div className="flex-1 flex flex-col relative z-0">
          {/* Background Image Layer */}
          <div
            className="absolute inset-0 z-[-1] bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
            style={{ backgroundImage: "url('/landing-bg-vivid.png')" }}
          />
          <div className="absolute inset-0 z-[-1] bg-white/70 pointer-events-none mix-blend-overlay" />

          <header className="h-14 border-b bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-foreground transition-colors">
                  <Home className="h-4 w-4" />
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                Hackathon Demo
              </Badge>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-transparent relative z-10">
            {children}
            <AskNiti />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
