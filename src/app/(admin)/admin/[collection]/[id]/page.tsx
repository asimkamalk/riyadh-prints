import { notFound } from "next/navigation";

import { AdminEntityEditor } from "@/components/admin/admin-entity-editor";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionTable } from "@/components/admin/admin-section-table";
import { adminCollectionMeta } from "@/components/admin/collection-meta";
import { adminNavItemByHref } from "@/components/admin/nav-config";
import { adminPageMetadata } from "@/components/admin/page-meta";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbList } from "@/lib/seo/json-ld";
import { listAdminFaqs } from "@/server/queries/admin";

type EntityPageProps = {
  params: Promise<{ collection: string; id: string }>;
};

export async function generateMetadata({ params }: EntityPageProps) {
  const { collection, id } = await params;
  if (collection === "pages" && id === "builder") {
    return adminPageMetadata("Page Builder", "/admin/pages/builder");
  }
  const item = adminNavItemByHref(`/admin/${collection}`);
  return adminPageMetadata(
    item ? `${item.label} editor` : "Editor",
    `/admin/${collection}/${id}`,
  );
}

export default async function AdminEntityPage({ params }: EntityPageProps) {
  const { collection, id } = await params;
  if (collection === "login") {
    notFound();
  }
  if (collection === "pages" && id === "builder") {
    return (
      <div>
        <AdminPageHeader
          title="Page Builder"
          description="Assemble homepage and landing page sections."
          crumbs={[
            { href: "/admin", label: "Dashboard" },
            { href: "/admin/pages", label: "Pages" },
            { href: "/admin/pages/builder", label: "Page Builder" },
          ]}
        />
        <AdminSectionTable emptyMessage="No page sections yet." />
      </div>
    );
  }
  const nav = adminNavItemByHref(`/admin/${collection}`);
  const meta = adminCollectionMeta[collection];
  if (!nav && !meta) {
    notFound();
  }
  const faqs =
    meta?.faqScope && id
      ? await listAdminFaqs({ scope: meta.faqScope, entityId: id })
      : [];
  const crumbs = [
    { href: "/admin", label: "Dashboard" },
    {
      href: nav?.href ?? `/admin/${collection}`,
      label: nav?.label ?? collection,
    },
    { label: "Edit" },
  ];

  return (
    <div>
      <JsonLd data={breadcrumbList(crumbs)} />
      <AdminEntityEditor
        collection={collection}
        id={id}
        title={nav ? `Edit ${nav.label.replace(/s$/, "")}` : "Edit"}
        faqs={faqs}
      />
    </div>
  );
}
