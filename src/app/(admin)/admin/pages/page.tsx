import Link from "next/link";

import { PagesTree } from "@/components/admin/pages/pages-tree";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminPageMetadata } from "@/components/admin/page-meta";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/server/auth/guards";
import { listAdminPageTree } from "@/server/queries/admin-pages";

export async function generateMetadata() {
  return adminPageMetadata("Pages", "/admin/pages");
}

export default async function AdminPagesPage() {
  const user = await getCurrentUser();
  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";
  const tree = await listAdminPageTree();

  return (
    <div>
      <AdminPageHeader
        title="Pages"
        description="Nested pages and landing URLs. Child paths appear under their parent."
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/pages", label: "Pages" },
        ]}
        actions={
          canEdit ? (
            <Button asChild>
              <Link href={"/admin/pages/new" as never}>New page</Link>
            </Button>
          ) : null
        }
      />
      {tree.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No pages yet.
        </p>
      ) : (
        <PagesTree nodes={tree} canEdit={canEdit} />
      )}
    </div>
  );
}
