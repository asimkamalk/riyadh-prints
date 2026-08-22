"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StringListEditor({
  label,
  rows,
  onChange,
  placeholder,
}: {
  label: string;
  rows: string[];
  onChange: (rows: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {rows.map((row, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={row}
            placeholder={placeholder}
            onChange={(event) => {
              const next = [...rows];
              next[index] = event.target.value;
              onChange(next);
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Remove item"
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
        onClick={() => onChange([...rows, ""])}
      >
        <Plus className="size-4" />
        Add item
      </Button>
    </div>
  );
}
