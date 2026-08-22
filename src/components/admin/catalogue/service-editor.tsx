"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { LocaleSeoPanels } from "@/components/admin/catalogue/locale-seo-panels";
import { ServiceContentTab } from "@/components/admin/catalogue/service-content-tab";
import {
  initialServiceForm,
  serviceFormToPayload,
  type ServiceFormState,
} from "@/components/admin/catalogue/service-form-state";
import { ServiceSettingsTab } from "@/components/admin/catalogue/service-settings-tab";
import { EntityForm, type EntitySaveResult } from "@/components/admin/entity-form";
import { FaqEditor } from "@/components/admin/faq-editor";
import { getSiteUrl } from "@/lib/utils/site-url";
import { createPreviewUrl } from "@/server/actions/preview";
import { saveService } from "@/server/actions/service";
import type { AdminFaqRow } from "@/server/queries/admin";
import type { AdminCategoryOption } from "@/server/queries/admin-categories";
import type { AdminServiceDetail } from "@/server/queries/admin-services";

export function ServiceEditor({
  service,
  categories,
  faqs,
  canEdit,
}: {
  service: AdminServiceDetail | null;
  categories: AdminCategoryOption[];
  faqs: AdminFaqRow[];
  canEdit: boolean;
}) {
  const id = service?.id;
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState<ServiceFormState>(() => initialServiceForm(service));

  function patch(next: Partial<ServiceFormState>) {
    setDirty(true);
    setForm((current) => ({ ...current, ...next }));
  }

  const onSave = useCallback(async (): Promise<EntitySaveResult> => {
    if (!canEdit) {
      return { ok: false, error: "You do not have permission to save." };
    }
    if (!form.nameEn.trim()) {
      toast.error("English name is required.");
      return { ok: false, error: "English name is required." };
    }
    const result = await saveService(serviceFormToPayload(id, form));
    if (!result.ok) {
      return result;
    }
    setDirty(false);
    const preview = await createPreviewUrl({ type: "service", id: result.data.id });
    return {
      ok: true,
      id: result.data.id,
      editHref: `/admin/services/${result.data.id}`,
      previewUrl: preview.ok ? preview.data.url : undefined,
    };
  }, [canEdit, form, id]);

  return (
    <EntityForm
      title={id ? `Edit ${form.nameEn || "service"}` : "New service"}
      isDirty={dirty}
      onSave={onSave}
      listHref="/admin/services"
      readOnly={!canEdit}
      autosaveMs={id && canEdit ? 8000 : 0}
      slots={{
        content: (
          <ServiceContentTab
            values={form}
            excludeId={id}
            published={form.status === "PUBLISHED"}
            onChange={patch}
          />
        ),
        seo: (
          <LocaleSeoPanels
            seoEn={{
              ...form.seoEn,
              pageTitle: form.nameEn,
              pageUrl: `${getSiteUrl()}/services/${form.slugEn || "…"}`,
            }}
            seoAr={{
              ...form.seoAr,
              pageTitle: form.nameAr || form.nameEn,
              pageUrl: `${getSiteUrl()}/ar/services/${form.slugAr || "…"}`,
            }}
            onChangeEn={(seoPatch) => patch({ seoEn: { ...form.seoEn, ...seoPatch } })}
            onChangeAr={(seoPatch) => patch({ seoAr: { ...form.seoAr, ...seoPatch } })}
          />
        ),
        faqs: id ? (
          <FaqEditor scope="SERVICE" entityId={id} items={faqs} />
        ) : (
          <p className="text-sm text-muted-foreground">Save the service first to add FAQs.</p>
        ),
        settings: <ServiceSettingsTab values={form} categories={categories} onChange={patch} />,
      }}
    />
  );
}
