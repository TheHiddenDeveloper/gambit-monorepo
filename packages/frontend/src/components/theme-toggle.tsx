'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { SidebarMenuButton } from '@/components/ui/sidebar';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  // Wait until mounted on client to render to avoid hydration mismatch
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <SidebarMenuButton disabled>
        <Sun className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuButton
      onClick={toggleTheme}
      tooltip={{ children: 'Toggle Theme', side: 'right', align: 'center' }}
    >
      {isDark ? <Sun /> : <Moon />}
      <span className="group-data-[state=collapsed]:hidden">Toggle Theme</span>
    </SidebarMenuButton>
  );
}
