import { verifyPreviewToken } from "@/lib/preview-token";
import type { Locale } from "@/i18n/locales";
import type { PageDetail } from "@/types/content";
import { getPageByIdUncached, getPageBySlugPath } from "@/server/queries/pages";

export type PagePreviewResult = {
  entity: PageDetail;
  isPreview: boolean;
};

function pathMatches(entity: PageDetail, segments: string[]): boolean {
  const requested = segments.filter((segment) => segment && segment !== "home");
  const actual = entity.path.filter((segment) => segment && segment !== "home");
  if (entity.identitySlug === "home" && requested.length === 0) {
    return true;
  }
  if (actual.join("/") === requested.join("/")) {
    return true;
  }
  const leaf = segments.at(-1);
  return entity.slug === leaf || entity.identitySlug === leaf;
}

export async function resolveCmsPage(
  segments: string[],
  locale: Locale,
  preview: string | undefined,
): Promise<PagePreviewResult | null> {
  const live = await getPageBySlugPath(segments, locale);
  const payload = verifyPreviewToken(preview);
  if (payload?.type === "page") {
    const draft = await getPageByIdUncached(payload.id, locale);
    if (draft && pathMatches(draft, segments)) {
      return { entity: draft, isPreview: true };
    }
  }
  if (live) {
    return { entity: live, isPreview: false };
  }
  return null;
}
