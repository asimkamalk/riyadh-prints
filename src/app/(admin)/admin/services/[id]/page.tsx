import { notFound } from "next/navigation";

import { ServiceEditor } from "@/components/admin/catalogue/service-editor";
import { adminPageMetadata } from "@/components/admin/page-meta";
import { getCurrentUser } from "@/server/auth/guards";
import { listAdminFaqs } from "@/server/queries/admin";
import { listAdminCategoryOptions } from "@/server/queries/admin-categories";
import { getAdminService } from "@/server/queries/admin-services";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return adminPageMetadata("Edit service", `/admin/services/${id}`);
}

export default async function EditServicePage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";
  const [service, categories, faqs] = await Promise.all([
    getAdminService(id),
    listAdminCategoryOptions("SERVICE"),
    listAdminFaqs({ scope: "SERVICE", entityId: id }),
  ]);
  if (!service) {
    notFound();
  }

  return (
    <ServiceEditor service={service} categories={categories} faqs={faqs} canEdit={canEdit} />
  );
}
