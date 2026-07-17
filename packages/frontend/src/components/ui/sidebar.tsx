'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger as SheetPrimitiveTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from './button';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';

const SIDEBAR_COOKIE_NAME = 'sidebar_collapsed';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 1 week

type SidebarContext = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}

const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    if (typeof window === 'undefined') return true;
    return document.cookie.includes(`${SIDEBAR_COOKIE_NAME}=true`);
  });

  const toggleSidebar = React.useCallback(() => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${newState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      return newState;
    });
  }, []);

  const contextValue = React.useMemo<SidebarContext>(
    () => ({ isCollapsed, toggleSidebar }),
    [isCollapsed, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  );
};

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const isMobile = useIsMobile();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  
  if (isMobile) {
    return (
      <Sheet open={!isCollapsed} onOpenChange={toggleSidebar}>
        <SheetPrimitiveTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
            <Menu />
          </Button>
        </SheetPrimitiveTrigger>
        <SheetContent
          side="left"
          className={cn(
            'flex h-full flex-col p-0 w-64 bg-sidebar text-sidebar-foreground'
          )}
        >
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      ref={ref}
      data-state={isCollapsed ? 'collapsed' : 'expanded'}
      className={cn(
        'group fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-14' : 'w-64',
        className
      )}
      {...props}
    >
      {children}
       <SidebarTrigger className="absolute top-1/2 -right-3 z-50 hidden h-6 w-6 rounded-full bg-primary text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100 group-data-[state=expanded]:right-2 group-data-[state=expanded]:opacity-100 md:flex items-center justify-center">
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </SidebarTrigger>
    </aside>
  );
});
Sidebar.displayName = 'Sidebar';

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & { asChild?: boolean }
>(({ asChild = false, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();
  const Comp = asChild ? Slot : 'button';

  return <Comp ref={ref} onClick={toggleSidebar} {...props} />;
});
SidebarTrigger.displayName = 'SidebarTrigger';

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-1 flex-col overflow-y-auto overflow-x-hidden',
        className
      )}
      {...props}
    />
  );
});
SidebarContent.displayName = 'SidebarContent';

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col border-t border-sidebar-border mt-auto',
        className
      )}
      {...props}
    />
  );
});
SidebarFooter.displayName = 'SidebarFooter';

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => {
  return (
    <ul
      ref={ref}
      className={cn('flex flex-col gap-1 p-2', className)}
      {...props}
    />
  );
});
SidebarMenu.displayName = 'SidebarMenu';

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => {
  return <li ref={ref} className={cn('relative', className)} {...props} />;
});
SidebarMenuItem.displayName = 'SidebarMenuItem';

const sidebarMenuButtonVariants = cva(
  'flex w-full items-center gap-3 rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-2 data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground [&>svg]:size-5 [&>svg]:shrink-0',
  {
    variants: {
      variant: { default: '' },
    },
    defaultVariants: { variant: 'default' },
  }
);

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: React.ComponentProps<typeof TooltipContent>;
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(({ asChild = false, isActive, tooltip, className, ...props }, ref) => {
  const { isCollapsed } = useSidebar();
  const Comp = asChild ? Slot : 'button';

  const button = (
    <Comp
      ref={ref}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants(), className)}
      {...props}
    />
  );

  if (tooltip && isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent {...tooltip} />
      </Tooltip>
    );
  }

  return button;
});
SidebarMenuButton.displayName = 'SidebarMenuButton';

export {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
};