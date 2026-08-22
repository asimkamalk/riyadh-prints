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
import { getSiteUrl } from "@/lib/utils/site-url";
import type { AdminMediaRecord } from "@/server/queries/media";
import type { AdminCategoryOption } from "@/server/queries/admin-categories";

export function CategorySettingsTab({
  slugEn,
  status,
  isFeatured,
  parentId,
  sortOrder,
  iconName,
  image,
  productCount,
  excludeId,
  parents,
  onChange,
}: {
  slugEn: string;
  status: ContentStatus;
  isFeatured: boolean;
  parentId: string | null;
  sortOrder: string;
  iconName: string;
  image: AdminMediaRecord | null;
  productCount: number;
  excludeId?: string;
  parents: AdminCategoryOption[];
  onChange: (patch: {
    status?: ContentStatus;
    isFeatured?: boolean;
    parentId?: string | null;
    sortOrder?: string;
    iconName?: string;
    image?: AdminMediaRecord | null;
  }) => void;
}) {
  const url = `${getSiteUrl()}/product-category/${slugEn || "…"}`;
  return (
    <div className="grid max-w-xl gap-6">
      <div className="rounded-lg border p-3 text-sm">
        <p>
          Live URL: <span className="break-all font-medium">{url}</span>
        </p>
        <p className="text-muted-foreground">{productCount} products in this category.</p>
      </div>
      <div className="grid gap-2">
        <Label>Parent</Label>
        <Select
          value={parentId ?? "none"}
          onValueChange={(value) => onChange({ parentId: value === "none" ? null : value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None (top level)</SelectItem>
            {parents
              .filter((option) => option.id !== excludeId)
              .map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="sort-order">Sort order</Label>
        <Input
          id="sort-order"
          inputMode="numeric"
          value={sortOrder}
          onChange={(event) => onChange({ sortOrder: event.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="icon">Icon name</Label>
        <Input
          id="icon"
          value={iconName}
          onChange={(event) => onChange({ iconName: event.target.value })}
        />
      </div>
      <MediaField label="Category image" value={image} onChange={(next) => onChange({ image: next })} />
      <div className="grid gap-2">
        <Label>Status</Label>
        <Select value={status} onValueChange={(value) => onChange({ status: value as ContentStatus })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONTENT_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <label className="flex items-center justify-between gap-3 text-sm">
        Featured
        <Switch checked={isFeatured} onCheckedChange={(checked) => onChange({ isFeatured: checked })} />
      </label>
    </div>
  );
}
