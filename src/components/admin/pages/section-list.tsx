"use client";

import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SortableList } from "@/components/admin/sortable-list";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getSectionCatalog } from "@/lib/sections/catalog";
import {
  deletePageSection,
  duplicatePageSection,
  reorderPageSections,
  togglePageSectionStatus,
} from "@/server/actions/pageSection";
import type { AdminPageSection } from "@/server/queries/admin-pages";

export function SectionList({
  rows,
  selectedId,
  canEdit,
  onSelect,
  onRowsChange,
  onMutated,
}: {
  rows: AdminPageSection[];
  selectedId: string | null;
  canEdit: boolean;
  onSelect: (id: string) => void;
  onRowsChange: (rows: AdminPageSection[]) => void;
  onMutated: () => void;
}) {
  if (rows.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-muted-foreground">No sections yet. Add one to start building.</p>
    );
  }

  return (
    <SortableList
      items={rows}
      onReorder={async (items) => {
        const result = await reorderPageSections({ items });
        if (result.ok) {
          onRowsChange(
            [...rows].sort(
              (a, b) =>
                (items.find((item) => item.id === a.id)?.sortOrder ?? 0) -
                (items.find((item) => item.id === b.id)?.sortOrder ?? 0),
            ),
          );
          onMutated();
        }
        return result;
      }}
      renderItem={(item, handle) => {
        const definition = getSectionCatalog(item.type);
        const summary = definition.summarize(item.dataEn);
        return (
          <div
            className={`flex items-center gap-2 rounded-md border px-2 py-2 ${selectedId === item.id ? "border-primary bg-muted/40" : ""}`}
          >
            {handle}
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 text-start"
              onClick={() => onSelect(item.id)}
            >
              <definition.icon className="size-4 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{definition.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{summary}</span>
              </span>
            </button>
            <Switch
              size="sm"
              checked={item.isVisible}
              disabled={!canEdit}
              aria-label={`Visible ${definition.label}`}
              onCheckedChange={() => {
                void (async () => {
                  const result = await togglePageSectionStatus({ id: item.id });
                  if (!result.ok) {
                    toast.error(result.error);
                    return;
                  }
                  onRowsChange(
                    rows.map((row) => (row.id === item.id ? { ...row, isVisible: !row.isVisible } : row)),
                  );
                  onMutated();
                })();
              }}
            />
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label="Duplicate section"
              disabled={!canEdit}
              onClick={() => {
                void (async () => {
                  const result = await duplicatePageSection({ id: item.id });
                  if (!result.ok) toast.error(result.error);
                  else onMutated();
                })();
              }}
            >
              <Copy className="size-3.5" />
            </Button>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label="Delete section"
              disabled={!canEdit}
              onClick={() => {
                void (async () => {
                  const result = await deletePageSection({ id: item.id });
                  if (!result.ok) {
                    toast.error(result.error);
                    return;
                  }
                  onRowsChange(rows.filter((row) => row.id !== item.id));
                  onMutated();
                })();
              }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        );
      }}
    />
  );
}
