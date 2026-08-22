"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DataTableColumnHeaderProps = {
  label: string;
  sorted?: false | "asc" | "desc";
  onToggle?: () => void;
  className?: string;
};

export function DataTableColumnHeader({
  label,
  sorted,
  onToggle,
  className,
}: DataTableColumnHeaderProps) {
  if (!onToggle) {
    return <span className={className}>{label}</span>;
  }
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("-ms-2 h-8", className)}
      onClick={onToggle}
    >
      {label}
      {sorted === "asc" ? (
        <ArrowUp className="size-3.5" />
      ) : sorted === "desc" ? (
        <ArrowDown className="size-3.5" />
      ) : (
        <ChevronsUpDown className="size-3.5 opacity-50" />
      )}
    </Button>
  );
}
