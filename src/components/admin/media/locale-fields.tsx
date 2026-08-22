"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type MediaLocaleForm = {
  altEn: string;
  altAr: string;
  titleEn: string;
  titleAr: string;
  captionEn: string;
  captionAr: string;
};

export function emptyMediaLocaleForm(): MediaLocaleForm {
  return { altEn: "", altAr: "", titleEn: "", titleAr: "", captionEn: "", captionAr: "" };
}

export function MediaLocaleFields({
  prefix,
  form,
  setForm,
  disabled,
  rtl,
}: {
  prefix: "en" | "ar";
  form: MediaLocaleForm;
  setForm: React.Dispatch<React.SetStateAction<MediaLocaleForm>>;
  disabled: boolean;
  rtl?: boolean;
}) {
  const alt = prefix === "en" ? "altEn" : "altAr";
  const title = prefix === "en" ? "titleEn" : "titleAr";
  const caption = prefix === "en" ? "captionEn" : "captionAr";
  return (
    <div className="grid gap-3" dir={rtl ? "rtl" : "ltr"}>
      <div className="grid gap-1">
        <Label htmlFor={`media-alt-${prefix}`}>Alt</Label>
        <Input
          id={`media-alt-${prefix}`}
          value={form[alt]}
          disabled={disabled}
          onChange={(event) => setForm((current) => ({ ...current, [alt]: event.target.value }))}
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor={`media-title-${prefix}`}>Title</Label>
        <Input
          id={`media-title-${prefix}`}
          value={form[title]}
          disabled={disabled}
          onChange={(event) => setForm((current) => ({ ...current, [title]: event.target.value }))}
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor={`media-caption-${prefix}`}>Caption</Label>
        <Textarea
          id={`media-caption-${prefix}`}
          value={form[caption]}
          disabled={disabled}
          onChange={(event) => setForm((current) => ({ ...current, [caption]: event.target.value }))}
        />
      </div>
    </div>
  );
}
