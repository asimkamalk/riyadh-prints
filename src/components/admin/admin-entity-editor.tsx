"use client";

import { useCallback, useState } from "react";
import type { JSONContent } from "@tiptap/react";

import { EntityForm } from "@/components/admin/entity-form";
import { FaqEditor } from "@/components/admin/faq-editor";
import { LocaleTabs } from "@/components/admin/locale-tabs";
import { MediaPicker } from "@/components/admin/media-picker";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SeoPanel, type SeoValues } from "@/components/admin/seo-panel";
import { SlugInput } from "@/components/admin/slug-input";
import { adminCollectionMeta } from "@/components/admin/collection-meta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSiteUrl } from "@/lib/utils/site-url";
import { withLocalePath } from "@/i18n/routing";
import type { AdminFaqRow } from "@/server/queries/admin";

type AdminEntityEditorProps = {
  collection: string;
  id: string;
  title: string;
  faqs: AdminFaqRow[];
};

export function AdminEntityEditor({ collection, id, title, faqs }: AdminEntityEditorProps) {
  const meta = adminCollectionMeta[collection];
  const [nameEn, setNameEn] = useState(title);
  const [nameAr, setNameAr] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState<JSONContent | null>(null);
  const [dirty, setDirty] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [seo, setSeo] = useState<SeoValues>({
    metaTitle: "",
    metaDescription: "",
    ogTitle: "",
    ogDescription: "",
    canonicalUrl: "",
    noIndex: false,
    noFollow: false,
    focusKeyword: "",
    pageTitle: title,
    pageUrl: `${getSiteUrl()}${withLocalePath("en", `${meta?.pathPrefix ?? ""}/${id}`)}`,
  });

  function mark<T>(setter: (value: T) => void) {
    return (value: T) => {
      setDirty(true);
      setter(value);
    };
  }

  const saveDraft = useCallback(async () => {
    setDirty(false);
    return { ok: true as const };
  }, []);

  return (
    <>
      <EntityForm
        title={title}
        description="Content editor shell — save wiring lands with each resource."
        isDirty={dirty}
        onSaveDraft={saveDraft}
        slots={{
          content: (
            <div className="grid gap-6">
              <LocaleTabs
                arabicTranslated={Boolean(nameAr.trim())}
                onCopyFromEnglish={() => {
                  setNameAr(nameEn);
                  setDirty(true);
                }}
                english={
                  <div className="grid gap-3">
                    <Label htmlFor="name-en">Title</Label>
                    <Input
                      id="name-en"
                      value={nameEn}
                      onChange={(event) => mark(setNameEn)(event.target.value)}
                    />
                  </div>
                }
                arabic={
                  <div className="grid gap-3">
                    <Label htmlFor="name-ar">العنوان</Label>
                    <Input
                      id="name-ar"
                      dir="rtl"
                      value={nameAr}
                      onChange={(event) => mark(setNameAr)(event.target.value)}
                    />
                  </div>
                }
              />
              {meta?.slugModel ? (
                <SlugInput
                  title={nameEn}
                  value={slug}
                  onChange={mark(setSlug)}
                  model={meta.slugModel}
                  pathPrefix={meta.pathPrefix}
                  excludeId={id}
                />
              ) : null}
              <RichTextEditor value={body} onChange={mark(setBody)} />
            </div>
          ),
          seo: (
            <SeoPanel
              values={{ ...seo, pageTitle: nameEn }}
              onChange={(patch) => {
                setDirty(true);
                setSeo((current) => ({ ...current, ...patch }));
              }}
            />
          ),
          faqs: meta?.faqScope ? (
            <FaqEditor scope={meta.faqScope} entityId={id} items={faqs} />
          ) : undefined,
          media: (
            <div>
              <Button type="button" variant="outline" onClick={() => setMediaOpen(true)}>
                Browse media library
              </Button>
            </div>
          ),
          settings: (
            <p className="text-sm text-muted-foreground">
              Status, scheduling, and identity settings for this record will appear here.
            </p>
          ),
        }}
      />
      <MediaPicker open={mediaOpen} onOpenChange={setMediaOpen} onSelect={() => setMediaOpen(false)} />
    </>
  );
}
