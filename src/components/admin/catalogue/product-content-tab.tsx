"use client";

import type { JSONContent } from "@tiptap/react";

import { KvRowsEditor } from "@/components/admin/catalogue/kv-rows";
import { StringListEditor } from "@/components/admin/catalogue/string-list";
import { LocaleTabs } from "@/components/admin/locale-tabs";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SlugInput } from "@/components/admin/slug-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { KvRow } from "@/lib/catalogue-json";

export type ProductContentValues = {
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
};

export function ProductContentTab({
  values,
  excludeId,
  published,
  onChange,
}: {
  values: ProductContentValues;
  excludeId?: string;
  published: boolean;
  onChange: (patch: Partial<ProductContentValues>) => void;
}) {
  return (
    <div className="grid gap-6">
      <LocaleTabs
        arabicTranslated={Boolean(values.nameAr.trim())}
        onCopyFromEnglish={() =>
          onChange({
            nameAr: values.nameEn,
            slugAr: values.slugEn,
            shortAr: values.shortEn,
            longAr: values.longEn,
            specificationsAr: values.specificationsEn,
            materialsAr: values.materialsEn,
            useCasesAr: values.useCasesEn,
          })
        }
        english={
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="product-name-en">Name</Label>
              <Input
                id="product-name-en"
                value={values.nameEn}
                onChange={(event) => onChange({ nameEn: event.target.value })}
              />
            </div>
            <SlugInput
              title={values.nameEn}
              value={values.slugEn}
              onChange={(slugEn) => onChange({ slugEn })}
              model="product"
              pathPrefix="/product"
              excludeId={excludeId}
              published={published}
            />
            <div className="grid gap-2">
              <Label htmlFor="product-short-en">Short description</Label>
              <Textarea
                id="product-short-en"
                rows={3}
                value={values.shortEn}
                onChange={(event) => onChange({ shortEn: event.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Long description</Label>
              <RichTextEditor
                value={values.longEn}
                onChange={(longEn) => onChange({ longEn })}
              />
            </div>
            <KvRowsEditor
              label="Specifications"
              rows={values.specificationsEn}
              onChange={(specificationsEn) => onChange({ specificationsEn })}
            />
            <StringListEditor
              label="Materials"
              rows={values.materialsEn}
              onChange={(materialsEn) => onChange({ materialsEn })}
            />
            <StringListEditor
              label="Use cases"
              rows={values.useCasesEn}
              onChange={(useCasesEn) => onChange({ useCasesEn })}
            />
          </div>
        }
        arabic={
          <div className="grid gap-4" dir="rtl">
            <div className="grid gap-2">
              <Label htmlFor="product-name-ar">الاسم</Label>
              <Input
                id="product-name-ar"
                value={values.nameAr}
                onChange={(event) => onChange({ nameAr: event.target.value })}
              />
            </div>
            <SlugInput
              title={values.nameAr || values.nameEn}
              value={values.slugAr}
              onChange={(slugAr) => onChange({ slugAr })}
              locale="ar"
              model="product"
              pathPrefix="/product"
              excludeId={excludeId}
              published={published}
            />
            <div className="grid gap-2">
              <Label htmlFor="product-short-ar">وصف مختصر</Label>
              <Textarea
                id="product-short-ar"
                rows={3}
                value={values.shortAr}
                onChange={(event) => onChange({ shortAr: event.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>الوصف الطويل</Label>
              <RichTextEditor
                value={values.longAr}
                onChange={(longAr) => onChange({ longAr })}
              />
            </div>
            <KvRowsEditor
              label="المواصفات"
              rows={values.specificationsAr}
              onChange={(specificationsAr) => onChange({ specificationsAr })}
            />
            <StringListEditor
              label="المواد"
              rows={values.materialsAr}
              onChange={(materialsAr) => onChange({ materialsAr })}
            />
            <StringListEditor
              label="حالات الاستخدام"
              rows={values.useCasesAr}
              onChange={(useCasesAr) => onChange({ useCasesAr })}
            />
          </div>
        }
      />
    </div>
  );
}
