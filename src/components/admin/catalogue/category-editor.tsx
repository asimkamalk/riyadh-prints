"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { CategoryContentTab } from "@/components/admin/catalogue/category-content-tab";
import { CategorySettingsTab } from "@/components/admin/catalogue/category-settings-tab";
import { emptySeoForm, seoToForm, seoToPayload } from "@/components/admin/catalogue/form-utils";
import { LocaleSeoPanels } from "@/components/admin/catalogue/locale-seo-panels";
import { EntityForm, type EntitySaveResult } from "@/components/admin/entity-form";
import { FaqEditor } from "@/components/admin/faq-editor";
import type { SeoValues } from "@/components/admin/seo-panel";
import type { ContentStatus } from "@/generated/prisma/enums";
import { getSiteUrl } from "@/lib/utils/site-url";
import { saveCategory } from "@/server/actions/category";
import { createPreviewUrl } from "@/server/actions/preview";
import type { AdminFaqRow } from "@/server/queries/admin";
import type { AdminCategoryDetail, AdminCategoryOption } from "@/server/queries/admin-categories";
import type { AdminMediaRecord } from "@/server/queries/media";

type CategoryForm = {
  nameEn: string;
  nameAr: string;
  slugEn: string;
  slugAr: string;
  shortEn: string;
  shortAr: string;
  longEn: string;
  longAr: string;
  heroHeadingEn: string;
  heroHeadingAr: string;
  heroSubheadingEn: string;
  heroSubheadingAr: string;
  seoEn: SeoValues;
  seoAr: SeoValues;
  status: ContentStatus;
  isFeatured: boolean;
  parentId: string | null;
  sortOrder: string;
  iconName: string;
  image: AdminMediaRecord | null;
};

function initial(category: AdminCategoryDetail | null): CategoryForm {
  const pageUrl = `${getSiteUrl()}/product-category/${category?.slugEn || "…"}`;
  const pageUrlAr = `${getSiteUrl()}/ar/product-category/${category?.slugAr || "…"}`;
  return {
    nameEn: category?.nameEn ?? "",
    nameAr: category?.nameAr ?? "",
    slugEn: category?.slugEn ?? "",
    slugAr: category?.slugAr ?? "",
    shortEn: category?.shortEn ?? "",
    shortAr: category?.shortAr ?? "",
    longEn: category?.longEn ?? "",
    longAr: category?.longAr ?? "",
    heroHeadingEn: category?.heroHeadingEn ?? "",
    heroHeadingAr: category?.heroHeadingAr ?? "",
    heroSubheadingEn: category?.heroSubheadingEn ?? "",
    heroSubheadingAr: category?.heroSubheadingAr ?? "",
    seoEn: category ? seoToForm(category.seoEn, category.nameEn, pageUrl) : emptySeoForm("", pageUrl),
    seoAr: category ? seoToForm(category.seoAr, category.nameAr, pageUrlAr) : emptySeoForm("", pageUrlAr),
    status: category?.status ?? "DRAFT",
    isFeatured: category?.isFeatured ?? false,
    parentId: category?.parentId ?? null,
    sortOrder: String(category?.sortOrder ?? 0),
    iconName: category?.iconName ?? "",
    image: category?.image ?? null,
  };
}

export function CategoryEditor({
  category,
  parents,
  faqs,
  canEdit,
}: {
  category: AdminCategoryDetail | null;
  parents: AdminCategoryOption[];
  faqs: AdminFaqRow[];
  canEdit: boolean;
}) {
  const id = category?.id;
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState(() => initial(category));
  const productCount = category?.productCount ?? 0;

  function patch(next: Partial<CategoryForm>) {
    setDirty(true);
    setForm((current) => ({ ...current, ...next }));
  }

  const onSave = useCallback(async (): Promise<EntitySaveResult> => {
    if (!canEdit) {
      return { ok: false, error: "You do not have permission to save." };
    }
    if (!form.nameEn.trim()) {
      toast.error("English name is required.");
      return { ok: false, error: "English name is required." };
    }
    const result = await saveCategory({
      id,
      kind: "PRODUCT",
      nameEn: form.nameEn,
      nameAr: form.nameAr,
      slugEn: form.slugEn,
      slugAr: form.slugAr,
      shortEn: form.shortEn,
      shortAr: form.shortAr,
      longEn: form.longEn,
      longAr: form.longAr,
      heroHeadingEn: form.heroHeadingEn,
      heroHeadingAr: form.heroHeadingAr,
      heroSubheadingEn: form.heroSubheadingEn,
      heroSubheadingAr: form.heroSubheadingAr,
      seoEn: seoToPayload(form.seoEn),
      seoAr: seoToPayload(form.seoAr),
      status: form.status,
      isFeatured: form.isFeatured,
      parentId: form.parentId,
      sortOrder: Number(form.sortOrder) || 0,
      iconName: form.iconName,
      imageId: form.image?.id ?? null,
    });
    if (!result.ok) {
      return result;
    }
    setDirty(false);
    const preview = await createPreviewUrl({ type: "category", id: result.data.id });
    return {
      ok: true,
      id: result.data.id,
      editHref: `/admin/categories/${result.data.id}`,
      previewUrl: preview.ok ? preview.data.url : undefined,
    };
  }, [canEdit, form, id]);

  return (
    <EntityForm
      title={id ? `Edit ${form.nameEn || "category"}` : "New category"}
      isDirty={dirty}
      onSave={onSave}
      listHref="/admin/categories"
      readOnly={!canEdit}
      autosaveMs={id && canEdit ? 8000 : 0}
      slots={{
        content: (
          <CategoryContentTab
            values={form}
            excludeId={id}
            published={form.status === "PUBLISHED"}
            onChange={patch}
          />
        ),
        seo: (
          <LocaleSeoPanels
            seoEn={{ ...form.seoEn, pageTitle: form.nameEn, pageUrl: `${getSiteUrl()}/product-category/${form.slugEn || "…"}` }}
            seoAr={{
              ...form.seoAr,
              pageTitle: form.nameAr || form.nameEn,
              pageUrl: `${getSiteUrl()}/ar/product-category/${form.slugAr || "…"}`,
            }}
            onChangeEn={(seoPatch) => patch({ seoEn: { ...form.seoEn, ...seoPatch } })}
            onChangeAr={(seoPatch) => patch({ seoAr: { ...form.seoAr, ...seoPatch } })}
          />
        ),
        faqs: id ? (
          <FaqEditor scope="CATEGORY" entityId={id} items={faqs} />
        ) : (
          <p className="text-sm text-muted-foreground">Save the category first to add FAQs.</p>
        ),
        settings: (
          <CategorySettingsTab
            slugEn={form.slugEn}
            status={form.status}
            isFeatured={form.isFeatured}
            parentId={form.parentId}
            sortOrder={form.sortOrder}
            iconName={form.iconName}
            image={form.image}
            productCount={productCount}
            excludeId={id}
            parents={parents}
            onChange={patch}
          />
        ),
      }}
    />
  );
}
