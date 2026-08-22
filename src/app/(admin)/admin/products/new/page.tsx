import { ProductEditor } from "@/components/admin/catalogue/product-editor";
import { adminPageMetadata } from "@/components/admin/page-meta";
import { getCurrentUser } from "@/server/auth/guards";
import { listAdminCategoryOptions } from "@/server/queries/admin-categories";
import { listAdminProductChoices } from "@/server/queries/admin-products";

export async function generateMetadata() {
  return adminPageMetadata("New product", "/admin/products/new");
}

export default async function NewProductPage() {
  const user = await getCurrentUser();
  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";
  const [categories, relatedChoices] = await Promise.all([
    listAdminCategoryOptions("PRODUCT"),
    listAdminProductChoices(),
  ]);

  return (
    <ProductEditor
      product={null}
      categories={categories}
      relatedChoices={relatedChoices}
      faqs={[]}
      canEdit={canEdit}
    />
  );
}
