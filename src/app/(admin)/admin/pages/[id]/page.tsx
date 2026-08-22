import { notFound, redirect } from "next/navigation";

import { PageEditor } from "@/components/admin/pages/page-editor";
import { adminPageMetadata } from "@/components/admin/page-meta";
import { getCurrentUser } from "@/server/auth/guards";
import { listAdminFaqs } from "@/server/queries/admin";
import { getAdminPage, listAdminPageOptions } from "@/server/queries/admin-pages";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  if (id === "builder") {
    return adminPageMetadata("Pages", "/admin/pages");
  }
  return adminPageMetadata("Edit page", `/admin/pages/${id}`);
}

export default async function EditPagePage({ params }: PageProps) {
  const { id } = await params;
  if (id === "builder") {
    redirect("/admin/pages");
  }
  const user = await getCurrentUser();
  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";
  const [page, parents, faqs] = await Promise.all([
    getAdminPage(id),
    listAdminPageOptions(id),
    listAdminFaqs({ scope: "PAGE", entityId: id }),
  ]);
  if (!page) {
    notFound();
  }

  return <PageEditor page={page} parents={parents} faqs={faqs} canEdit={canEdit} />;
}
