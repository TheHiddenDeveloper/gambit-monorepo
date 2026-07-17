'use client';

import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Library,
  BarChart3,
  FlaskConical,
  Settings,
  BookOpen,
  Pencil,
  Grid3x3,
  Menu,
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from './logo';
import { Button } from './ui/button';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/games', label: 'Game Library', icon: Library },
  { href: '/progress', label: 'Progress', icon: BarChart3 },
  { href: '/analysis', label: 'Weakness Analysis', icon: FlaskConical },
];

const toolsMenuItems = [
  { href: '/analysis-board', label: 'Analysis Board', icon: Grid3x3 },
  { href: '/openings', label: 'Opening Explorer', icon: BookOpen },
  { href: '/board-editor', label: 'Board Editor', icon: Pencil },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full">
      <div className="flex h-14 shrink-0 items-center border-b border-sidebar-border px-4 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-2">
        <SidebarTrigger asChild>
          <Button variant="ghost" className="h-10 w-10 p-0 md:hidden">
            <Menu />
          </Button>
        </SidebarTrigger>
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold"
        >
          <Logo />
          <span className="group-data-[state=collapsed]:hidden">
            Gambit
          </span>
        </Link>
      </div>

      <SidebarMenu>
        {menuItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={{
                  children: item.label,
                  side: 'right',
                  align: 'center',
                }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span className="group-data-[state=collapsed]:hidden">
                    {item.label}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
        <div className="mt-2 mb-1 px-4 text-xs text-muted-foreground group-data-[state=collapsed]:hidden">
          Tools
        </div>
        {toolsMenuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={{
                  children: item.label,
                  side: 'right',
                  align: 'center',
                }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span className="group-data-[state=collapsed]:hidden">
                    {item.label}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
      <SidebarMenu className="mt-auto">
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith('/settings')}
            tooltip={{ children: 'Settings', side: 'right', align: 'center' }}
          >
            <Link href="/settings">
              <Settings />
              <span className="group-data-[state=collapsed]:hidden">
                Settings
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </nav>
  );
}
