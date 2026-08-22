import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionTable } from "@/components/admin/admin-section-table";
import { adminNavItemByHref } from "@/components/admin/nav-config";
import { adminPageMetadata } from "@/components/admin/page-meta";

type CollectionPageProps = {
  params: Promise<{ collection: string }>;
};

export async function generateMetadata({ params }: CollectionPageProps) {
  const { collection } = await params;
  const item = adminNavItemByHref(`/admin/${collection}`);
  if (!item) {
    return adminPageMetadata("Admin", `/admin/${collection}`);
  }
  return adminPageMetadata(item.label, item.href);
}

export default async function AdminCollectionPage({ params }: CollectionPageProps) {
  const { collection } = await params;
  if (collection === "login") {
    notFound();
  }
  const href = `/admin/${collection}`;
  const item = adminNavItemByHref(href);
  if (!item || item.href !== href) {
    notFound();
  }

  return (
    <div>
      <AdminPageHeader
        title={item.label}
        description={`Manage ${item.label.toLowerCase()}.`}
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: item.href, label: item.label },
        ]}
      />
      <AdminSectionTable emptyMessage={`No ${item.label.toLowerCase()} yet.`} />
    </div>
  );
}
