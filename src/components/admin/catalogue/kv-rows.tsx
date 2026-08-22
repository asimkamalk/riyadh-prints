"use client";

import { Plus, Trash2 } from "lucide-react";

import type { KvRow } from "@/lib/catalogue-json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function KvRowsEditor({
  label,
  rows,
  onChange,
  keyPlaceholder = "Label",
  valuePlaceholder = "Value",
}: {
  label: string;
  rows: KvRow[];
  onChange: (rows: KvRow[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {rows.map((row, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={row.key}
            placeholder={keyPlaceholder}
            onChange={(event) => {
              const next = [...rows];
              next[index] = { ...row, key: event.target.value };
              onChange(next);
            }}
          />
          <Input
            value={row.value}
            placeholder={valuePlaceholder}
            onChange={(event) => {
              const next = [...rows];
              next[index] = { ...row, value: event.target.value };
              onChange(next);
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Remove row"
            onClick={() => onChange(rows.filter((_, i) => i !== index))}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => onChange([...rows, { key: "", value: "" }])}
      >
        <Plus className="size-4" />
        Add row
      </Button>
    </div>
  );
}
