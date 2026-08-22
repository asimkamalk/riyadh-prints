import Image from "next/image";

import type { SeoValues } from "@/components/admin/seo-score";

export function SeoPreviews({ values }: { values: SeoValues }) {
  const title = values.metaTitle || values.pageTitle || "Untitled";
  const description =
    values.metaDescription || "Add a meta description to control this snippet.";
  const url = values.canonicalUrl || values.pageUrl;
  const displayUrl = url.replace(/^https?:\/\//, "");
  const ogTitle = values.ogTitle || title;
  const ogDescription = values.ogDescription || description;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-lg border p-4">
        <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Google preview
        </p>
        <div className="max-w-[600px] font-sans">
          <p className="truncate text-sm text-[#202124] dark:text-foreground">{displayUrl}</p>
          <p className="text-xl leading-snug text-[#1a0dab] dark:text-blue-400">{title}</p>
          <p className="text-sm leading-snug text-[#4d5156] dark:text-muted-foreground">
            {description}
          </p>
        </div>
      </section>
      <section className="rounded-lg border p-4">
        <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Social preview
        </p>
        <div className="overflow-hidden rounded-md border">
          <div className="relative aspect-[1.91/1] bg-muted">
            {values.ogImageUrl ? (
              <Image src={values.ogImageUrl} alt="" fill className="object-cover" unoptimized />
            ) : (
              <div className="grid size-full place-items-center text-xs text-muted-foreground">
                No OG image
              </div>
            )}
          </div>
          <div className="grid gap-1 bg-muted/40 p-3">
            <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
              {displayUrl.split("/")[0]}
            </p>
            <p className="line-clamp-1 text-sm font-semibold">{ogTitle}</p>
            <p className="line-clamp-2 text-xs text-muted-foreground">{ogDescription}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
