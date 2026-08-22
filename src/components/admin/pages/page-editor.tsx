"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { emptySeoForm, seoToForm, seoToPayload } from "@/components/admin/catalogue/form-utils";
import { LocaleSeoPanels } from "@/components/admin/catalogue/locale-seo-panels";
import { PageContentTab } from "@/components/admin/pages/page-content-tab";
import { PageSettingsTab } from "@/components/admin/pages/page-settings-tab";
import { SectionBuilder } from "@/components/admin/pages/section-builder";
import { EntityForm, type EntitySaveResult } from "@/components/admin/entity-form";
import { FaqEditor } from "@/components/admin/faq-editor";
import type { SeoValues } from "@/components/admin/seo-panel";
import type { ContentStatus } from "@/generated/prisma/enums";
import { getSiteUrl } from "@/lib/utils/site-url";
import { savePage } from "@/server/actions/page";
import { createPreviewUrl } from "@/server/actions/preview";
import type { AdminFaqRow } from "@/server/queries/admin";
import type { AdminPageDetail, AdminPageOption } from "@/server/queries/admin-pages";

type PageForm = {
  titleEn: string;
  titleAr: string;
  slugEn: string;
  slugAr: string;
  excerptEn: string;
  excerptAr: string;
  seoEn: SeoValues;
  seoAr: SeoValues;
  status: ContentStatus;
  parentId: string | null;
  template: string;
  sortOrder: string;
  showInSitemap: boolean;
  priority: string;
  changeFrequency: string;
  publishedAt: string;
};

function initial(page: AdminPageDetail | null): PageForm {
  const pageUrl = `${getSiteUrl()}${page?.pathEn || "/"}`;
  const pageUrlAr = `${getSiteUrl()}/ar${page?.pathAr === "/" ? "" : page?.pathAr || ""}`;
  return {
    titleEn: page?.titleEn ?? "",
    titleAr: page?.titleAr ?? "",
    slugEn: page?.slugEn ?? "",
    slugAr: page?.slugAr ?? "",
    excerptEn: page?.excerptEn ?? "",
    excerptAr: page?.excerptAr ?? "",
    seoEn: page ? seoToForm(page.seoEn, page.titleEn, pageUrl) : emptySeoForm("", pageUrl),
    seoAr: page ? seoToForm(page.seoAr, page.titleAr, pageUrlAr) : emptySeoForm("", pageUrlAr),
    status: page?.status ?? "DRAFT",
    parentId: page?.parentId ?? null,
    template: page?.template ?? "",
    sortOrder: String(page?.sortOrder ?? 0),
    showInSitemap: page?.showInSitemap ?? true,
    priority: page?.priority == null ? "" : String(page.priority),
    changeFrequency: page?.changeFrequency ?? "",
    publishedAt: page?.publishedAt ?? "",
  };
}

export function PageEditor({
  page,
  parents,
  faqs,
  canEdit,
}: {
  page: AdminPageDetail | null;
  parents: AdminPageOption[];
  faqs: AdminFaqRow[];
  canEdit: boolean;
}) {
  const id = page?.id;
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState(() => initial(page));

  function patch(next: Partial<PageForm>) {
    setDirty(true);
    setForm((current) => ({ ...current, ...next }));
  }

  const onSave = useCallback(async (): Promise<EntitySaveResult> => {
    if (!canEdit) {
      return { ok: false, error: "You do not have permission to save." };
    }
    if (!form.titleEn.trim()) {
      toast.error("English title is required.");
      return { ok: false, error: "English title is required." };
    }
    const priority = form.priority.trim() ? Number(form.priority) : null;
    const result = await savePage({
      id,
      titleEn: form.titleEn,
      titleAr: form.titleAr,
      slugEn: form.slugEn,
      slugAr: form.slugAr,
      excerptEn: form.excerptEn,
      excerptAr: form.excerptAr,
      seoEn: seoToPayload(form.seoEn),
      seoAr: seoToPayload(form.seoAr),
      status: form.status,
      parentId: form.parentId,
      template: form.template,
      sortOrder: Number(form.sortOrder) || 0,
      showInSitemap: form.showInSitemap,
      priority: Number.isFinite(priority) ? priority : null,
      changeFrequency: form.changeFrequency,
      publishedAt: form.publishedAt,
    });
    if (!result.ok) {
      return result;
    }
    setDirty(false);
    const preview = await createPreviewUrl({ type: "page", id: result.data.id });
    return {
      ok: true,
      id: result.data.id,
      editHref: `/admin/pages/${result.data.id}`,
      previewUrl: preview.ok ? preview.data.url : undefined,
    };
  }, [canEdit, form, id]);

  const pathPrefix = form.parentId
    ? (parents.find((parent) => parent.id === form.parentId)?.path ?? "").replace(/\/$/, "")
    : "";

  return (
    <EntityForm
      title={id ? `Edit ${form.titleEn || "page"}` : "New page"}
      isDirty={dirty}
      onSave={onSave}
      listHref="/admin/pages"
      readOnly={!canEdit}
      autosaveMs={id && canEdit ? 8000 : 0}
      slots={{
        content: (
          <PageContentTab
            values={form}
            excludeId={id}
            published={form.status === "PUBLISHED"}
            pathPrefix={pathPrefix}
            onChange={patch}
          />
        ),
        sections: id ? (
          <SectionBuilder pageId={id} sections={page?.sections ?? []} canEdit={canEdit} />
        ) : (
          <p className="text-sm text-muted-foreground">Save the page first to add sections.</p>
        ),
        seo: (
          <LocaleSeoPanels
            seoEn={{ ...form.seoEn, pageTitle: form.titleEn, pageUrl: `${getSiteUrl()}${page?.pathEn || "/"}` }}
            seoAr={{
              ...form.seoAr,
              pageTitle: form.titleAr || form.titleEn,
              pageUrl: `${getSiteUrl()}/ar${page?.pathAr === "/" ? "" : page?.pathAr || ""}`,
            }}
            onChangeEn={(seoPatch) => patch({ seoEn: { ...form.seoEn, ...seoPatch } })}
            onChangeAr={(seoPatch) => patch({ seoAr: { ...form.seoAr, ...seoPatch } })}
          />
        ),
        faqs: id ? (
          <FaqEditor scope="PAGE" entityId={id} items={faqs} />
        ) : (
          <p className="text-sm text-muted-foreground">Save the page first to add FAQs.</p>
        ),
        settings: (
          <PageSettingsTab
            values={{
              status: form.status,
              parentId: form.parentId,
              template: form.template,
              sortOrder: form.sortOrder,
              showInSitemap: form.showInSitemap,
              priority: form.priority,
              changeFrequency: form.changeFrequency,
              publishedAt: form.publishedAt,
              pathEn: page?.pathEn || pathPrefix || "/",
            }}
            parents={parents}
            onChange={patch}
          />
        ),
      }}
    />
  );
}
