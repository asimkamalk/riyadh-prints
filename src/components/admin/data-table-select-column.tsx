"use client";

import type { RowData } from "@tanstack/react-table";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";

import { Checkbox } from "@/components/ui/checkbox";

export function selectColumn<TData extends RowData & { id: string }>(): LegacyColumnDef<TData> {
  return {
    id: "select",
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
      />
    ),
  };
}
