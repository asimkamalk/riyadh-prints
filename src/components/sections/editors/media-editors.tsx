"use client";

import { MediaField } from "@/components/admin/media-field";
import { GenericSectionEditor } from "@/components/sections/editors/generic-editor";
import { asString } from "@/lib/sections/parse";
import {
  galleryFields,
  heroFields,
  imageTextFields,
} from "@/lib/sections/schemas";
import type { SectionEditorProps, SectionRecord } from "@/lib/sections/types";
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

function patchSettings(settings: SectionRecord, key: string, value: unknown, onChange: (next: SectionRecord) => void) {
  onChange({ ...settings, [key]: value });
}

export function HeroEditor(props: SectionEditorProps) {
  const imageId = asString(props.settings.imageId) || null;
  return (
    <div className="grid gap-6">
      <MediaField
        label="Hero image"
        value={imageId ? mediaStub(imageId) : null}
        onChange={(media) => patchSettings(props.settings, "imageId", media?.id ?? null, props.onChangeSettings)}
      />
      <GenericSectionEditor fields={heroFields} data={props.data} onChangeData={props.onChangeData} />
    </div>
  );
}

export function ImageTextEditor(props: SectionEditorProps) {
  const imageId = asString(props.settings.imageId) || null;
  return (
    <div className="grid gap-6">
      <MediaField
        label="Image"
        value={imageId ? mediaStub(imageId) : null}
        onChange={(media) => patchSettings(props.settings, "imageId", media?.id ?? null, props.onChangeSettings)}
      />
      <GenericSectionEditor fields={imageTextFields} data={props.data} onChangeData={props.onChangeData} />
    </div>
  );
}

export function GalleryEditor(props: SectionEditorProps) {
  const items = Array.isArray(props.data.items) ? (props.data.items as SectionRecord[]) : [];

  function setItems(next: SectionRecord[]) {
    props.onChangeData({ ...props.data, items: next });
  }

  return (
    <div className="grid gap-6">
      <GenericSectionEditor fields={galleryFields} data={props.data} onChangeData={props.onChangeData} />
      <div className="grid gap-3">
        <p className="text-sm font-medium">Images</p>
        {items.map((item, index) => {
          const id = asString(item.mediaId) || null;
          return (
            <MediaField
              key={`${id ?? "empty"}-${index}`}
              label={`Image ${index + 1}`}
              value={id ? mediaStub(id) : null}
              onChange={(media) => {
                const next = items.map((row, rowIndex) =>
                  rowIndex === index ? { ...row, mediaId: media?.id ?? "" } : row,
                );
                if (!media) {
                  setItems(next.filter((_, rowIndex) => rowIndex !== index));
                  return;
                }
                setItems(next);
              }}
            />
          );
        })}
        <MediaField
          label="Add image"
          value={null}
          onChange={(media) => {
            if (media) {
              setItems([...items, { mediaId: media.id, alt: "" }]);
            }
          }}
        />
      </div>
    </div>
  );
}
