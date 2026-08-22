"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { LocaleTabs } from "@/components/admin/locale-tabs";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { fileBasename, formatBytes } from "@/lib/media-types";
import { deleteMedia, listMediaUsages, updateMedia } from "@/server/actions/media";
import type { AdminMediaRecord } from "@/server/queries/media";
import type { MediaUsage } from "@/server/queries/media-usages";

import { emptyMediaLocaleForm, MediaLocaleFields, type MediaLocaleForm } from "./locale-fields";
import { MediaThumb } from "./thumb";

export function MediaDetailDrawer({
  item,
  canEdit,
  onOpenChange,
  onUpdated,
  onDeleted,
}: {
  item: AdminMediaRecord | null;
  canEdit: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (item: AdminMediaRecord) => void;
  onDeleted: (id: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [usages, setUsages] = useState<MediaUsage[]>([]);
  const [form, setForm] = useState<MediaLocaleForm>(emptyMediaLocaleForm());

  useEffect(() => {
    if (!item) {
      setUsages([]);
      return;
    }
    setForm({
      altEn: item.altEn,
      altAr: item.altAr,
      titleEn: item.titleEn,
      titleAr: item.titleAr,
      captionEn: item.captionEn,
      captionAr: item.captionAr,
    });
    startTransition(async () => {
      const result = await listMediaUsages({ id: item.id });
      if (result.ok) {
        setUsages(result.data);
      }
    });
  }, [item]);

  const inUse = usages.length > 0;

  return (
    <Sheet open={Boolean(item)} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        {item ? (
          <>
            <SheetHeader>
              <SheetTitle className="truncate">{fileBasename(item.pathname)}</SheetTitle>
              <SheetDescription>Preview, metadata, and where this file is used.</SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 px-4 pb-6">
              <MediaThumb item={item} className="aspect-video rounded-lg" sizes="400px" />
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Dimensions</dt>
                  <dd>
                    {item.width && item.height ? `${item.width} × ${item.height}` : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Size</dt>
                  <dd>{formatBytes(item.sizeBytes)}</dd>
                </div>
              </dl>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  await navigator.clipboard.writeText(item.url);
                  toast.success("URL copied");
                }}
              >
                Copy URL
              </Button>
              <LocaleTabs
                arabicTranslated={Boolean(form.altAr.trim() || form.titleAr.trim())}
                onCopyFromEnglish={() =>
                  setForm((current) => ({
                    ...current,
                    altAr: current.altEn,
                    titleAr: current.titleEn,
                    captionAr: current.captionEn,
                  }))
                }
                english={
                  <MediaLocaleFields prefix="en" form={form} setForm={setForm} disabled={!canEdit} />
                }
                arabic={
                  <MediaLocaleFields prefix="ar" form={form} setForm={setForm} disabled={!canEdit} rtl />
                }
              />
              {canEdit ? (
                <Button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await updateMedia({ id: item.id, ...form });
                      if (!result.ok) {
                        toast.error(result.error);
                        return;
                      }
                      onUpdated({ ...item, ...form });
                      toast.success("Saved");
                    })
                  }
                >
                  Save details
                </Button>
              ) : null}
              <div>
                <h3 className="mb-2 text-sm font-medium">Used in</h3>
                {usages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Not referenced by any content.</p>
                ) : (
                  <ul className="grid gap-1 text-sm">
                    {usages.map((usage) => (
                      <li key={`${usage.entityType}-${usage.entityId}-${usage.field}-${usage.locale ?? ""}`}>
                        <Link href={usage.href as never} className="underline-offset-2 hover:underline">
                          {usage.label}
                        </Link>
                        <span className="text-muted-foreground">
                          {" "}
                          · {usage.field}
                          {usage.locale ? ` (${usage.locale})` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {canEdit ? (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={pending || inUse}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await deleteMedia({ id: item.id });
                      if (!result.ok) {
                        toast.error(result.error);
                        return;
                      }
                      onDeleted(item.id);
                      toast.success("Deleted");
                    })
                  }
                >
                  {inUse ? `In use (${usages.length})` : "Delete"}
                </Button>
              ) : null}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
