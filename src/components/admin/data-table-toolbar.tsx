"use client";

import { Columns3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export type DataTableBulkAction<TData> = {
  label: string;
  variant?: "default" | "destructive" | "outline" | "secondary";
  onAction: (rows: TData[]) => void;
};

type ColumnOption = {
  id: string;
  label: string;
  visible: boolean;
  canHide: boolean;
  onToggle: (visible: boolean) => void;
};

type DataTableToolbarProps<TData> = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  selectedCount: number;
  selectedRows: TData[];
  bulkActions?: DataTableBulkAction<TData>[];
  columns: ColumnOption[];
};

export function DataTableToolbar<TData>({
  search,
  onSearchChange,
  searchPlaceholder,
  selectedCount,
  selectedRows,
  bulkActions,
  columns,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        className="max-w-xs"
        aria-label="Search table"
      />
      {selectedCount > 0 && bulkActions?.length ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">{selectedCount} selected</span>
          {bulkActions.map((action) => (
            <Button
              key={action.label}
              type="button"
              size="sm"
              variant={action.variant ?? "outline"}
              onClick={() => action.onAction(selectedRows)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="ms-auto">
            <Columns3 className="size-4" />
            Columns
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          {columns
            .filter((column) => column.canHide)
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.visible}
                onCheckedChange={column.onToggle}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
