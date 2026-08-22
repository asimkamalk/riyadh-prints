import { notFound } from "next/navigation";

import { CategoryEditor } from "@/components/admin/catalogue/category-editor";
import { adminPageMetadata } from "@/components/admin/page-meta";
import { getCurrentUser } from "@/server/auth/guards";
import { listAdminFaqs } from "@/server/queries/admin";
import { getAdminCategory, listAdminCategoryOptions } from "@/server/queries/admin-categories";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return adminPageMetadata("Edit category", `/admin/categories/${id}`);
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";
  const [category, parents, faqs] = await Promise.all([
    getAdminCategory(id),
    listAdminCategoryOptions("PRODUCT"),
    listAdminFaqs({ scope: "CATEGORY", entityId: id }),
  ]);
  if (!category) {
    notFound();
  }

  return <CategoryEditor category={category} parents={parents} faqs={faqs} canEdit={canEdit} />;
}
