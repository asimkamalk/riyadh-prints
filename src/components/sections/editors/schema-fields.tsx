"use client";

import type { JSONContent } from "@tiptap/react";

import { MediaField } from "@/components/admin/media-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { emptyTiptap } from "@/lib/catalogue-json";
import { asString } from "@/lib/sections/parse";
import { plainTextToTiptap } from "@/lib/tiptap-text";
import type { EditorScalarField } from "@/lib/sections/types";
import type { AdminMediaRecord } from "@/server/queries/media";

function mediaStub(id: string | null): AdminMediaRecord | null {
  if (!id) {
    return null;
  }
  return {
    id,
    url: "",
    pathname: id,
    provider: "local",
    mimeType: "image/*",
    width: null,
    height: null,
    blurDataUrl: null,
    sizeBytes: null,
    folder: null,
    uploadedById: null,
    createdAt: new Date(0).toISOString(),
    altEn: "",
    altAr: "",
    titleEn: "",
    titleAr: "",
    captionEn: "",
    captionAr: "",
  };
}

function asTiptap(value: unknown): JSONContent {
  if (value && typeof value === "object" && !Array.isArray(value) && "type" in value) {
    return value as JSONContent;
  }
  if (typeof value === "string" && value.trim()) {
    return plainTextToTiptap(value) as JSONContent;
  }
  return emptyTiptap as JSONContent;
}

export function ScalarField({
  field,
  value,
  onChange,
}: {
  field: EditorScalarField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const id = `section-field-${field.key}`;
  if (field.kind === "boolean") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
        <Label htmlFor={id}>{field.label}</Label>
        <Switch id={id} checked={value === true} onCheckedChange={onChange} />
      </div>
    );
  }
  if (field.kind === "enum" && field.options) {
    const current = asString(value) || field.options[0]?.value || "";
    return (
      <div className="grid gap-2">
        <Label>{field.label}</Label>
        <Select value={current} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  if (field.kind === "richtext") {
    return (
      <div className="grid gap-2">
        <Label>{field.label}</Label>
        <RichTextEditor value={asTiptap(value)} onChange={onChange} />
      </div>
    );
  }
  if (field.kind === "media") {
    const idValue = asString(value) || null;
    return (
      <MediaField
        label={field.label}
        value={idValue ? mediaStub(idValue) : null}
        onChange={(media) => onChange(media?.id ?? "")}
      />
    );
  }
  if (field.kind === "stringList") {
    const lines = Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
    return (
      <div className="grid gap-2">
        <Label htmlFor={id}>{field.label}</Label>
        <Textarea
          id={id}
          rows={4}
          value={lines.join("\n")}
          onChange={(event) =>
            onChange(
              event.target.value
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean),
            )
          }
        />
      </div>
    );
  }
  if (field.kind === "textarea") {
    return (
      <div className="grid gap-2">
        <Label htmlFor={id}>{field.label}</Label>
        <Textarea id={id} rows={4} value={asString(value)} onChange={(event) => onChange(event.target.value)} />
      </div>
    );
  }
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{field.label}</Label>
      <Input
        id={id}
        type={field.kind === "number" ? "number" : field.kind === "url" ? "url" : "text"}
        value={field.kind === "number" ? String(typeof value === "number" ? value : "") : asString(value)}
        onChange={(event) =>
          onChange(field.kind === "number" ? Number(event.target.value) || 0 : event.target.value)
        }
      />
    </div>
  );
}
