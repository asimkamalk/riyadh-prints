import type { PageDetail } from "@/types/content";
import { absoluteUrl } from "@/lib/utils/site-url";

export function pageJsonLd(page: PageDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.seo.metaTitle || page.title,
    description: page.seo.metaDescription || page.excerpt || undefined,
    url: absoluteUrl(page.href),
  };
}
