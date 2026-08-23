"use client";

import { Plus, Trash2 } from "lucide-react";

import { ScalarField } from "@/components/sections/editors/schema-fields";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { asRecord } from "@/lib/sections/parse";
import type { EditorField, SectionRecord } from "@/lib/sections/types";

export function SchemaForm({
  fields,
  value,
  onChange,
  className,
}: {
  fields: EditorField[];
  value: SectionRecord;
  onChange: (next: SectionRecord) => void;
  className?: string;
}) {
  function patch(key: string, next: unknown) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className={cn("grid gap-4", className)}>
      {fields.map((field) =>
        field.kind === "list" ? (
          <ListField
            key={field.key}
            field={field}
            items={Array.isArray(value[field.key]) ? (value[field.key] as unknown[]) : []}
            onChange={(items) => patch(field.key, items)}
          />
        ) : (
          <ScalarField
            key={field.key}
            field={field}
            value={value[field.key]}
            onChange={(next) => patch(field.key, next)}
          />
        ),
      )}
    </div>
  );
}

function ListField({
  field,
  items,
  onChange,
}: {
  field: Extract<EditorField, { kind: "list" }>;
  items: unknown[];
  onChange: (items: unknown[]) => void;
}) {
  function emptyItem(): SectionRecord {
    return Object.fromEntries(
      field.itemFields.map((item) => [
        item.key,
        item.kind === "number" ? 0 : item.kind === "stringList" ? [] : item.kind === "boolean" ? false : "",
      ]),
    );
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <Label>{field.label}</Label>
        <Button type="button" size="sm" variant="outline" onClick={() => onChange([...items, emptyItem()])}>
          <Plus className="size-3.5" />
          {field.addLabel ?? "Add"}
        </Button>
      </div>
      {items.map((raw, index) => {
        const row = asRecord(raw);
        return (
          <div key={`${field.key}-${index}`} className="grid gap-3 rounded-md border p-3">
            <div className="flex justify-end">
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                aria-label="Remove item"
                onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
            {field.itemFields.map((itemField) => (
              <ScalarField
                key={itemField.key}
                field={itemField}
                value={row[itemField.key]}
                onChange={(next) => {
                  const copy = items.map((item, itemIndex) => (itemIndex === index ? asRecord(item) : item));
                  copy[index] = { ...row, [itemField.key]: next };
                  onChange(copy);
                }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
