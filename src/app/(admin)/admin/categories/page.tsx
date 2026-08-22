import Link from "next/link";

import { CategoryTree } from "@/components/admin/catalogue/category-tree";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminPageMetadata } from "@/components/admin/page-meta";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/server/auth/guards";
import { listAdminCategoryTree } from "@/server/queries/admin-categories";

export async function generateMetadata() {
  return adminPageMetadata("Categories", "/admin/categories");
}

export default async function AdminCategoriesPage() {
  const user = await getCurrentUser();
  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";
  const tree = await listAdminCategoryTree("PRODUCT");

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Nested product categories. Drag siblings to reorder."
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/categories", label: "Categories" },
        ]}
        actions={
          canEdit ? (
            <Button asChild>
              <Link href={"/admin/categories/new" as never}>New category</Link>
            </Button>
          ) : null
        }
      />
      {tree.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No categories yet.
        </p>
      ) : (
        <CategoryTree nodes={tree} canEdit={canEdit} />
      )}
    </div>
  );
}
