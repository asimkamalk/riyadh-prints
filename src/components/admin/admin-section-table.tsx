"use client";

import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { DataTableColumnHeader } from "@/components/admin/data-table-column-header";

type PlaceholderRow = {
  id: string;
  name: string;
  status: string;
  updatedAt: string;
};

const columns: DataTableColumn<PlaceholderRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader
        label="Name"
        sorted={column.getIsSorted()}
        onToggle={() => column.toggleSorting()}
      />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
  },
];

export function AdminSectionTable({ emptyMessage }: { emptyMessage: string }) {
  return (
    <DataTable
      columns={columns}
      data={[]}
      rowCount={0}
      pageCount={0}
      emptyMessage={emptyMessage}
      searchPlaceholder="Search this list…"
      bulkActions={[
        {
          label: "Delete",
          variant: "destructive",
          onAction: () => undefined,
        },
      ]}
    />
  );
}
