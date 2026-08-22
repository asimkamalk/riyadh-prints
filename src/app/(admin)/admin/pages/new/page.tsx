import { PageEditor } from "@/components/admin/pages/page-editor";
import { adminPageMetadata } from "@/components/admin/page-meta";
import { getCurrentUser } from "@/server/auth/guards";
import { listAdminPageOptions } from "@/server/queries/admin-pages";

export async function generateMetadata() {
  return adminPageMetadata("New page", "/admin/pages/new");
}

export default async function NewPagePage() {
  const user = await getCurrentUser();
  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";
  const parents = await listAdminPageOptions();

  return <PageEditor page={null} parents={parents} faqs={[]} canEdit={canEdit} />;
}
