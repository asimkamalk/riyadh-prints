"use client";

import { LocaleTabs } from "@/components/admin/locale-tabs";
import { SlugInput } from "@/components/admin/slug-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type CategoryContentValues = {
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
};

export function CategoryContentTab({
  values,
  excludeId,
  published,
  onChange,
}: {
  values: CategoryContentValues;
  excludeId?: string;
  published: boolean;
  onChange: (patch: Partial<CategoryContentValues>) => void;
}) {
  return (
    <LocaleTabs
      arabicTranslated={Boolean(values.nameAr.trim())}
      onCopyFromEnglish={() =>
        onChange({
          nameAr: values.nameEn,
          slugAr: values.slugEn,
          shortAr: values.shortEn,
          longAr: values.longEn,
          heroHeadingAr: values.heroHeadingEn,
          heroSubheadingAr: values.heroSubheadingEn,
        })
      }
      english={
        <div className="grid gap-4">
          <Field label="Name" id="cat-name-en" value={values.nameEn} onChange={(nameEn) => onChange({ nameEn })} />
          <SlugInput
            title={values.nameEn}
            value={values.slugEn}
            onChange={(slugEn) => onChange({ slugEn })}
            model="category"
            pathPrefix="/product-category"
            excludeId={excludeId}
            published={published}
          />
          <Area label="Short description" id="cat-short-en" value={values.shortEn} onChange={(shortEn) => onChange({ shortEn })} />
          <Area label="Long description" id="cat-long-en" value={values.longEn} rows={6} onChange={(longEn) => onChange({ longEn })} />
          <Field label="Hero heading" id="cat-hero-en" value={values.heroHeadingEn} onChange={(heroHeadingEn) => onChange({ heroHeadingEn })} />
          <Area label="Hero subheading" id="cat-sub-en" value={values.heroSubheadingEn} onChange={(heroSubheadingEn) => onChange({ heroSubheadingEn })} />
        </div>
      }
      arabic={
        <div className="grid gap-4" dir="rtl">
          <Field label="الاسم" id="cat-name-ar" value={values.nameAr} onChange={(nameAr) => onChange({ nameAr })} />
          <SlugInput
            title={values.nameAr || values.nameEn}
            value={values.slugAr}
            onChange={(slugAr) => onChange({ slugAr })}
            locale="ar"
            model="category"
            pathPrefix="/product-category"
            excludeId={excludeId}
            published={published}
          />
          <Area label="وصف مختصر" id="cat-short-ar" value={values.shortAr} onChange={(shortAr) => onChange({ shortAr })} />
          <Area label="الوصف الطويل" id="cat-long-ar" value={values.longAr} rows={6} onChange={(longAr) => onChange({ longAr })} />
          <Field label="عنوان البطل" id="cat-hero-ar" value={values.heroHeadingAr} onChange={(heroHeadingAr) => onChange({ heroHeadingAr })} />
          <Area label="العنوان الفرعي" id="cat-sub-ar" value={values.heroSubheadingAr} onChange={(heroSubheadingAr) => onChange({ heroSubheadingAr })} />
        </div>
      }
    />
  );
}

function Field({
  label,
  id,
  value,
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function Area({
  label,
  id,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
