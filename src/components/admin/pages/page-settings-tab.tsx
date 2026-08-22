"use client";

import type { ContentStatus } from "@/generated/prisma/enums";

import { CONTENT_STATUSES } from "@/components/admin/catalogue/filters";
import { toDatetimeLocal } from "@/components/admin/catalogue/form-utils";
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
import type { AdminPageOption } from "@/server/queries/admin-pages";

export type PageSettingsValues = {
  status: ContentStatus;
  parentId: string | null;
  template: string;
  sortOrder: string;
  showInSitemap: boolean;
  priority: string;
  changeFrequency: string;
  publishedAt: string;
  pathEn: string;
};

export function PageSettingsTab({
  values,
  parents,
  onChange,
}: {
  values: PageSettingsValues;
  parents: AdminPageOption[];
  onChange: (patch: Partial<PageSettingsValues>) => void;
}) {
  return (
    <div className="grid max-w-xl gap-6">
      <p className="text-sm text-muted-foreground">
        Public path: <span className="font-mono">{values.pathEn || "/"}</span>
      </p>
      <div className="grid gap-2">
        <Label>Status</Label>
        <Select value={values.status} onValueChange={(status) => onChange({ status: status as ContentStatus })}>
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
      <div className="grid gap-2">
        <Label>Parent page</Label>
        <Select
          value={values.parentId ?? "none"}
          onValueChange={(value) => onChange({ parentId: value === "none" ? null : value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None (top level)</SelectItem>
            {parents.map((parent) => (
              <SelectItem key={parent.id} value={parent.id}>
                {parent.title} ({parent.path})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="page-template">Template</Label>
        <Input
          id="page-template"
          value={values.template}
          placeholder="default"
          onChange={(event) => onChange({ template: event.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="page-sort">Sort order</Label>
        <Input
          id="page-sort"
          inputMode="numeric"
          value={values.sortOrder}
          onChange={(event) => onChange({ sortOrder: event.target.value })}
        />
      </div>
      <div className="flex items-center justify-between rounded-md border px-3 py-2">
        <Label htmlFor="page-sitemap">Show in sitemap</Label>
        <Switch
          id="page-sitemap"
          checked={values.showInSitemap}
          onCheckedChange={(showInSitemap) => onChange({ showInSitemap })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="page-priority">Sitemap priority</Label>
        <Input
          id="page-priority"
          inputMode="decimal"
          value={values.priority}
          placeholder="0.5"
          onChange={(event) => onChange({ priority: event.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="page-freq">Change frequency</Label>
        <Input
          id="page-freq"
          value={values.changeFrequency}
          placeholder="weekly"
          onChange={(event) => onChange({ changeFrequency: event.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="page-published">Publish at</Label>
        <Input
          id="page-published"
          type="datetime-local"
          value={toDatetimeLocal(values.publishedAt || undefined)}
          onChange={(event) => onChange({ publishedAt: event.target.value })}
        />
      </div>
    </div>
  );
}
