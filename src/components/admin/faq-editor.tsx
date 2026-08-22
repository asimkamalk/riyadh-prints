"use client";

import { Plus, Trash2 } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

import { FaqRichResultPreview } from "@/components/admin/faq-preview";
import { SortableList } from "@/components/admin/sortable-list";
import type { FaqScope } from "@/generated/prisma/enums";
import { plainTextToTiptap } from "@/lib/tiptap-text";
import { createFaq, deleteFaq, reorderFaqs, updateFaq } from "@/server/actions/faq";
import type { AdminFaqRow } from "@/server/queries/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type FaqEditorProps = {
  scope: FaqScope;
  entityId?: string;
  items: AdminFaqRow[];
};

type FaqEntityIds = {
  pageId?: string;
  productId?: string;
  categoryId?: string;
  serviceId?: string;
  postId?: string;
  projectId?: string;
};

const SCOPE_KEY: Record<Exclude<FaqScope, "GLOBAL">, keyof FaqEntityIds> = {
  PAGE: "pageId",
  PRODUCT: "productId",
  CATEGORY: "categoryId",
  SERVICE: "serviceId",
  POST: "postId",
  PROJECT: "projectId",
};

export function FaqEditor({ scope, entityId, items }: FaqEditorProps) {
  const [rows, setRows] = useState(items);
  const [optimistic, setOptimistic] = useOptimistic(rows);
  const [, startTransition] = useTransition();

  async function persistCreate() {
    const entity: FaqEntityIds =
      scope === "GLOBAL" || !entityId ? {} : { [SCOPE_KEY[scope]]: entityId };
    const result = await createFaq({
      scope,
      ...entity,
      sortOrder: rows.length,
      questionEn: "New question",
      answerEn: plainTextToTiptap(""),
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    const next: AdminFaqRow = {
      id: result.data.id,
      sortOrder: rows.length,
      questionEn: "New question",
      questionAr: "",
      answerEn: "",
      answerAr: "",
    };
    setRows((current) => [...current, next]);
  }

  function patchRow(id: string, patch: Partial<AdminFaqRow>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    const next = { ...rows.find((row) => row.id === id), ...patch };
    if (!next) {
      return;
    }
    void updateFaq({
      id,
      questionEn: next.questionEn,
      questionAr: next.questionAr,
      answerEn: plainTextToTiptap(next.answerEn ?? ""),
      answerAr: plainTextToTiptap(next.answerAr ?? ""),
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      <div className="grid gap-3">
        <div className="flex justify-end">
          <Button type="button" size="sm" onClick={() => void persistCreate()}>
            <Plus className="size-4" />
            Add FAQ
          </Button>
        </div>
        <SortableList
          items={optimistic}
          onReorder={async (ordered) => {
            startTransition(() => {
              setOptimistic(
                ordered.map((item) => ({
                  ...(optimistic.find((row) => row.id === item.id) as AdminFaqRow),
                  sortOrder: item.sortOrder,
                })),
              );
            });
            const result = await reorderFaqs({ items: ordered });
            if (result.ok) {
              setRows((current) =>
                ordered.map((item) => ({
                  ...(current.find((row) => row.id === item.id) as AdminFaqRow),
                  sortOrder: item.sortOrder,
                })),
              );
            }
            return result;
          }}
          renderItem={(item, handle) => (
            <FaqRow
              item={item}
              handle={handle}
              onChange={(patch) => patchRow(item.id, patch)}
              onRemove={() => {
                setRows((current) => current.filter((row) => row.id !== item.id));
                void deleteFaq({ id: item.id });
              }}
            />
          )}
        />
      </div>
      <FaqRichResultPreview
        items={optimistic.map((row) => ({
          id: row.id,
          question: row.questionEn,
          answer: row.answerEn,
        }))}
      />
    </div>
  );
}

function FaqRow({
  item,
  handle,
  onChange,
  onRemove,
}: {
  item: AdminFaqRow;
  handle: React.ReactNode;
  onChange: (patch: Partial<AdminFaqRow>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-2 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        {handle}
        <Button type="button" size="icon-xs" variant="ghost" aria-label="Remove FAQ" onClick={onRemove}>
          <Trash2 className="size-4" />
        </Button>
      </div>
      <Label>Question (EN)</Label>
      <Input value={item.questionEn} onChange={(event) => onChange({ questionEn: event.target.value })} />
      <Label>Answer (EN)</Label>
      <Textarea value={item.answerEn} onChange={(event) => onChange({ answerEn: event.target.value })} />
      <Label>Question (AR)</Label>
      <Input dir="rtl" value={item.questionAr} onChange={(event) => onChange({ questionAr: event.target.value })} />
      <Label>Answer (AR)</Label>
      <Textarea dir="rtl" value={item.answerAr} onChange={(event) => onChange({ answerAr: event.target.value })} />
    </div>
  );
}
