"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { LocaleSeoPanels } from "@/components/admin/catalogue/locale-seo-panels";
import { EntityForm, type EntitySaveResult } from "@/components/admin/entity-form";
import { TeamContentTab } from "@/components/admin/team/team-content-tab";
import {
  initialTeamForm,
  teamFormToPayload,
  type TeamFormState,
} from "@/components/admin/team/team-form-state";
import { TeamSettingsTab } from "@/components/admin/team/team-settings-tab";
import { getSiteUrl } from "@/lib/utils/site-url";
import { saveTeamMember } from "@/server/actions/team-member";
import type { AdminTeamDetail } from "@/server/queries/admin-team";

export function TeamEditor({
  member,
  canEdit,
}: {
  member: AdminTeamDetail | null;
  canEdit: boolean;
}) {
  const id = member?.id;
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState<TeamFormState>(() => initialTeamForm(member));

  function patch(next: Partial<TeamFormState>) {
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
    const result = await saveTeamMember(teamFormToPayload(id, form));
    if (!result.ok) {
      return result;
    }
    setDirty(false);
    return {
      ok: true,
      id: result.data.id,
      editHref: `/admin/team/${result.data.id}`,
    };
  }, [canEdit, form, id]);

  return (
    <EntityForm
      title={id ? `Edit ${form.nameEn || "team member"}` : "New team member"}
      description="Profile pages appear at /about/[slug] and on the About page team grid."
      isDirty={dirty}
      onSave={onSave}
      listHref="/admin/team"
      readOnly={!canEdit}
      autosaveMs={id && canEdit ? 8000 : 0}
      slots={{
        content: <TeamContentTab values={form} excludeId={id} onChange={patch} />,
        seo: (
          <LocaleSeoPanels
            seoEn={{
              ...form.seoEn,
              pageTitle: form.nameEn,
              pageUrl: `${getSiteUrl()}/about/${form.slugEn || "…"}`,
            }}
            seoAr={{
              ...form.seoAr,
              pageTitle: form.nameAr || form.nameEn,
              pageUrl: `${getSiteUrl()}/ar/about/${form.slugAr || "…"}`,
            }}
            onChangeEn={(seoPatch) => patch({ seoEn: { ...form.seoEn, ...seoPatch } })}
            onChangeAr={(seoPatch) => patch({ seoAr: { ...form.seoAr, ...seoPatch } })}
          />
        ),
        settings: <TeamSettingsTab values={form} onChange={patch} />,
      }}
    />
  );
}
