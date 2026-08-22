import type { JSONContent } from "@tiptap/react";
import type { ContentStatus } from "@/generated/prisma/enums";

import type { SeoValues } from "@/components/admin/seo-panel";
import {
  emptySeoForm,
  seoToForm,
  seoToPayload,
  toDatetimeLocal,
} from "@/components/admin/catalogue/form-utils";
import { emptyTiptap, type ProcessStep } from "@/lib/catalogue-json";
import { getSiteUrl } from "@/lib/utils/site-url";
import type { ServiceSaveInput } from "@/lib/validations/service";
import type { AdminServiceDetail } from "@/server/queries/admin-services";
import type { AdminMediaRecord } from "@/server/queries/media";

function asDoc(value: unknown): JSONContent | null {
  if (!value || typeof value !== "object") {
    return emptyTiptap as JSONContent;
  }
  return value as JSONContent;
}

export type ServiceFormState = {
  nameEn: string;
  nameAr: string;
  slugEn: string;
  slugAr: string;
  shortEn: string;
  shortAr: string;
  longEn: JSONContent | null;
  longAr: JSONContent | null;
  benefitsEn: string[];
  benefitsAr: string[];
  processStepsEn: ProcessStep[];
  processStepsAr: ProcessStep[];
  heroHeadingEn: string;
  heroHeadingAr: string;
  heroSubheadingEn: string;
  heroSubheadingAr: string;
  ctaLabelEn: string;
  ctaLabelAr: string;
  seoEn: SeoValues;
  seoAr: SeoValues;
  categoryId: string | null;
  status: ContentStatus;
  isFeatured: boolean;
  turnaroundTime: string;
  startingPrice: string;
  iconName: string;
  image: AdminMediaRecord | null;
  heroImage: AdminMediaRecord | null;
  publishedAt: string;
};

export function initialServiceForm(service: AdminServiceDetail | null): ServiceFormState {
  const pageUrl = `${getSiteUrl()}/services/${service?.slugEn || "…"}`;
  const pageUrlAr = `${getSiteUrl()}/ar/services/${service?.slugAr || "…"}`;
  return {
    nameEn: service?.nameEn ?? "",
    nameAr: service?.nameAr ?? "",
    slugEn: service?.slugEn ?? "",
    slugAr: service?.slugAr ?? "",
    shortEn: service?.shortEn ?? "",
    shortAr: service?.shortAr ?? "",
    longEn: asDoc(service?.longEn),
    longAr: asDoc(service?.longAr),
    benefitsEn: service?.benefitsEn ?? [],
    benefitsAr: service?.benefitsAr ?? [],
    processStepsEn: service?.processStepsEn ?? [],
    processStepsAr: service?.processStepsAr ?? [],
    heroHeadingEn: service?.heroHeadingEn ?? "",
    heroHeadingAr: service?.heroHeadingAr ?? "",
    heroSubheadingEn: service?.heroSubheadingEn ?? "",
    heroSubheadingAr: service?.heroSubheadingAr ?? "",
    ctaLabelEn: service?.ctaLabelEn ?? "",
    ctaLabelAr: service?.ctaLabelAr ?? "",
    seoEn: service ? seoToForm(service.seoEn, service.nameEn, pageUrl) : emptySeoForm("", pageUrl),
    seoAr: service ? seoToForm(service.seoAr, service.nameAr, pageUrlAr) : emptySeoForm("", pageUrlAr),
    categoryId: service?.categoryId ?? null,
    status: service?.status ?? "DRAFT",
    isFeatured: service?.isFeatured ?? false,
    turnaroundTime: service?.turnaroundTime ?? "",
    startingPrice: service?.startingPrice ?? "",
    iconName: service?.iconName ?? "",
    image: service?.image ?? null,
    heroImage: service?.heroImage ?? null,
    publishedAt: toDatetimeLocal(service?.publishedAt),
  };
}

export function serviceFormToPayload(id: string | undefined, form: ServiceFormState): ServiceSaveInput {
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
    benefitsEn: form.benefitsEn,
    benefitsAr: form.benefitsAr,
    processStepsEn: form.processStepsEn,
    processStepsAr: form.processStepsAr,
    heroHeadingEn: form.heroHeadingEn,
    heroHeadingAr: form.heroHeadingAr,
    heroSubheadingEn: form.heroSubheadingEn,
    heroSubheadingAr: form.heroSubheadingAr,
    ctaLabelEn: form.ctaLabelEn,
    ctaLabelAr: form.ctaLabelAr,
    seoEn: seoToPayload(form.seoEn),
    seoAr: seoToPayload(form.seoAr),
    categoryId: form.categoryId,
    status: form.status,
    isFeatured: form.isFeatured,
    turnaroundTime: form.turnaroundTime,
    startingPrice: form.startingPrice,
    iconName: form.iconName,
    imageId: form.image?.id ?? null,
    heroImageId: form.heroImage?.id ?? null,
    publishedAt: form.publishedAt,
  };
}
