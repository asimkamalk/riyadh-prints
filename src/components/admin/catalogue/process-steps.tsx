"use client";

import { Plus, Trash2 } from "lucide-react";

import type { ProcessStep } from "@/lib/catalogue-json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProcessStepsEditor({
  label,
  rows,
  onChange,
}: {
  label: string;
  rows: ProcessStep[];
  onChange: (rows: ProcessStep[]) => void;
}) {
  return (
    <div className="grid gap-3">
      <Label>{label}</Label>
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 rounded-lg border p-3">
          <div className="flex gap-2">
            <Input
              value={row.icon}
              placeholder="Icon name"
              className="max-w-40"
              onChange={(event) => {
                const next = [...rows];
                next[index] = { ...row, icon: event.target.value };
                onChange(next);
              }}
            />
            <Input
              value={row.title}
              placeholder="Step title"
              onChange={(event) => {
                const next = [...rows];
                next[index] = { ...row, title: event.target.value };
                onChange(next);
              }}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Remove step"
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          <Textarea
            rows={2}
            value={row.description}
            placeholder="Description"
            onChange={(event) => {
              const next = [...rows];
              next[index] = { ...row, description: event.target.value };
              onChange(next);
            }}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => onChange([...rows, { icon: "", title: "", description: "" }])}
      >
        <Plus className="size-4" />
        Add step
      </Button>
    </div>
  );
}
