"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import { toast } from "sonner";

import { CatalogueFilterBar } from "@/components/admin/catalogue/filter-bar";
import {
  catalogueQueryString,
  CONTENT_STATUSES,
  type CatalogueListFilters,
} from "@/components/admin/catalogue/filters";
import { StatusBadge } from "@/components/admin/catalogue/status-badge";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  bulkUpdateServiceStatus,
  duplicateService,
  toggleServiceFeatured,
} from "@/server/actions/service";
import type { AdminServiceListItem } from "@/server/queries/admin-services";

const dates = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export function ServicesTable({
  items,
  total,
  totalPages,
  page,
  filters,
  canEdit,
}: {
  items: AdminServiceListItem[];
  total: number;
  totalPages: number;
  page: number;
  filters: CatalogueListFilters;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function push(patch: Partial<CatalogueListFilters>) {
    const next = { ...filters, ...patch };
    const qs = catalogueQueryString(next);
    router.replace((qs ? `/admin/services?${qs}` : "/admin/services") as never, { scroll: false });
  }

  const columns = useMemo<DataTableColumn<AdminServiceListItem>[]>(
    () => [
      {
        id: "thumb",
        header: "",
        cell: ({ row }) =>
          row.original.thumbnailUrl ? (
            <Image
              src={row.original.thumbnailUrl}
              alt={row.original.thumbnailAlt || row.original.name}
              width={40}
              height={40}
              className="size-10 rounded-md object-cover"
              unoptimized
            />
          ) : (
            <div className="size-10 rounded-md bg-muted" />
          ),
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Link href={`/admin/services/${row.original.id}` as never} className="font-medium hover:underline">
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "categoryName",
        header: "Category",
        cell: ({ row }) => row.original.categoryName ?? "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "isFeatured",
        header: "Featured",
        cell: ({ row }) => (
          <Switch
            size="sm"
            checked={row.original.isFeatured}
            disabled={!canEdit}
            aria-label={`Featured ${row.original.name}`}
            onCheckedChange={() => {
              startTransition(async () => {
                const result = await toggleServiceFeatured({ id: row.original.id });
                if (!result.ok) toast.error(result.error);
                else router.refresh();
              });
            }}
          />
        ),
      },
      {
        accessorKey: "startingPrice",
        header: "From",
        cell: ({ row }) => (row.original.startingPrice ? `${row.original.startingPrice} SAR` : "—"),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => dates.format(new Date(row.original.updatedAt)),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!canEdit}
            onClick={() => {
              startTransition(async () => {
                const result = await duplicateService({ id: row.original.id });
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }
                router.push(`/admin/services/${result.data.id}` as never);
              });
            }}
          >
            Duplicate
          </Button>
        ),
      },
    ],
    [canEdit, router],
  );

  return (
    <div className="grid gap-3">
      <CatalogueFilterBar filters={filters} onChange={push} />
      <DataTable
        columns={columns}
        data={items}
        rowCount={total}
        pageCount={totalPages}
        searchPlaceholder="Search services…"
        globalFilter={filters.query}
        onGlobalFilterChange={(query) => push({ query, page: 1 })}
        pagination={{ pageIndex: page - 1, pageSize: 20 }}
        onPaginationChange={(state) => push({ page: state.pageIndex + 1 })}
        bulkActions={
          canEdit
            ? CONTENT_STATUSES.map((status) => ({
                label: `Set ${status.toLowerCase()}`,
                onAction: (rows: AdminServiceListItem[]) => {
                  startTransition(async () => {
                    const result = await bulkUpdateServiceStatus({
                      ids: rows.map((row) => row.id),
                      status,
                    });
                    if (!result.ok) toast.error(result.error);
                    else router.refresh();
                  });
                },
              }))
            : undefined
        }
      />
    </div>
  );
}
