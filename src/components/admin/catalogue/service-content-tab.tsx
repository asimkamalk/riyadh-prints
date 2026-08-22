"use client";

import type { JSONContent } from "@tiptap/react";

import { ProcessStepsEditor } from "@/components/admin/catalogue/process-steps";
import { StringListEditor } from "@/components/admin/catalogue/string-list";
import { LocaleTabs } from "@/components/admin/locale-tabs";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SlugInput } from "@/components/admin/slug-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProcessStep } from "@/lib/catalogue-json";

export type ServiceContentValues = {
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
};

export function ServiceContentTab({
  values,
  excludeId,
  published,
  onChange,
}: {
  values: ServiceContentValues;
  excludeId?: string;
  published: boolean;
  onChange: (patch: Partial<ServiceContentValues>) => void;
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
          benefitsAr: values.benefitsEn,
          processStepsAr: values.processStepsEn,
          heroHeadingAr: values.heroHeadingEn,
          heroSubheadingAr: values.heroSubheadingEn,
          ctaLabelAr: values.ctaLabelEn,
        })
      }
      english={<ServiceLocaleFields locale="en" values={values} excludeId={excludeId} published={published} onChange={onChange} />}
      arabic={<ServiceLocaleFields locale="ar" values={values} excludeId={excludeId} published={published} onChange={onChange} />}
    />
  );
}

function ServiceLocaleFields({
  locale,
  values,
  excludeId,
  published,
  onChange,
}: {
  locale: "en" | "ar";
  values: ServiceContentValues;
  excludeId?: string;
  published: boolean;
  onChange: (patch: Partial<ServiceContentValues>) => void;
}) {
  const isEn = locale === "en";
  return (
    <div className="grid gap-4" dir={isEn ? undefined : "rtl"}>
      <div className="grid gap-2">
        <Label>{isEn ? "Name" : "الاسم"}</Label>
        <Input
          value={isEn ? values.nameEn : values.nameAr}
          onChange={(event) => onChange(isEn ? { nameEn: event.target.value } : { nameAr: event.target.value })}
        />
      </div>
      <SlugInput
        title={(isEn ? values.nameEn : values.nameAr) || values.nameEn}
        value={isEn ? values.slugEn : values.slugAr}
        onChange={(slug) => onChange(isEn ? { slugEn: slug } : { slugAr: slug })}
        locale={locale}
        model="service"
        pathPrefix="/services"
        excludeId={excludeId}
        published={published}
      />
      <div className="grid gap-2">
        <Label>{isEn ? "Short description" : "وصف مختصر"}</Label>
        <Textarea
          rows={3}
          value={isEn ? values.shortEn : values.shortAr}
          onChange={(event) => onChange(isEn ? { shortEn: event.target.value } : { shortAr: event.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label>{isEn ? "Long description" : "الوصف الطويل"}</Label>
        <RichTextEditor
          value={isEn ? values.longEn : values.longAr}
          onChange={(doc) => onChange(isEn ? { longEn: doc } : { longAr: doc })}
        />
      </div>
      <StringListEditor
        label={isEn ? "Benefits" : "المزايا"}
        rows={isEn ? values.benefitsEn : values.benefitsAr}
        onChange={(rows) => onChange(isEn ? { benefitsEn: rows } : { benefitsAr: rows })}
      />
      <ProcessStepsEditor
        label={isEn ? "Process steps" : "خطوات العمل"}
        rows={isEn ? values.processStepsEn : values.processStepsAr}
        onChange={(rows) => onChange(isEn ? { processStepsEn: rows } : { processStepsAr: rows })}
      />
      <div className="grid gap-2">
        <Label>{isEn ? "Hero heading" : "عنوان البطل"}</Label>
        <Input
          value={isEn ? values.heroHeadingEn : values.heroHeadingAr}
          onChange={(event) =>
            onChange(isEn ? { heroHeadingEn: event.target.value } : { heroHeadingAr: event.target.value })
          }
        />
      </div>
      <div className="grid gap-2">
        <Label>{isEn ? "Hero subheading" : "العنوان الفرعي"}</Label>
        <Textarea
          rows={2}
          value={isEn ? values.heroSubheadingEn : values.heroSubheadingAr}
          onChange={(event) =>
            onChange(isEn ? { heroSubheadingEn: event.target.value } : { heroSubheadingAr: event.target.value })
          }
        />
      </div>
      <div className="grid gap-2">
        <Label>{isEn ? "CTA label" : "نص الزر"}</Label>
        <Input
          value={isEn ? values.ctaLabelEn : values.ctaLabelAr}
          onChange={(event) =>
            onChange(isEn ? { ctaLabelEn: event.target.value } : { ctaLabelAr: event.target.value })
          }
        />
      </div>
    </div>
  );
}
