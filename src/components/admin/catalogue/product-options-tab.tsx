"use client";

import { Plus, Trash2 } from "lucide-react";

import { ReorderList } from "@/components/admin/catalogue/reorder-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type OptionValueDraft = {
  id: string;
  value: string;
  priceModifier: string;
  labelEn: string;
  labelAr: string;
};

export type OptionDraft = {
  id: string;
  key: string;
  labelEn: string;
  labelAr: string;
  values: OptionValueDraft[];
};

function newId() {
  return `tmp-${crypto.randomUUID()}`;
}

export function ProductOptionsTab({
  options,
  onChange,
}: {
  options: OptionDraft[];
  onChange: (options: OptionDraft[]) => void;
}) {
  function patch(id: string, next: Partial<OptionDraft>) {
    onChange(options.map((option) => (option.id === id ? { ...option, ...next } : option)));
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Size, paper, finishing, and other choices. Drag options to reorder.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            onChange([
              ...options,
              { id: newId(), key: "", labelEn: "", labelAr: "", values: [] },
            ])
          }
        >
          <Plus className="size-4" />
          Add option
        </Button>
      </div>
      <ReorderList
        items={options}
        onChange={onChange}
        renderItem={(option, handle) => (
          <div className="grid gap-3 rounded-lg border p-3">
            <div className="flex items-start gap-2">
              {handle}
              <div className="grid flex-1 gap-2 sm:grid-cols-3">
                <div className="grid gap-1">
                  <Label>Label (EN)</Label>
                  <Input
                    value={option.labelEn}
                    onChange={(event) => patch(option.id, { labelEn: event.target.value })}
                  />
                </div>
                <div className="grid gap-1">
                  <Label>Label (AR)</Label>
                  <Input
                    dir="rtl"
                    value={option.labelAr}
                    onChange={(event) => patch(option.id, { labelAr: event.target.value })}
                  />
                </div>
                <div className="grid gap-1">
                  <Label>Key</Label>
                  <Input
                    value={option.key}
                    placeholder="auto from label"
                    onChange={(event) => patch(option.id, { key: event.target.value })}
                  />
                </div>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Remove option"
                onClick={() => onChange(options.filter((item) => item.id !== option.id))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            <OptionValues
              values={option.values}
              onChange={(values) => patch(option.id, { values })}
            />
          </div>
        )}
      />
    </div>
  );
}

function OptionValues({
  values,
  onChange,
}: {
  values: OptionValueDraft[];
  onChange: (values: OptionValueDraft[]) => void;
}) {
  return (
    <div className="grid gap-2 ps-10">
      {values.map((value, index) => (
        <div key={value.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_8rem_auto]">
          <Input
            placeholder="Label EN"
            value={value.labelEn}
            onChange={(event) => {
              const next = [...values];
              next[index] = { ...value, labelEn: event.target.value };
              onChange(next);
            }}
          />
          <Input
            placeholder="Label AR"
            dir="rtl"
            value={value.labelAr}
            onChange={(event) => {
              const next = [...values];
              next[index] = { ...value, labelAr: event.target.value };
              onChange(next);
            }}
          />
          <Input
            placeholder="± price"
            value={value.priceModifier}
            onChange={(event) => {
              const next = [...values];
              next[index] = { ...value, priceModifier: event.target.value };
              onChange(next);
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Remove value"
            onClick={() => onChange(values.filter((item) => item.id !== value.id))}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="w-fit"
        onClick={() =>
          onChange([
            ...values,
            { id: newId(), value: "", priceModifier: "0", labelEn: "", labelAr: "" },
          ])
        }
      >
        <Plus className="size-4" />
        Add value
      </Button>
    </div>
  );
}
