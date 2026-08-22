"use client";

import { useEffect, useRef, useState } from "react";

import type { Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { slugFromTitle, type SlugModel } from "@/lib/slug";
import { getSiteUrl } from "@/lib/utils/site-url";
import { checkSlug } from "@/server/actions/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type SlugInputProps = {
  title: string;
  value: string;
  onChange: (slug: string) => void;
  locale?: Locale;
  model: SlugModel;
  pathPrefix: string;
  excludeId?: string;
  published?: boolean;
  locked?: boolean;
};

export function SlugInput({
  title,
  value,
  onChange,
  locale = "en",
  model,
  pathPrefix,
  excludeId,
  published = false,
  locked = false,
}: SlugInputProps) {
  const [manual, setManual] = useState(Boolean(value));
  const [available, setAvailable] = useState<boolean | null>(null);
  const lastChecked = useRef("");
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!manual && title) {
      onChangeRef.current(slugFromTitle(title));
    }
  }, [manual, title]);

  useEffect(() => {
    const slug = value.trim();
    if (!slug) {
      setAvailable(null);
      return;
    }
    const handle = window.setTimeout(() => {
      if (lastChecked.current === slug) {
        return;
      }
      lastChecked.current = slug;
      void checkSlug({ model, locale, slug, excludeId }).then((result) => {
        setAvailable(result.ok ? result.data.available : null);
      });
    }, 400);
    return () => window.clearTimeout(handle);
  }, [excludeId, locale, model, value]);

  const path = `${pathPrefix}/${value || "…"}`.replace(/\/{2,}/g, "/");
  const url = `${getSiteUrl()}${withLocalePath(locale, path)}`;
  const publishedWarning = published && !locked;

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="slug">Slug</Label>
        <button
          type="button"
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          onClick={() => setManual((current) => !current)}
        >
          {manual ? "Auto from title" : "Edit slug"}
        </button>
      </div>
      <Input
        id="slug"
        value={value}
        readOnly={!manual}
        onChange={(event) => {
          setManual(true);
          onChange(slugFromTitle(event.target.value) || event.target.value);
        }}
        aria-invalid={available === false}
      />
      <p className="break-all text-xs text-muted-foreground">{url}</p>
      {available === false ? (
        <p role="alert" className="text-sm text-destructive">
          This slug is already in use.
        </p>
      ) : null}
      {publishedWarning ? (
        <p role="alert" className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning-foreground">
          Changing a published slug will create a 301 redirect from the old URL.
        </p>
      ) : null}
    </div>
  );
}
