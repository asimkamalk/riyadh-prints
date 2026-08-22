import Link from "next/link";

import {
  CATALOGUE_PAGE_SIZE,
  parseCatalogueSearchParams,
} from "@/components/admin/catalogue/filters";
import { ServicesTable } from "@/components/admin/catalogue/services-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminPageMetadata } from "@/components/admin/page-meta";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/server/auth/guards";
import { listAdminServices } from "@/server/queries/admin-services";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata() {
  return adminPageMetadata("Services", "/admin/services");
}

export default async function AdminServicesPage({ searchParams }: PageProps) {
  const filters = parseCatalogueSearchParams(await searchParams);
  const user = await getCurrentUser();
  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";
  const result = await listAdminServices({
    query: filters.query || undefined,
    status: filters.status === "all" ? undefined : filters.status,
    featured: filters.featured === "all" ? undefined : filters.featured === "yes",
    page: filters.page,
    perPage: CATALOGUE_PAGE_SIZE,
  });

  return (
    <div>
      <AdminPageHeader
        title="Services"
        description="Design, production, and finishing services."
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/services", label: "Services" },
        ]}
        actions={
          canEdit ? (
            <Button asChild>
              <Link href={"/admin/services/new" as never}>New service</Link>
            </Button>
          ) : null
        }
      />
      <ServicesTable
        items={result.items}
        total={result.total}
        totalPages={result.totalPages}
        page={result.page}
        filters={filters}
        canEdit={canEdit}
      />
    </div>
  );
}
