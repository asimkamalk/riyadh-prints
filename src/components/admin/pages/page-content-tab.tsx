"use client";

import { LocaleTabs } from "@/components/admin/locale-tabs";
import { SlugInput } from "@/components/admin/slug-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type PageContentValues = {
  titleEn: string;
  titleAr: string;
  slugEn: string;
  slugAr: string;
  excerptEn: string;
  excerptAr: string;
};

export function PageContentTab({
  values,
  excludeId,
  published,
  pathPrefix,
  onChange,
}: {
  values: PageContentValues;
  excludeId?: string;
  published: boolean;
  pathPrefix: string;
  onChange: (patch: Partial<PageContentValues>) => void;
}) {
  return (
    <LocaleTabs
      arabicTranslated={Boolean(values.titleAr.trim())}
      onCopyFromEnglish={() =>
        onChange({
          titleAr: values.titleEn,
          slugAr: values.slugEn,
          excerptAr: values.excerptEn,
        })
      }
      english={
        <div className="grid gap-4">
          <Field label="Title" id="page-title-en" value={values.titleEn} onChange={(titleEn) => onChange({ titleEn })} />
          <SlugInput
            title={values.titleEn}
            value={values.slugEn}
            onChange={(slugEn) => onChange({ slugEn })}
            model="page"
            pathPrefix={pathPrefix}
            excludeId={excludeId}
            published={published}
          />
          <Area label="Excerpt" id="page-excerpt-en" value={values.excerptEn} onChange={(excerptEn) => onChange({ excerptEn })} />
        </div>
      }
      arabic={
        <div className="grid gap-4">
          <Field label="العنوان" id="page-title-ar" value={values.titleAr} onChange={(titleAr) => onChange({ titleAr })} />
          <SlugInput
            title={values.titleAr || values.titleEn}
            value={values.slugAr}
            onChange={(slugAr) => onChange({ slugAr })}
            locale="ar"
            model="page"
            pathPrefix={pathPrefix}
            excludeId={excludeId}
            published={published}
          />
          <Area label="المقتطف" id="page-excerpt-ar" value={values.excerptAr} onChange={(excerptAr) => onChange({ excerptAr })} />
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
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} rows={4} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
