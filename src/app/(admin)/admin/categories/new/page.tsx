import { CategoryEditor } from "@/components/admin/catalogue/category-editor";
import { adminPageMetadata } from "@/components/admin/page-meta";
import { getCurrentUser } from "@/server/auth/guards";
import { listAdminCategoryOptions } from "@/server/queries/admin-categories";

export async function generateMetadata() {
  return adminPageMetadata("New category", "/admin/categories/new");
}

export default async function NewCategoryPage() {
  const user = await getCurrentUser();
  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";
  const parents = await listAdminCategoryOptions("PRODUCT");

  return <CategoryEditor category={null} parents={parents} faqs={[]} canEdit={canEdit} />;
}
