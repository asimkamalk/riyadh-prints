import { notFound } from "next/navigation";

import { ProductEditor } from "@/components/admin/catalogue/product-editor";
import { adminPageMetadata } from "@/components/admin/page-meta";
import { getCurrentUser } from "@/server/auth/guards";
import { listAdminFaqs } from "@/server/queries/admin";
import { listAdminCategoryOptions } from "@/server/queries/admin-categories";
import { getAdminProduct, listAdminProductChoices } from "@/server/queries/admin-products";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return adminPageMetadata("Edit product", `/admin/products/${id}`);
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";
  const [product, categories, relatedChoices, faqs] = await Promise.all([
    getAdminProduct(id),
    listAdminCategoryOptions("PRODUCT"),
    listAdminProductChoices(id),
    listAdminFaqs({ scope: "PRODUCT", entityId: id }),
  ]);
  if (!product) {
    notFound();
  }

  return (
    <ProductEditor
      product={product}
      categories={categories}
      relatedChoices={relatedChoices}
      faqs={faqs}
      canEdit={canEdit}
    />
  );
}
