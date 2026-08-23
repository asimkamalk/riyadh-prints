import { stripLocalePrefix } from "@/i18n/routing";
import { normalizePathname } from "@/lib/pathname";

export const RESERVED_SITE_SEGMENTS = [
  "shop",
  "products",
  "product",
  "product-category",
  "services",
  "blogs",
  "blog",
  "portfolio",
  "request-a-quote",
  "contact",
  "faqs",
  "search",
  "design-system",
  "preview",
  "author",
] as const;

const reservedSet = new Set<string>(RESERVED_SITE_SEGMENTS);

export function isReservedSiteSegment(segment: string): boolean {
  return reservedSet.has(segment);
}

export type SiteRoute =
  | { kind: "home" }
  | { kind: "shop" }
  | { kind: "product"; slug: string }
  | { kind: "category"; slug: string }
  | { kind: "services" }
  | { kind: "service"; slug: string }
  | { kind: "blogs" }
  | { kind: "post"; slug: string }
  | { kind: "post-category"; slug: string }
  | { kind: "post-tag"; slug: string }
  | { kind: "portfolio" }
  | { kind: "project"; slug: string }
  | { kind: "quote" }
  | { kind: "contact" }
  | { kind: "faqs" }
  | { kind: "author"; slug: string }
  | { kind: "search" }
  | { kind: "page"; segments: string[] };

export function parseSitePath(pathname: string): SiteRoute {
  const path = stripLocalePrefix(normalizePathname(pathname));
  if (path === "/") {
    return { kind: "home" };
  }
  const parts = path.slice(1).split("/").filter(Boolean);
  if (parts[0] === "preview") {
    return { kind: "home" };
  }
  if (parts[0] === "search") {
    return { kind: "search" };
  }
  if (parts.length === 1) {
    if (parts[0] === "shop") {
      return { kind: "shop" };
    }
    if (parts[0] === "services") {
      return { kind: "services" };
    }
    if (parts[0] === "blogs" || parts[0] === "blog") {
      return { kind: "blogs" };
    }
    if (parts[0] === "portfolio") {
      return { kind: "portfolio" };
    }
    if (parts[0] === "request-a-quote") {
      return { kind: "quote" };
    }
    if (parts[0] === "contact") {
      return { kind: "contact" };
    }
    if (parts[0] === "faqs") {
      return { kind: "faqs" };
    }
  }
  if (parts.length === 2) {
    const [prefix, slug] = parts;
    if (prefix === "product") {
      return { kind: "product", slug };
    }
    if (prefix === "product-category") {
      return { kind: "category", slug };
    }
    if (prefix === "services") {
      return { kind: "service", slug };
    }
    if (prefix === "blogs" || prefix === "blog") {
      return { kind: "post", slug };
    }
    if (prefix === "portfolio") {
      return { kind: "project", slug };
    }
    if (prefix === "author") {
      return { kind: "author", slug };
    }
  }
  if (parts.length === 3 && (parts[0] === "blogs" || parts[0] === "blog")) {
    if (parts[1] === "category") {
      return { kind: "post-category", slug: parts[2] };
    }
    if (parts[1] === "tag") {
      return { kind: "post-tag", slug: parts[2] };
    }
  }
  return { kind: "page", segments: parts };
}
