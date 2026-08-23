"use client";

import { Eye, EyeOff, Plus } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AddSectionDialog } from "@/components/admin/pages/add-section-dialog";
import { SectionList } from "@/components/admin/pages/section-list";
import { SectionPanel } from "@/components/admin/pages/section-panel";
import { SectionPreviewPane } from "@/components/admin/pages/section-preview-pane";
import { Button } from "@/components/ui/button";
import type { JsonValue } from "@/types/content";
import { createPageSection, updatePageSection } from "@/server/actions/pageSection";
import type { AdminPageSection } from "@/server/queries/admin-pages";

export function SectionBuilder({
  pageId,
  sections,
  canEdit,
}: {
  pageId: string;
  sections: AdminPageSection[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [rows, setRows] = useState(sections);
  const [selectedId, setSelectedId] = useState(sections[0]?.id ?? null);
  const [addOpen, setAddOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [nonce, setNonce] = useState(0);
  const persistTimer = useRef<number | null>(null);

  useEffect(() => {
    setRows(sections);
    setSelectedId((current) =>
      current && sections.some((row) => row.id === current) ? current : (sections[0]?.id ?? null),
    );
  }, [sections]);

  const selected = rows.find((row) => row.id === selectedId) ?? null;

  function bumpPreview() {
    setNonce((value) => value + 1);
    router.refresh();
  }

  function persist(row: AdminPageSection) {
    if (persistTimer.current) {
      window.clearTimeout(persistTimer.current);
    }
    persistTimer.current = window.setTimeout(() => {
      startTransition(async () => {
        const result = await updatePageSection({
          id: row.id,
          settings: row.settings,
          dataEn: row.dataEn,
          dataAr: row.dataAr,
        });
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        bumpPreview();
      });
    }, 600);
  }

  function patchSelected(patch: Partial<AdminPageSection>) {
    if (!selected || !canEdit) {
      return;
    }
    const next = { ...selected, ...patch };
    setRows((current) => current.map((row) => (row.id === next.id ? next : row)));
    persist(next);
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button type="button" disabled={!canEdit} onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add section
        </Button>
        <Button type="button" variant="outline" onClick={() => setPreview((value) => !value)}>
          {preview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          {preview ? "Hide preview" : "Live preview"}
        </Button>
      </div>
      {preview ? <SectionPreviewPane pageId={pageId} nonce={nonce} /> : null}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <div className="min-w-0 overflow-hidden rounded-lg border p-2 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
          <SectionList
            rows={rows}
            selectedId={selectedId}
            canEdit={canEdit}
            onSelect={setSelectedId}
            onRowsChange={setRows}
            onMutated={bumpPreview}
          />
        </div>
        <div className="min-w-0 overflow-hidden rounded-lg border p-4">
          {selected ? (
            <SectionPanel
              type={selected.type}
              settings={selected.settings}
              dataEn={selected.dataEn}
              dataAr={selected.dataAr}
              onChange={(patch) =>
                patchSelected({
                  settings: (patch.settings as JsonValue | undefined) ?? selected.settings,
                  dataEn: (patch.dataEn as JsonValue | undefined) ?? selected.dataEn,
                  dataAr: (patch.dataAr as JsonValue | undefined) ?? selected.dataAr,
                })
              }
            />
          ) : (
            <p className="text-sm text-muted-foreground">Select a section to edit its content and layout.</p>
          )}
        </div>
      </div>
      <AddSectionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSelect={(type) => {
          startTransition(async () => {
            const result = await createPageSection({ type, pageId });
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            setSelectedId(result.data.id);
            bumpPreview();
          });
        }}
      />
    </div>
  );
}
