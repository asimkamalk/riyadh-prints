"use client";

import { LayoutGrid, List, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MEDIA_TYPE_FILTERS, type MediaTypeFilter } from "@/lib/media-types";
import type { MediaLibraryFilters } from "@/components/admin/media/filters";

export function MediaToolbar({
  filters,
  onChange,
  canEdit,
  onUploadClick,
}: {
  filters: MediaLibraryFilters;
  onChange: (patch: Partial<MediaLibraryFilters>) => void;
  canEdit: boolean;
  onUploadClick: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        value={filters.query}
        onChange={(event) => onChange({ query: event.target.value, page: 1 })}
        placeholder="Search filename or alt…"
        className="max-w-xs"
        aria-label="Search media"
      />
      <Select
        value={filters.type}
        onValueChange={(value) => onChange({ type: value as MediaTypeFilter, page: 1 })}
      >
        <SelectTrigger className="w-32" aria-label="File type">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          {MEDIA_TYPE_FILTERS.map((type) => (
            <SelectItem key={type} value={type}>
              {type === "all" ? "All types" : type.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="date"
        value={filters.from}
        onChange={(event) => onChange({ from: event.target.value, page: 1 })}
        aria-label="From date"
        className="w-36"
      />
      <Input
        type="date"
        value={filters.to}
        onChange={(event) => onChange({ to: event.target.value, page: 1 })}
        aria-label="To date"
        className="w-36"
      />
      <div className="ms-auto flex items-center gap-1">
        <Button
          type="button"
          size="icon-sm"
          variant={filters.view === "grid" ? "secondary" : "ghost"}
          aria-label="Grid view"
          aria-pressed={filters.view === "grid"}
          onClick={() => onChange({ view: "grid" })}
        >
          <LayoutGrid className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant={filters.view === "list" ? "secondary" : "ghost"}
          aria-label="List view"
          aria-pressed={filters.view === "list"}
          onClick={() => onChange({ view: "list" })}
        >
          <List className="size-4" />
        </Button>
        {canEdit ? (
          <Button type="button" size="sm" onClick={onUploadClick}>
            <Upload className="size-4" />
            Upload
          </Button>
        ) : null}
      </div>
    </div>
  );
}
