import Image from "next/image";

import { TiptapBody } from "@/components/sections/tiptap-body";
import { Breadcrumbs, type Crumb } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { FaqSection } from "@/components/site/content-chrome";
import { mediaToGalleryItem } from "@/components/site/gallery-types";
import { LazyGallery } from "@/components/site/lazy-gallery";
import { pageText } from "@/components/site/page-copy";
import type { Locale } from "@/i18n/locales";
import { collectionFromProject } from "@/lib/seo/json-ld";
import { tiptapToPlainText } from "@/lib/tiptap-text";
import type { FaqDto, ProjectDetail } from "@/types/content";

export function ProjectDetailView({
  locale,
  project,
  faqs,
  crumbs,
}: {
  locale: Locale;
  project: ProjectDetail;
  faqs: FaqDto[];
  crumbs: Crumb[];
}) {
  const gallery = project.images.map((image) =>
    mediaToGalleryItem({ ...image, alt: image.alt || project.title }),
  );
  const hasBody = Boolean(tiptapToPlainText(project.content));
  const completed = project.completedAt
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-GB", {
        month: "long",
        year: "numeric",
      }).format(new Date(project.completedAt))
    : null;

  return (
    <article className="container-page py-xl">
      <Breadcrumbs items={crumbs} />
      <JsonLd data={collectionFromProject(project)} />
      {project.coverImage ? (
        <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-xl bg-muted">
          <Image
            src={project.coverImage.url}
            alt={project.coverImage.alt || project.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
            placeholder={project.coverImage.blurDataUrl ? "blur" : "empty"}
            blurDataURL={project.coverImage.blurDataUrl ?? undefined}
          />
        </div>
      ) : null}
      <h1 className="text-3xl font-semibold tracking-tight">{project.title}</h1>
      {project.clientName || completed ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {[project.clientName, completed].filter(Boolean).join(" · ")}
        </p>
      ) : null}
      {project.summary ? <p className="mt-4 text-lg text-muted-foreground">{project.summary}</p> : null}
      <dl className="mt-8 grid gap-6 md:grid-cols-3">
        {project.challenge ? (
          <div>
            <dt className="font-medium">{pageText(locale, "challenge")}</dt>
            <dd className="mt-2 text-sm text-muted-foreground">{project.challenge}</dd>
          </div>
        ) : null}
        {project.solution ? (
          <div>
            <dt className="font-medium">{pageText(locale, "solution")}</dt>
            <dd className="mt-2 text-sm text-muted-foreground">{project.solution}</dd>
          </div>
        ) : null}
        {project.result ? (
          <div>
            <dt className="font-medium">{pageText(locale, "result")}</dt>
            <dd className="mt-2 text-sm text-muted-foreground">{project.result}</dd>
          </div>
        ) : null}
      </dl>
      {gallery.length ? (
        <div className="mt-10">
          <LazyGallery items={gallery} locale={locale} />
        </div>
      ) : null}
      {hasBody ? (
        <div className="prose-rp mt-12">
          <TiptapBody value={project.content} />
        </div>
      ) : null}
      <FaqSection locale={locale} faqs={faqs} />
    </article>
  );
}
