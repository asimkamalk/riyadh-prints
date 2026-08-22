"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { LocaleSeoPanels } from "@/components/admin/catalogue/locale-seo-panels";
import { ProductContentTab } from "@/components/admin/catalogue/product-content-tab";
import { ProductMediaTab } from "@/components/admin/catalogue/product-media-tab";
import { ProductOptionsTab } from "@/components/admin/catalogue/product-options-tab";
import { ProductPricingTab } from "@/components/admin/catalogue/product-pricing-tab";
import { ProductSettingsTab } from "@/components/admin/catalogue/product-settings-tab";
import {
  initialProductForm,
  productFormToPayload,
  type ProductFormState,
} from "@/components/admin/catalogue/product-form-state";
import { EntityForm, type EntitySaveResult } from "@/components/admin/entity-form";
import { FaqEditor } from "@/components/admin/faq-editor";
import { getSiteUrl } from "@/lib/utils/site-url";
import { createPreviewUrl } from "@/server/actions/preview";
import { saveProduct } from "@/server/actions/product";
import type { AdminFaqRow } from "@/server/queries/admin";
import type { AdminCategoryOption } from "@/server/queries/admin-categories";
import type { AdminNamedOption, AdminProductDetail } from "@/server/queries/admin-products";

export function ProductEditor({
  product,
  categories,
  relatedChoices,
  faqs,
  canEdit,
}: {
  product: AdminProductDetail | null;
  categories: AdminCategoryOption[];
  relatedChoices: AdminNamedOption[];
  faqs: AdminFaqRow[];
  canEdit: boolean;
}) {
  const id = product?.id;
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState<ProductFormState>(() => initialProductForm(product));

  function patch(next: Partial<ProductFormState>) {
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
    const result = await saveProduct(productFormToPayload(id, form));
    if (!result.ok) {
      return result;
    }
    setDirty(false);
    const preview = await createPreviewUrl({ type: "product", id: result.data.id });
    return {
      ok: true,
      id: result.data.id,
      editHref: `/admin/products/${result.data.id}`,
      previewUrl: preview.ok ? preview.data.url : undefined,
    };
  }, [canEdit, form, id]);

  return (
    <EntityForm
      title={id ? `Edit ${form.nameEn || "product"}` : "New product"}
      isDirty={dirty}
      onSave={onSave}
      listHref="/admin/products"
      readOnly={!canEdit}
      autosaveMs={id && canEdit ? 8000 : 0}
      slots={{
        content: (
          <ProductContentTab
            excludeId={id}
            published={form.status === "PUBLISHED"}
            values={form}
            onChange={patch}
          />
        ),
        media: <ProductMediaTab images={form.images} onChange={(images) => patch({ images })} />,
        pricing: (
          <ProductPricingTab
            basePrice={form.basePrice}
            priceUnit={form.priceUnit}
            minOrderQty={form.minOrderQty}
            tiers={form.tiers}
            onChange={patch}
          />
        ),
        options: <ProductOptionsTab options={form.options} onChange={(options) => patch({ options })} />,
        seo: (
          <LocaleSeoPanels
            seoEn={{ ...form.seoEn, pageTitle: form.nameEn, pageUrl: `${getSiteUrl()}/product/${form.slugEn || "…"}` }}
            seoAr={{
              ...form.seoAr,
              pageTitle: form.nameAr || form.nameEn,
              pageUrl: `${getSiteUrl()}/ar/product/${form.slugAr || "…"}`,
            }}
            onChangeEn={(seoPatch) => patch({ seoEn: { ...form.seoEn, ...seoPatch } })}
            onChangeAr={(seoPatch) => patch({ seoAr: { ...form.seoAr, ...seoPatch } })}
          />
        ),
        faqs: id ? (
          <FaqEditor scope="PRODUCT" entityId={id} items={faqs} />
        ) : (
          <p className="text-sm text-muted-foreground">Save the product first to add FAQs.</p>
        ),
        settings: (
          <ProductSettingsTab
            categories={categories}
            products={relatedChoices}
            values={form}
            onChange={patch}
          />
        ),
      }}
    />
  );
}
