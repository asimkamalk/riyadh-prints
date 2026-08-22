"use client";

import { PanelLeft } from "lucide-react";

import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";
import {
  ADMIN_COOKIE_MAX_AGE,
  ADMIN_SIDEBAR_COOKIE,
} from "@/components/admin/cookies";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

export function persistSidebarCollapsed(collapsed: boolean) {
  document.cookie = `${ADMIN_SIDEBAR_COOKIE}=${collapsed ? "1" : "0"}; path=/; max-age=${ADMIN_COOKIE_MAX_AGE}; samesite=lax`;
}

export function AdminSidebar({ collapsed, onCollapsedChange }: AdminSidebarProps) {
  return (
    <aside
      data-collapsed={collapsed ? "true" : "false"}
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-e border-sidebar-border bg-sidebar text-sidebar-foreground md:flex",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className={cn("flex h-14 items-center gap-2 border-b border-sidebar-border px-3", collapsed && "justify-center px-0")}>
        {collapsed ? (
          <span className="text-sm font-bold text-brand-600">RP</span>
        ) : (
          <span className="truncate text-sm font-semibold">Riyadh Prints</span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className={cn(!collapsed && "ms-auto")}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => {
            const next = !collapsed;
            persistSidebarCollapsed(next);
            onCollapsedChange(next);
          }}
        >
          <PanelLeft className="size-4" />
        </Button>
      </div>
      <AdminSidebarNav collapsed={collapsed} />
    </aside>
  );
}
