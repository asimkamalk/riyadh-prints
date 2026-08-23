import type { Locale } from "@/i18n/locales";
import { withLocalePath } from "@/i18n/routing";
import { parseHoursDays } from "@/lib/hours";
import {
  AREA_SERVED_CITY,
  AREA_SERVED_COUNTRY,
  PRICE_RANGE,
  SITE_NAME,
  absoluteUrl,
  getSiteUrl,
  localBusinessId,
  organizationId,
  websiteId,
} from "@/lib/seo/config";
import { compactJsonLd, type JsonLdNode } from "@/lib/seo/compact";
import { tiptapToPlainText } from "@/lib/tiptap-text";
import type {
  CategoryDetail,
  FaqDto,
  PostDetail,
  ProductCard,
  ProductDetail,
  ProjectDetail,
  ServiceCard,
  ServiceDetail,
  SiteSettingsDto,
  TeamMemberDetail,
} from "@/types/content";

const SCHEMA = "https://schema.org";

const DAY_NAMES: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export type CrumbItem = { href?: string; label: string };

export type ImageObjectInput = {
  url: string;
  width?: number | null;
  height?: number | null;
  caption?: string | null;
  alt?: string | null;
};

export type ItemListEntry = {
  name: string;
  url: string;
  image?: string | null;
};

export type ProductSchemaInput = {
  name: string;
  description?: string | null;
  sku?: string | null;
  url: string;
  images: string[];
  price?: string | null;
  priceCurrency?: string;
  brandName?: string;
  reviews?: { ratingValue: number; reviewCount: number } | null;
};

export type ArticleSchemaInput = {
  headline: string;
  description?: string | null;
  url: string;
  image?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
  authorName?: string | null;
};

export type ServiceSchemaInput = {
  name: string;
  description?: string | null;
  url: string;
  image?: string | null;
};

export type CollectionPageInput = {
  name: string;
  url: string;
  description?: string | null;
  image?: string | null;
};

function sameAs(settings: SiteSettingsDto): string[] {
  return Object.values(settings.social).filter((url): url is string => Boolean(url));
}

function openingHours(hours: unknown): JsonLdNode[] {
  return parseHoursDays(hours).flatMap((day) => {
    const name = DAY_NAMES[day.day.trim().toLowerCase()];
    if (!name || day.closed || !day.open || !day.close) {
      return [];
    }
    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `${SCHEMA}/${name}`,
        opens: day.open,
        closes: day.close,
      },
    ];
  });
}

function nodeUrl(pathOrUrl: string): string {
  return absoluteUrl(pathOrUrl);
}

export function organization(settings: SiteSettingsDto): JsonLdNode {
  return compactJsonLd({
    "@context": SCHEMA,
    "@type": "Organization",
    "@id": organizationId(),
    name: settings.companyName || SITE_NAME,
    url: getSiteUrl(),
    email: settings.email || undefined,
    telephone: settings.phone || undefined,
    description: settings.tagline || undefined,
    logo: settings.defaultOgImageUrl ? absoluteUrl(settings.defaultOgImageUrl) : undefined,
    sameAs: sameAs(settings),
  });
}

export function localBusiness(settings: SiteSettingsDto): JsonLdNode {
  const location = settings.location;
  const hours = location?.hours ?? settings.hours;
  const geo =
    location?.lat != null && location?.lng != null
      ? { "@type": "GeoCoordinates", latitude: location.lat, longitude: location.lng }
      : undefined;
  return compactJsonLd({
    "@context": SCHEMA,
    "@type": "LocalBusiness",
    "@id": localBusinessId(),
    name: settings.companyName || SITE_NAME,
    url: getSiteUrl(),
    email: location?.email || settings.email || undefined,
    telephone: location?.phone || settings.phone || undefined,
    description: settings.tagline || undefined,
    image: settings.defaultOgImageUrl ? absoluteUrl(settings.defaultOgImageUrl) : undefined,
    priceRange: PRICE_RANGE,
    parentOrganization: { "@id": organizationId() },
    address: {
      "@type": "PostalAddress",
      streetAddress: location?.addressLine1 || settings.address || undefined,
      addressLocality: location?.city || AREA_SERVED_CITY,
      addressRegion: location?.region || undefined,
      postalCode: location?.postalCode || undefined,
      addressCountry: location?.country || AREA_SERVED_COUNTRY,
    },
    geo,
    openingHoursSpecification: openingHours(hours),
    areaServed: [
      { "@type": "City", name: AREA_SERVED_CITY },
      { "@type": "Country", name: "Saudi Arabia" },
    ],
    sameAs: sameAs(settings),
  });
}

export function website(settings: SiteSettingsDto, locale: Locale): JsonLdNode {
  const searchPath = withLocalePath(locale, "/search");
  return compactJsonLd({
    "@context": SCHEMA,
    "@type": "WebSite",
    "@id": websiteId(),
    name: settings.companyName || SITE_NAME,
    url: getSiteUrl(),
    description: settings.tagline || undefined,
    inLanguage: locale === "ar" ? "ar" : "en",
    publisher: { "@id": organizationId() },
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl(searchPath)}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  });
}

export function breadcrumbList(items: readonly CrumbItem[]): JsonLdNode {
  return compactJsonLd({
    "@context": SCHEMA,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? nodeUrl(item.href) : undefined,
    })),
  });
}

export function imageObject(input: ImageObjectInput): JsonLdNode {
  return compactJsonLd({
    "@context": SCHEMA,
    "@type": "ImageObject",
    url: nodeUrl(input.url),
    width: input.width ?? undefined,
    height: input.height ?? undefined,
    caption: input.caption || input.alt || undefined,
  });
}

export function product(input: ProductSchemaInput): JsonLdNode {
  const reviews =
    input.reviews && input.reviews.reviewCount > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: input.reviews.ratingValue,
          reviewCount: input.reviews.reviewCount,
        }
      : undefined;
  return compactJsonLd({
    "@context": SCHEMA,
    "@type": "Product",
    name: input.name,
    description: input.description || undefined,
    sku: input.sku || undefined,
    image: input.images.filter(Boolean).map((url) => nodeUrl(url)),
    url: nodeUrl(input.url),
    brand: {
      "@type": "Brand",
      name: input.brandName || SITE_NAME,
      "@id": organizationId(),
    },
    offers: input.price
      ? {
          "@type": "Offer",
          url: nodeUrl(input.url),
          price: input.price,
          priceCurrency: input.priceCurrency || "SAR",
          availability: `${SCHEMA}/InStock`,
        }
      : undefined,
    aggregateRating: reviews,
  });
}

export function itemList(products: readonly ItemListEntry[]): JsonLdNode {
  return compactJsonLd({
    "@context": SCHEMA,
    "@type": "ItemList",
    numberOfItems: products.length,
    itemListElement: products.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: nodeUrl(item.url),
      image: item.image ? nodeUrl(item.image) : undefined,
    })),
  });
}

export function article(input: ArticleSchemaInput): JsonLdNode {
  return compactJsonLd({
    "@context": SCHEMA,
    "@type": "Article",
    headline: input.headline,
    description: input.description || undefined,
    image: input.image ? nodeUrl(input.image) : undefined,
    datePublished: input.datePublished || undefined,
    dateModified: input.dateModified || input.datePublished || undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": nodeUrl(input.url),
    },
    author: input.authorName
      ? { "@type": "Person", name: input.authorName }
      : { "@id": organizationId() },
    publisher: { "@id": organizationId() },
  });
}

export function faqPage(items: readonly Pick<FaqDto, "question" | "answer">[]): JsonLdNode | null {
  const mainEntity = items.flatMap((item) => {
    const name = item.question.trim();
    const text = tiptapToPlainText(item.answer);
    if (!name || !text) {
      return [];
    }
    return [
      {
        "@type": "Question",
        name,
        acceptedAnswer: { "@type": "Answer", text },
      },
    ];
  });
  if (mainEntity.length === 0) {
    return null;
  }
  return compactJsonLd({
    "@context": SCHEMA,
    "@type": "FAQPage",
    mainEntity,
  });
}

export function service(input: ServiceSchemaInput): JsonLdNode {
  return compactJsonLd({
    "@context": SCHEMA,
    "@type": "Service",
    name: input.name,
    description: input.description || undefined,
    url: nodeUrl(input.url),
    image: input.image ? nodeUrl(input.image) : undefined,
    provider: { "@id": organizationId() },
    areaServed: [
      { "@type": "City", name: AREA_SERVED_CITY },
      { "@type": "Country", name: "Saudi Arabia" },
    ],
  });
}

export function collectionPage(input: CollectionPageInput): JsonLdNode {
  return compactJsonLd({
    "@context": SCHEMA,
    "@type": "CollectionPage",
    name: input.name,
    description: input.description || undefined,
    url: nodeUrl(input.url),
    image: input.image ? nodeUrl(input.image) : undefined,
    isPartOf: { "@id": websiteId() },
  });
}

export function productFromDetail(detail: ProductDetail): JsonLdNode {
  const images = (detail.images.length ? detail.images : detail.primaryImage ? [detail.primaryImage] : []).map(
    (image) => image.url,
  );
  return product({
    name: detail.name,
    description: detail.shortDescription,
    sku: detail.sku,
    url: detail.href,
    images,
    price: detail.basePrice,
  });
}

export function articleFromPost(post: PostDetail): JsonLdNode {
  return article({
    headline: post.title,
    description: post.excerpt,
    url: post.href,
    image: post.coverImage?.url,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    authorName: post.author?.name,
  });
}

export function serviceFromDetail(detail: ServiceDetail): JsonLdNode {
  return service({
    name: detail.name,
    description: detail.shortDescription,
    url: detail.href,
    image: detail.heroImage?.url ?? detail.image?.url,
  });
}

export function collectionFromCategory(category: CategoryDetail): JsonLdNode {
  return collectionPage({
    name: category.name,
    url: category.href,
    description: category.shortDescription,
    image: category.image?.url,
  });
}

export function itemListFromProducts(products: readonly ProductCard[]): JsonLdNode {
  return itemList(
    products.map((item) => ({
      name: item.name,
      url: item.href,
      image: item.primaryImage?.url,
    })),
  );
}

export function itemListFromServices(services: readonly ServiceCard[]): JsonLdNode {
  return itemList(
    services.map((item) => ({
      name: item.name,
      url: item.href,
      image: item.image?.url,
    })),
  );
}

export function collectionFromProject(project: ProjectDetail): JsonLdNode {
  return collectionPage({
    name: project.title,
    url: project.href,
    description: project.summary,
    image: project.coverImage?.url,
  });
}

export function personFromTeamMember(member: TeamMemberDetail): JsonLdNode {
  const jobTitle = [member.role, member.secondaryRole].filter(Boolean).join(" / ");
  return compactJsonLd({
    "@context": SCHEMA,
    "@type": "Person",
    name: member.name,
    jobTitle: jobTitle || undefined,
    description: member.bio || undefined,
    email: member.email || undefined,
    telephone: member.phone || undefined,
    image: member.avatar?.url ? nodeUrl(member.avatar.url) : undefined,
    url: nodeUrl(member.href),
    sameAs: [member.socials.linkedin, member.socials.facebook, member.socials.twitter].filter(
      Boolean,
    ) as string[],
    worksFor: { "@id": organizationId() },
  });
}
