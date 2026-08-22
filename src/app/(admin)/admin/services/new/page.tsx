import { ServiceEditor } from "@/components/admin/catalogue/service-editor";
import { adminPageMetadata } from "@/components/admin/page-meta";
import { getCurrentUser } from "@/server/auth/guards";
import { listAdminCategoryOptions } from "@/server/queries/admin-categories";

export async function generateMetadata() {
  return adminPageMetadata("New service", "/admin/services/new");
}

export default async function NewServicePage() {
  const user = await getCurrentUser();
  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";
  const categories = await listAdminCategoryOptions("SERVICE");

  return <ServiceEditor service={null} categories={categories} faqs={[]} canEdit={canEdit} />;
}
