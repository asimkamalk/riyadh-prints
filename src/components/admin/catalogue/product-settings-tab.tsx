"use client";

import type { ContentStatus } from "@/generated/prisma/enums";

import { MultiSelectCombobox } from "@/components/admin/catalogue/multi-select";
import { CONTENT_STATUSES } from "@/components/admin/catalogue/filters";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { AdminNamedOption } from "@/server/queries/admin-products";
import type { AdminCategoryOption } from "@/server/queries/admin-categories";

export type ProductSettingsValues = {
  categoryId: string | null;
  relatedProductIds: string[];
  status: ContentStatus;
  isFeatured: boolean;
  isNew: boolean;
  includesDesign: boolean;
  sameDayAvailable: boolean;
  turnaroundDays: string;
  sku: string;
  publishedAt: string;
};

export function ProductSettingsTab({
  values,
  categories,
  products,
  onChange,
}: {
  values: ProductSettingsValues;
  categories: AdminCategoryOption[];
  products: AdminNamedOption[];
  onChange: (patch: Partial<ProductSettingsValues>) => void;
}) {
  return (
    <div className="grid max-w-xl gap-6">
      <div className="grid gap-2">
        <Label htmlFor="sku">SKU</Label>
        <Input id="sku" value={values.sku} onChange={(event) => onChange({ sku: event.target.value })} />
      </div>
      <div className="grid gap-2">
        <Label>Category</Label>
        <Select
          value={values.categoryId ?? "none"}
          onValueChange={(value) => onChange({ categoryId: value === "none" ? null : value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <MultiSelectCombobox
        label="Related products"
        options={products}
        value={values.relatedProductIds}
        onChange={(relatedProductIds) => onChange({ relatedProductIds })}
      />
      <div className="grid gap-2">
        <Label>Status</Label>
        <Select
          value={values.status}
          onValueChange={(value) => onChange({ status: value as ContentStatus })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONTENT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <label className="flex items-center justify-between gap-3 text-sm">
        Featured
        <Switch checked={values.isFeatured} onCheckedChange={(isFeatured) => onChange({ isFeatured })} />
      </label>
      <label className="flex items-center justify-between gap-3 text-sm">
        New
        <Switch checked={values.isNew} onCheckedChange={(isNew) => onChange({ isNew })} />
      </label>
      <label className="flex items-center justify-between gap-3 text-sm">
        Includes design
        <Switch
          checked={values.includesDesign}
          onCheckedChange={(includesDesign) => onChange({ includesDesign })}
        />
      </label>
      <label className="flex items-center justify-between gap-3 text-sm">
        Same-day available
        <Switch
          checked={values.sameDayAvailable}
          onCheckedChange={(sameDayAvailable) => onChange({ sameDayAvailable })}
        />
      </label>
      <div className="grid gap-2">
        <Label htmlFor="turnaround">Turnaround days</Label>
        <Input
          id="turnaround"
          inputMode="numeric"
          value={values.turnaroundDays}
          onChange={(event) => onChange({ turnaroundDays: event.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="published-at">Publish date</Label>
        <Input
          id="published-at"
          type="datetime-local"
          value={values.publishedAt}
          onChange={(event) => onChange({ publishedAt: event.target.value })}
        />
      </div>
    </div>
  );
}
