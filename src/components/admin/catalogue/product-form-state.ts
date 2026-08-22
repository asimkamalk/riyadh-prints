import type { JSONContent } from "@tiptap/react";
import type { ContentStatus } from "@/generated/prisma/enums";

import type { SeoValues } from "@/components/admin/seo-panel";
import type { GalleryItem } from "@/components/admin/catalogue/product-media-tab";
import type { OptionDraft } from "@/components/admin/catalogue/product-options-tab";
import type { PriceTierRow } from "@/components/admin/catalogue/product-pricing-tab";
import {
  emptySeoForm,
  parseOptionalInt,
  seoToForm,
  seoToPayload,
  toDatetimeLocal,
} from "@/components/admin/catalogue/form-utils";
import { emptyTiptap, type KvRow } from "@/lib/catalogue-json";
import { slugFromTitle } from "@/lib/slug";
import { getSiteUrl } from "@/lib/utils/site-url";
import type { ProductSaveInput } from "@/lib/validations/product";
import type { AdminProductDetail } from "@/server/queries/admin-products";

function asDoc(value: unknown): JSONContent | null {
  if (!value || typeof value !== "object") {
    return emptyTiptap as JSONContent;
  }
  return value as JSONContent;
}

export type ProductFormState = {
  nameEn: string;
  nameAr: string;
  slugEn: string;
  slugAr: string;
  shortEn: string;
  shortAr: string;
  longEn: JSONContent | null;
  longAr: JSONContent | null;
  specificationsEn: KvRow[];
  specificationsAr: KvRow[];
  materialsEn: string[];
  materialsAr: string[];
  useCasesEn: string[];
  useCasesAr: string[];
  seoEn: SeoValues;
  seoAr: SeoValues;
  images: GalleryItem[];
  basePrice: string;
  priceUnit: string;
  minOrderQty: string;
  tiers: PriceTierRow[];
  options: OptionDraft[];
  categoryId: string | null;
  relatedProductIds: string[];
  status: ContentStatus;
  isFeatured: boolean;
  isNew: boolean;
  includesDesign: boolean;
  sameDayAvailable: boolean;
  turnaroundDays: string;
  sku: string;
  publishedAt: string;
};

export function initialProductForm(product: AdminProductDetail | null): ProductFormState {
  const slugEn = product?.slugEn ?? "";
  const slugAr = product?.slugAr ?? "";
  const pageUrl = `${getSiteUrl()}/product/${slugEn || "…"}`;
  const pageUrlAr = `${getSiteUrl()}/ar/product/${slugAr || "…"}`;
  return {
    nameEn: product?.nameEn ?? "",
    nameAr: product?.nameAr ?? "",
    slugEn,
    slugAr,
    shortEn: product?.shortEn ?? "",
    shortAr: product?.shortAr ?? "",
    longEn: asDoc(product?.longEn),
    longAr: asDoc(product?.longAr),
    specificationsEn: product?.specificationsEn ?? [],
    specificationsAr: product?.specificationsAr ?? [],
    materialsEn: product?.materialsEn ?? [],
    materialsAr: product?.materialsAr ?? [],
    useCasesEn: product?.useCasesEn ?? [],
    useCasesAr: product?.useCasesAr ?? [],
    seoEn: product ? seoToForm(product.seoEn, product.nameEn, pageUrl) : emptySeoForm("", pageUrl),
    seoAr: product ? seoToForm(product.seoAr, product.nameAr, pageUrlAr) : emptySeoForm("", pageUrlAr),
    images:
      product?.images.map((image) => ({
        id: image.mediaId,
        mediaId: image.mediaId,
        isPrimary: image.isPrimary,
        media: image.media,
      })) ?? [],
    basePrice: product?.basePrice ?? "",
    priceUnit: product?.priceUnit ?? "",
    minOrderQty: product?.minOrderQty ? String(product.minOrderQty) : "",
    tiers:
      product?.priceTiers.map((tier) => ({
        minQty: String(tier.minQty),
        maxQty: tier.maxQty ? String(tier.maxQty) : "",
        unitPrice: tier.unitPrice,
      })) ?? [],
    options:
      product?.options.map((option) => ({
        id: option.id,
        key: option.key,
        labelEn: option.labelEn,
        labelAr: option.labelAr,
        values: option.values.map((value) => ({
          id: value.id,
          value: value.value,
          priceModifier: value.priceModifier,
          labelEn: value.labelEn,
          labelAr: value.labelAr,
        })),
      })) ?? [],
    categoryId: product?.categoryId ?? null,
    relatedProductIds: product?.relatedProductIds ?? [],
    status: product?.status ?? "DRAFT",
    isFeatured: product?.isFeatured ?? false,
    isNew: product?.isNew ?? false,
    includesDesign: product?.includesDesign ?? false,
    sameDayAvailable: product?.sameDayAvailable ?? false,
    turnaroundDays: product?.turnaroundDays != null ? String(product.turnaroundDays) : "",
    sku: product?.sku ?? "",
    publishedAt: toDatetimeLocal(product?.publishedAt),
  };
}

export function productFormToPayload(id: string | undefined, form: ProductFormState): ProductSaveInput {
  return {
    id,
    nameEn: form.nameEn,
    nameAr: form.nameAr,
    slugEn: form.slugEn,
    slugAr: form.slugAr,
    shortEn: form.shortEn,
    shortAr: form.shortAr,
    longEn: form.longEn,
    longAr: form.longAr,
    specificationsEn: form.specificationsEn,
    specificationsAr: form.specificationsAr,
    materialsEn: form.materialsEn,
    materialsAr: form.materialsAr,
    useCasesEn: form.useCasesEn,
    useCasesAr: form.useCasesAr,
    seoEn: seoToPayload(form.seoEn),
    seoAr: seoToPayload(form.seoAr),
    images: form.images.map((image, sortOrder) => ({
      mediaId: image.mediaId,
      sortOrder,
      isPrimary: image.isPrimary,
    })),
    basePrice: form.basePrice,
    priceUnit: form.priceUnit,
    minOrderQty: parseOptionalInt(form.minOrderQty),
    priceTiers: form.tiers
      .filter((tier) => tier.minQty && tier.unitPrice)
      .map((tier) => ({
        minQty: Number(tier.minQty),
        maxQty: tier.maxQty ? Number(tier.maxQty) : null,
        unitPrice: tier.unitPrice,
      })),
    options: form.options
      .filter((option) => option.labelEn.trim())
      .map((option, sortOrder) => ({
        id: option.id.startsWith("tmp-") ? undefined : option.id,
        key: option.key.trim() || slugFromTitle(option.labelEn),
        sortOrder,
        labelEn: option.labelEn,
        labelAr: option.labelAr,
        values: option.values
          .filter((value) => value.labelEn.trim())
          .map((value, valueOrder) => ({
            id: value.id.startsWith("tmp-") ? undefined : value.id,
            value: value.value.trim() || slugFromTitle(value.labelEn),
            priceModifier: value.priceModifier || "0",
            sortOrder: valueOrder,
            labelEn: value.labelEn,
            labelAr: value.labelAr,
          })),
      })),
    relatedProductIds: form.relatedProductIds,
    sku: form.sku,
    categoryId: form.categoryId,
    status: form.status,
    isFeatured: form.isFeatured,
    isNew: form.isNew,
    includesDesign: form.includesDesign,
    sameDayAvailable: form.sameDayAvailable,
    turnaroundDays: parseOptionalInt(form.turnaroundDays),
    publishedAt: form.publishedAt,
  };
}
