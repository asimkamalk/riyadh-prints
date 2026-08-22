"use client";

import { SeoPreviews } from "@/components/admin/seo-previews";
import {
  computeSeoScore,
  seoCounterTone,
  type SeoValues,
} from "@/components/admin/seo-score";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export type { SeoValues };

type SeoPanelProps = {
  values: SeoValues;
  onChange: (patch: Partial<SeoValues>) => void;
};

export function SeoPanel({ values, onChange }: SeoPanelProps) {
  const title = values.metaTitle || values.pageTitle;
  const { score, warnings } = computeSeoScore(values);

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <div
          className="grid size-14 place-items-center rounded-full border text-lg font-semibold"
          aria-label={`SEO score ${score} of 100`}
        >
          {score}
        </div>
        <p className="text-sm text-muted-foreground">SEO score with live checks for this locale.</p>
      </div>
      {warnings.length > 0 ? (
        <ul className="grid gap-1 text-sm text-warning-foreground">
          {warnings.map((warning) => (
            <li key={warning.id}>• {warning.message}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-success">Looking good — no critical SEO warnings.</p>
      )}
      <div className="grid gap-2">
        <div className="flex justify-between">
          <Label htmlFor="metaTitle">Meta title</Label>
          <span className={seoCounterTone(title.length, 50, 60)}>{title.length}/60</span>
        </div>
        <Input
          id="metaTitle"
          value={values.metaTitle}
          maxLength={70}
          onChange={(event) => onChange({ metaTitle: event.target.value })}
          placeholder={values.pageTitle}
        />
      </div>
      <div className="grid gap-2">
        <div className="flex justify-between">
          <Label htmlFor="metaDescription">Meta description</Label>
          <span className={seoCounterTone(values.metaDescription.length, 140, 160)}>
            {values.metaDescription.length}/160
          </span>
        </div>
        <Textarea
          id="metaDescription"
          rows={3}
          maxLength={180}
          value={values.metaDescription}
          onChange={(event) => onChange({ metaDescription: event.target.value })}
        />
      </div>
      <SeoPreviews values={values} />
      <div className="grid gap-2">
        <Label htmlFor="canonicalUrl">Canonical URL override</Label>
        <Input
          id="canonicalUrl"
          type="url"
          value={values.canonicalUrl}
          onChange={(event) => onChange({ canonicalUrl: event.target.value })}
          placeholder={values.pageUrl}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="focusKeyword">Focus keyword</Label>
        <Input
          id="focusKeyword"
          value={values.focusKeyword}
          onChange={(event) => onChange({ focusKeyword: event.target.value })}
        />
      </div>
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={values.noIndex}
            onCheckedChange={(checked) => onChange({ noIndex: checked })}
          />
          noindex
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={values.noFollow}
            onCheckedChange={(checked) => onChange({ noFollow: checked })}
          />
          nofollow
        </label>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="ogTitle">OG title</Label>
          <Input
            id="ogTitle"
            value={values.ogTitle}
            onChange={(event) => onChange({ ogTitle: event.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ogDescription">OG description</Label>
          <Input
            id="ogDescription"
            value={values.ogDescription}
            onChange={(event) => onChange({ ogDescription: event.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
