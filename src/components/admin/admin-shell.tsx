"use client";

import { useState } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Locale } from "@/i18n/locales";
import type { SessionUser } from "@/server/auth/guards";

type AdminShellProps = {
  user: SessionUser;
  collapsed: boolean;
  editLocale: Locale;
  children: React.ReactNode;
};

export function AdminShell({
  user,
  collapsed: collapsedFromCookie,
  editLocale,
  children,
}: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(collapsedFromCookie);

  return (
    <TooltipProvider>
      <div className="flex min-h-dvh bg-background">
        <AdminSidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar user={user} editLocale={editLocale} />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </TooltipProvider>
  );
}
