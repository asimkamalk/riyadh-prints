"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import { toast } from "sonner";

import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { Switch } from "@/components/ui/switch";
import { toggleTeamMemberVisible } from "@/server/actions/team-member";
import type { AdminTeamListItem } from "@/server/queries/admin-team";

const dates = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export function TeamTable({
  items,
  total,
  totalPages,
  page,
  query,
  canEdit,
}: {
  items: AdminTeamListItem[];
  total: number;
  totalPages: number;
  page: number;
  query: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const columns = useMemo<DataTableColumn<AdminTeamListItem>[]>(
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
              className="size-10 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="size-10 rounded-full bg-muted" />
          ),
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Link href={`/admin/team/${row.original.id}` as never} className="font-medium hover:underline">
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: "role", header: "Role" },
      { accessorKey: "slug", header: "Slug" },
      {
        accessorKey: "sortOrder",
        header: "Order",
      },
      {
        id: "visible",
        header: "Visible",
        cell: ({ row }) => (
          <Switch
            checked={row.original.isVisible}
            disabled={!canEdit}
            onCheckedChange={() => {
              startTransition(async () => {
                const result = await toggleTeamMemberVisible({ id: row.original.id });
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }
                router.refresh();
              });
            }}
          />
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => dates.format(new Date(row.original.updatedAt)),
      },
    ],
    [canEdit, router],
  );

  return (
    <div className="grid gap-4">
      <DataTable
        columns={columns}
        data={items}
        rowCount={total}
        pageCount={totalPages}
        searchPlaceholder="Search team…"
        globalFilter={query}
        onGlobalFilterChange={(nextQuery) => {
          const params = new URLSearchParams();
          if (nextQuery) {
            params.set("query", nextQuery);
          }
          router.replace((params.size ? `/admin/team?${params}` : "/admin/team") as never, {
            scroll: false,
          });
        }}
        pagination={{ pageIndex: page - 1, pageSize: 20 }}
        onPaginationChange={(state) => {
          const params = new URLSearchParams();
          if (query) {
            params.set("query", query);
          }
          if (state.pageIndex + 1 > 1) {
            params.set("page", String(state.pageIndex + 1));
          }
          router.replace((params.size ? `/admin/team?${params}` : "/admin/team") as never, {
            scroll: false,
          });
        }}
        emptyMessage="No team members yet."
      />
    </div>
  );
}
