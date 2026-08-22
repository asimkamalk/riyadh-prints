"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CatalogueSaveActions } from "@/components/admin/catalogue/save-actions";
import { useUnsavedChanges } from "@/components/admin/use-unsaved-changes";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const entityFormTabs = [
  "content",
  "sections",
  "media",
  "pricing",
  "options",
  "seo",
  "faqs",
  "settings",
] as const;
export type EntityFormTab = (typeof entityFormTabs)[number];

export type EntityFormSlots = {
  content: React.ReactNode;
  sections?: React.ReactNode;
  media?: React.ReactNode;
  pricing?: React.ReactNode;
  options?: React.ReactNode;
  seo?: React.ReactNode;
  faqs?: React.ReactNode;
  settings?: React.ReactNode;
};

export type EntitySaveResult = {
  ok: boolean;
  error?: string;
  id?: string;
  editHref?: string;
  previewUrl?: string;
};

export type EntityFormProps = {
  title: string;
  description?: string;
  isDirty: boolean;
  slots: EntityFormSlots;
  defaultTab?: EntityFormTab;
  onSaveDraft?: () => Promise<{ ok: boolean; error?: string }>;
  onPublish?: () => Promise<{ ok: boolean; error?: string }>;
  onSave?: () => Promise<EntitySaveResult>;
  listHref?: string;
  readOnly?: boolean;
  autosaveMs?: number;
};

const TAB_LABELS: Record<EntityFormTab, string> = {
  content: "Content",
  sections: "Sections",
  media: "Media",
  pricing: "Pricing",
  options: "Options",
  seo: "SEO",
  faqs: "FAQs",
  settings: "Settings",
};

export async function runOptimistic(
  work: () => Promise<{ ok: boolean; error?: string }>,
  messages: { loading: string; success: string },
): Promise<boolean> {
  const id = toast.loading(messages.loading);
  const result = await work();
  if (result.ok) {
    toast.success(messages.success, { id });
    return true;
  }
  toast.error(result.error ?? "Something went wrong.", { id });
  return false;
}

export function EntityForm({
  title,
  description,
  isDirty,
  slots,
  defaultTab = "content",
  onSaveDraft,
  onPublish,
  onSave,
  listHref,
  readOnly = false,
  autosaveMs = 8000,
}: EntityFormProps) {
  const router = useRouter();
  const [tab, setTab] = useState<EntityFormTab>(defaultTab);
  const [saving, setSaving] = useState(false);
  useUnsavedChanges(isDirty);

  useEffect(() => {
    if (!isDirty || readOnly || autosaveMs <= 0) {
      return;
    }
    const persist = onSave ?? onSaveDraft;
    if (!persist) {
      return;
    }
    const timer = window.setTimeout(() => {
      void runOptimistic(() => persist(), {
        loading: "Saving draft…",
        success: "Draft saved",
      });
    }, autosaveMs);
    return () => window.clearTimeout(timer);
  }, [autosaveMs, isDirty, onSave, onSaveDraft, readOnly]);

  const visibleTabs = entityFormTabs.filter((id) => id === "content" || slots[id]);
  const catalogueMode = Boolean(onSave);

  async function persist(): Promise<EntitySaveResult> {
    if (onSave) {
      return onSave();
    }
    if (!onSaveDraft) {
      return { ok: false, error: "Nothing to save." };
    }
    return onSaveDraft();
  }

  async function handleDraft() {
    setSaving(true);
    await runOptimistic(() => persist(), { loading: "Saving draft…", success: "Draft saved" });
    setSaving(false);
  }

  async function handlePublish() {
    if (!onPublish) {
      return;
    }
    setSaving(true);
    await runOptimistic(onPublish, { loading: "Publishing…", success: "Published" });
    setSaving(false);
  }

  async function handleCatalogueSave(mode: "leave" | "stay" | "preview") {
    setSaving(true);
    const id = toast.loading("Saving…");
    const result = await persist();
    if (!result.ok) {
      toast.error(result.error ?? "Something went wrong.", { id });
      setSaving(false);
      return;
    }
    toast.success("Saved", { id });
    if (mode === "leave" && listHref) {
      router.push(listHref as never);
    } else if (mode === "stay" && result.editHref) {
      router.replace(result.editHref as never);
    } else if (mode === "preview" && result.previewUrl) {
      window.open(result.previewUrl, "_blank", "noopener,noreferrer");
    }
    setSaving(false);
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {catalogueMode ? (
          <CatalogueSaveActions
            disabled={saving || readOnly}
            onSave={() => void handleCatalogueSave("leave")}
            onContinue={() => void handleCatalogueSave("stay")}
            onPreview={() => void handleCatalogueSave("preview")}
          />
        ) : (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving || readOnly || !isDirty}
              onClick={() => void handleDraft()}
            >
              Save draft
            </Button>
            {onPublish ? (
              <Button type="button" disabled={saving || readOnly} onClick={() => void handlePublish()}>
                Publish
              </Button>
            ) : null}
          </div>
        )}
      </div>
      <Tabs value={tab} onValueChange={(value) => setTab(value as EntityFormTab)}>
        <TabsList variant="line" className="w-full justify-start overflow-x-auto">
          {visibleTabs.map((id) => (
            <TabsTrigger key={id} value={id}>
              {TAB_LABELS[id]}
            </TabsTrigger>
          ))}
        </TabsList>
        {visibleTabs.map((id) => (
          <TabsContent key={id} value={id} className="pt-4">
            {slots[id]}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
