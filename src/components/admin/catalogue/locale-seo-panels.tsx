"use client";

import { LocaleTabs } from "@/components/admin/locale-tabs";
import { SeoPanel, type SeoValues } from "@/components/admin/seo-panel";

export function LocaleSeoPanels({
  seoEn,
  seoAr,
  onChangeEn,
  onChangeAr,
}: {
  seoEn: SeoValues;
  seoAr: SeoValues;
  onChangeEn: (patch: Partial<SeoValues>) => void;
  onChangeAr: (patch: Partial<SeoValues>) => void;
}) {
  return (
    <LocaleTabs
      arabicTranslated={Boolean(seoAr.metaTitle || seoAr.metaDescription)}
      english={<SeoPanel values={seoEn} onChange={onChangeEn} />}
      arabic={<SeoPanel values={seoAr} onChange={onChangeAr} />}
    />
  );
}
