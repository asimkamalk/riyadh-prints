"use client";

import type { ContentStatus } from "@/generated/prisma/enums";

import { CONTENT_STATUSES } from "@/components/admin/catalogue/filters";
import { MediaField } from "@/components/admin/media-field";
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
import type { AdminCategoryOption } from "@/server/queries/admin-categories";
import type { AdminMediaRecord } from "@/server/queries/media";

export type ServiceSettingsValues = {
  categoryId: string | null;
  status: ContentStatus;
  isFeatured: boolean;
  turnaroundTime: string;
  startingPrice: string;
  iconName: string;
  image: AdminMediaRecord | null;
  heroImage: AdminMediaRecord | null;
  publishedAt: string;
};

export function ServiceSettingsTab({
  values,
  categories,
  onChange,
}: {
  values: ServiceSettingsValues;
  categories: AdminCategoryOption[];
  onChange: (patch: Partial<ServiceSettingsValues>) => void;
}) {
  return (
    <div className="grid max-w-xl gap-6">
      <div className="grid gap-2">
        <Label>Category</Label>
        <Select
          value={values.categoryId ?? "none"}
          onValueChange={(value) => onChange({ categoryId: value === "none" ? null : value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
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
      <div className="grid gap-2">
        <Label htmlFor="svc-turnaround">Turnaround time</Label>
        <Input
          id="svc-turnaround"
          value={values.turnaroundTime}
          placeholder="24 hours"
          onChange={(event) => onChange({ turnaroundTime: event.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="starting-price">Starting price (SAR)</Label>
        <Input
          id="starting-price"
          inputMode="decimal"
          value={values.startingPrice}
          onChange={(event) => onChange({ startingPrice: event.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="svc-icon">Icon name</Label>
        <Input
          id="svc-icon"
          value={values.iconName}
          onChange={(event) => onChange({ iconName: event.target.value })}
        />
      </div>
      <MediaField label="Card image" value={values.image} onChange={(image) => onChange({ image })} />
      <MediaField label="Hero image" value={values.heroImage} onChange={(heroImage) => onChange({ heroImage })} />
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
      <div className="grid gap-2">
        <Label htmlFor="svc-published">Publish date</Label>
        <Input
          id="svc-published"
          type="datetime-local"
          value={values.publishedAt}
          onChange={(event) => onChange({ publishedAt: event.target.value })}
        />
      </div>
    </div>
  );
}
