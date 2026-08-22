"use client";

import {
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type PaginationState,
  type RowData,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useLegacyTable,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy";
import { useMemo, useState } from "react";

import { DataTableGrid } from "@/components/admin/data-table-grid";
import { DataTablePagination } from "@/components/admin/data-table-pagination";
import { selectColumn } from "@/components/admin/data-table-select-column";
import {
  DataTableToolbar,
  type DataTableBulkAction,
} from "@/components/admin/data-table-toolbar";

export type DataTableColumn<TData extends RowData> = LegacyColumnDef<TData>;

export type DataTableProps<TData extends RowData & { id: string }> = {
  columns: DataTableColumn<TData>[];
  data: TData[];
  rowCount?: number;
  pageCount?: number;
  loading?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  bulkActions?: DataTableBulkAction<TData>[];
  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: (state: PaginationState) => void;
  sorting?: SortingState;
  onSortingChange?: (state: SortingState) => void;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
};

export function DataTable<TData extends RowData & { id: string }>({
  columns,
  data,
  rowCount,
  pageCount,
  loading = false,
  emptyMessage = "No results.",
  searchPlaceholder = "Search…",
  bulkActions,
  manualPagination = true,
  manualSorting = true,
  manualFiltering = true,
  pagination: paginationProp,
  onPaginationChange,
  sorting: sortingProp,
  onSortingChange,
  globalFilter: globalFilterProp,
  onGlobalFilterChange,
}: DataTableProps<TData>) {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sortingState, setSortingState] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [visibility, setVisibility] = useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [searchState, setSearchState] = useState("");

  const pagination = paginationProp ?? paginationState;
  const sorting = sortingProp ?? sortingState;
  const globalFilter = globalFilterProp ?? searchState;

  const tableColumns = useMemo(
    () => (bulkActions?.length ? [selectColumn<TData>(), ...columns] : columns),
    [bulkActions, columns],
  );

  const table = useLegacyTable({
    data,
    columns: tableColumns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination,
    manualSorting,
    manualFiltering,
    pageCount: pageCount ?? -1,
    rowCount: rowCount ?? data.length,
    enableRowSelection: Boolean(bulkActions?.length),
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility: visibility,
      rowSelection,
      globalFilter,
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(pagination) : updater;
      onPaginationChange?.(next);
      setPaginationState(next);
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      onSortingChange?.(next);
      setSortingState(next);
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: (updater) => {
      const next = typeof updater === "function" ? updater(globalFilter) : updater;
      onGlobalFilterChange?.(next);
      setSearchState(next);
    },
  });

  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);

  return (
    <div className="grid gap-3">
      <DataTableToolbar
        search={globalFilter}
        onSearchChange={(value) => {
          onGlobalFilterChange?.(value);
          setSearchState(value);
        }}
        searchPlaceholder={searchPlaceholder}
        selectedCount={selectedRows.length}
        selectedRows={selectedRows}
        bulkActions={bulkActions}
        columns={table.getAllColumns().map((column) => ({
          id: column.id,
          label: typeof column.columnDef.header === "string" ? column.columnDef.header : column.id,
          visible: column.getIsVisible(),
          canHide: column.getCanHide(),
          onToggle: (visible) => column.toggleVisibility(visible),
        }))}
      />
      <DataTableGrid table={table} loading={loading} emptyMessage={emptyMessage} />
      <DataTablePagination
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        pageCount={table.getPageCount()}
        rowCount={rowCount ?? data.length}
        canPrevious={table.getCanPreviousPage()}
        canNext={table.getCanNextPage()}
        onPrevious={() => table.previousPage()}
        onNext={() => table.nextPage()}
        onPageSizeChange={(size) => table.setPageSize(size)}
      />
    </div>
  );
}
