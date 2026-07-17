'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { MainNav } from '@/components/main-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import React from 'react';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const isMobile = useIsMobile();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // On the server or during initial client render, render children without the layout shell
    // to avoid hydration mismatches. The full layout will render on the client after mount.
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarFooter>
          <Separator className="my-1 bg-sidebar-border" />
          <ThemeToggle />
        </SidebarFooter>
      </Sidebar>
      <main className={cn('transition-[margin-left] duration-300 ease-in-out', !isMobile && (isCollapsed ? 'ml-14' : 'ml-64'))}>
        {children}
      </main>
    </>
  );
}


export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
