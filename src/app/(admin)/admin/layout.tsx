import { cookies } from "next/headers";

import { AdminShell } from "@/components/admin/admin-shell";
import {
  ADMIN_EDIT_LOCALE_COOKIE,
  ADMIN_SIDEBAR_COOKIE,
  parseEditLocale,
  parseSidebarCollapsed,
} from "@/components/admin/cookies";
import { adminPageMetadata } from "@/components/admin/page-meta";
import { requireAuth } from "@/server/auth/guards";

export const metadata = adminPageMetadata("Admin", "/admin");

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const jar = await cookies();

  return (
    <AdminShell
      user={user}
      collapsed={parseSidebarCollapsed(jar.get(ADMIN_SIDEBAR_COOKIE)?.value)}
      editLocale={parseEditLocale(jar.get(ADMIN_EDIT_LOCALE_COOKIE)?.value)}
    >
      <div className="p-4 md:p-6">{children}</div>
    </AdminShell>
  );
}
