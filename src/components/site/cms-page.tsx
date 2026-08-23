import { DraftPreviewBanner } from "@/components/site/draft-preview-banner";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { RenderPageSections } from "@/components/sections/render-page-sections";
import type { Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { tiptapToPlainText } from "@/lib/tiptap-text";
import type { PageDetail } from "@/types/content";

export function CmsPageView({
  page,
  locale,
  isPreview,
}: {
  page: PageDetail;
  locale: Locale;
  isPreview: boolean;
}) {
  const hasHero = page.sections.some((section) => section.type === "HERO");
  const skipDefaultTitle = hasHero || page.template === "sections";
  const isHome = page.path.filter((segment) => segment && segment !== "home").length === 0;
  const crumbs = isHome
    ? [{ label: locale === "ar" ? "الرئيسية" : "Home" }]
    : [
        { href: withLocalePath(locale, "/"), label: locale === "ar" ? "الرئيسية" : "Home" },
        ...page.path
          .filter((segment) => segment && segment !== "home")
          .map((segment, index, all) => {
            const href = withLocalePath(locale, `/${all.slice(0, index + 1).join("/")}`);
            const isLast = index === all.length - 1;
            return isLast ? { label: page.title } : { href, label: segment };
          }),
      ];
  const body = tiptapToPlainText(page.content);

  return (
    <article>
      {isPreview || !isHome ? (
        <div className="container-page pt-6">
          {isPreview ? <DraftPreviewBanner /> : null}
          {isHome ? null : <Breadcrumbs items={crumbs} />}
        </div>
      ) : null}
      {!skipDefaultTitle ? (
        <div className="container-page pb-8">
          <h1 className="text-4xl font-semibold tracking-tight">{page.title}</h1>
          {page.excerpt ? <p className="mt-3 text-lg text-muted-foreground">{page.excerpt}</p> : null}
        </div>
      ) : null}
      {page.sections.length ? (
        <RenderPageSections
          sections={page.sections}
          locale={locale}
          pageId={page.id}
          pageHasH1={!skipDefaultTitle}
        />
      ) : body ? (
        <div className="container-page prose-rp pb-16">
          {hasHero ? <h2 className="sr-only">{page.title}</h2> : null}
          {body.split(/\n{2,}/).map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      ) : null}
    </article>
  );
}
