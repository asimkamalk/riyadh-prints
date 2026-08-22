import Link from "next/link";

import {
  CATALOGUE_PAGE_SIZE,
  parseCatalogueSearchParams,
} from "@/components/admin/catalogue/filters";
import { ProductsTable } from "@/components/admin/catalogue/products-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminPageMetadata } from "@/components/admin/page-meta";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/server/auth/guards";
import { listAdminCategoryOptions } from "@/server/queries/admin-categories";
import { listAdminProducts } from "@/server/queries/admin-products";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata() {
  return adminPageMetadata("Products", "/admin/products");
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const filters = parseCatalogueSearchParams(await searchParams);
  const user = await getCurrentUser();
  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";
  const [result, categories] = await Promise.all([
    listAdminProducts({
      query: filters.query || undefined,
      categoryId: filters.category || undefined,
      status: filters.status === "all" ? undefined : filters.status,
      featured: filters.featured === "all" ? undefined : filters.featured === "yes",
      page: filters.page,
      perPage: CATALOGUE_PAGE_SIZE,
    }),
    listAdminCategoryOptions("PRODUCT"),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Catalogue items customers request quotes for."
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/products", label: "Products" },
        ]}
        actions={
          canEdit ? (
            <Button asChild>
              <Link href={"/admin/products/new" as never}>New product</Link>
            </Button>
          ) : null
        }
      />
      <ProductsTable
        items={result.items}
        total={result.total}
        totalPages={result.totalPages}
        page={result.page}
        filters={filters}
        categories={categories}
        canEdit={canEdit}
      />
    </div>
  );
}
