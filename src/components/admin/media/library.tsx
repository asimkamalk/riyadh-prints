"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { mediaQueryString, type MediaLibraryFilters } from "@/components/admin/media/filters";
import { MediaBulkBar } from "@/components/admin/media/bulk-bar";
import { MediaDetailDrawer } from "@/components/admin/media/detail-drawer";
import { MediaDropzone } from "@/components/admin/media/dropzone";
import { MediaFolderSidebar } from "@/components/admin/media/folder-sidebar";
import { MediaGrid } from "@/components/admin/media/grid";
import { MediaList } from "@/components/admin/media/list";
import { MediaToolbar } from "@/components/admin/media/toolbar";
import { MediaUploadQueue } from "@/components/admin/media/upload-queue";
import { useMediaUploads } from "@/components/admin/media/use-media-uploads";
import { MediaPagination } from "@/components/admin/media/pagination";
import { DEFAULT_MEDIA_FOLDER } from "@/lib/media-types";
import { bulkDeleteMedia, bulkUpdateMediaStatus } from "@/server/actions/media";
import type { AdminMediaRecord } from "@/server/queries/media";

export function MediaLibrary({
  items,
  total,
  totalPages,
  folders,
  filters,
  canEdit,
}: {
  items: AdminMediaRecord[];
  total: number;
  totalPages: number;
  folders: string[];
  filters: MediaLibraryFilters;
  canEdit: boolean;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(filters.query);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<AdminMediaRecord | null>(null);
  const [, startTransition] = useTransition();
  const { jobs, uploadFiles } = useMediaUploads(() => router.refresh());

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  useEffect(() => {
    setQuery(filters.query);
  }, [filters.query]);

  useEffect(() => {
    if (query === filters.query) {
      return;
    }
    const timer = setTimeout(() => {
      const next = { ...filtersRef.current, query, page: 1 };
      const qs = mediaQueryString(next);
      router.replace((qs ? `/admin/media?${qs}` : "/admin/media") as never, { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [query, filters.query, router]);

  function push(patch: Partial<MediaLibraryFilters>) {
    const next = { ...filters, query, ...patch };
    const qs = mediaQueryString(next);
    router.replace((qs ? `/admin/media?${qs}` : "/admin/media") as never, { scroll: false });
  }

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function queueFiles(files: File[]) {
    void uploadFiles(files, filters.folder || DEFAULT_MEDIA_FOLDER);
  }

  const viewProps = {
    items,
    selectedIds: selected,
    onToggle: toggle,
    onOpen: setActive,
    selectable: true,
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
      <aside className="rounded-lg border p-3">
        <MediaFolderSidebar
          folders={folders}
          active={filters.folder}
          onSelect={(folder) => push({ folder, page: 1 })}
          canCreate={canEdit}
        />
      </aside>
      <div className="grid min-w-0 gap-3">
        <MediaToolbar
          filters={{ ...filters, query }}
          canEdit={canEdit}
          onUploadClick={() => fileRef.current?.click()}
          onChange={(patch) => {
            if (patch.query !== undefined) {
              setQuery(patch.query);
              return;
            }
            push(patch);
          }}
        />
        {canEdit ? (
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
            multiple
            className="sr-only"
            onChange={(event) => {
              const files = event.target.files ? [...event.target.files] : [];
              event.target.value = "";
              if (files.length) queueFiles(files);
            }}
          />
        ) : null}
        <MediaUploadQueue jobs={jobs} />
        {canEdit ? (
          <MediaBulkBar
            count={selected.size}
            folders={folders}
            onClear={() => setSelected(new Set())}
            onMove={(folder) =>
              startTransition(async () => {
                const result = await bulkUpdateMediaStatus({ ids: [...selected], folder });
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }
                toast.success(`Moved ${result.data.count} file(s)`);
                setSelected(new Set());
                router.refresh();
              })
            }
            onDelete={() =>
              startTransition(async () => {
                const result = await bulkDeleteMedia({ ids: [...selected] });
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }
                toast.success(
                  `Deleted ${result.data.count}. Skipped ${result.data.skipped} in use.`,
                );
                setSelected(new Set());
                router.refresh();
              })
            }
          />
        ) : null}
        <MediaDropzone disabled={!canEdit} onFiles={queueFiles}>
          {filters.view === "list" ? <MediaList {...viewProps} /> : <MediaGrid {...viewProps} />}
        </MediaDropzone>
        <MediaPagination
          page={filters.page}
          total={total}
          totalPages={totalPages}
          onPage={(page) => push({ page })}
        />
      </div>
      <MediaDetailDrawer
        item={active}
        canEdit={canEdit}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
        onUpdated={setActive}
        onDeleted={(id) => {
          setActive(null);
          setSelected((current) => {
            const next = new Set(current);
            next.delete(id);
            return next;
          });
          router.refresh();
        }}
      />
    </div>
  );
}
