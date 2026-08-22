import { stripLocalePrefix } from "@/i18n/routing";
import { normalizePathname } from "@/lib/pathname";

export type SiteRoute =
  | { kind: "home" }
  | { kind: "product"; slug: string }
  | { kind: "category"; slug: string }
  | { kind: "service"; slug: string }
  | { kind: "post"; slug: string }
  | { kind: "project"; slug: string }
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
    if (prefix === "blog") {
      return { kind: "post", slug };
    }
    if (prefix === "portfolio") {
      return { kind: "project", slug };
    }
    if (prefix === "author") {
      return { kind: "author", slug };
    }
  }
  return { kind: "page", segments: parts };
}
