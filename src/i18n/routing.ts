import { isLocale, locales, type Locale } from "./locales";

export const LOCALE_COOKIE = "NEXT_LOCALE";
export const DEFAULT_LOCALE = "en" as const;

export { type Locale, locales };

export function localeFromPathname(pathname: string): Locale | null {
  if (pathname === "/ar" || pathname.startsWith("/ar/")) {
    return "ar";
  }
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return "en";
  }
  return null;
}

export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/ar" || pathname === "/en") {
    return "/";
  }
  if (pathname.startsWith("/ar/") || pathname.startsWith("/en/")) {
    const stripped = pathname.slice(3);
    return stripped.startsWith("/") ? stripped : `/${stripped}`;
  }
  return pathname;
}

export function withLocalePath(locale: Locale, pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (locale === "en") {
    return path;
  }
  return path === "/" ? "/ar" : `/ar${path}`;
}

export function prefersArabic(acceptLanguage: string): boolean {
  const parts = acceptLanguage.split(",").map((part) => {
    const [tagRaw, qRaw] = part.trim().split(";q=");
    const tag = (tagRaw ?? "").toLowerCase();
    const q = qRaw ? Number.parseFloat(qRaw) : 1;
    return { tag, q: Number.isFinite(q) ? q : 0 };
  });
  parts.sort((a, b) => b.q - a.q);
  for (const { tag } of parts) {
    if (tag === "*" || tag.length === 0) {
      continue;
    }
    if (tag === "ar" || tag.startsWith("ar-")) {
      return true;
    }
    if (tag === "en" || tag.startsWith("en-")) {
      return false;
    }
  }
  return false;
}

export function negotiateLocale(
  cookie: string | undefined,
  acceptLanguage: string | null,
): Locale {
  if (cookie && isLocale(cookie)) {
    return cookie;
  }
  if (acceptLanguage && prefersArabic(acceptLanguage)) {
    return "ar";
  }
  return DEFAULT_LOCALE;
}

export function resolveLocale(
  pathname: string,
  cookie: string | undefined,
  acceptLanguage: string | null,
): Locale {
  return localeFromPathname(pathname) ?? negotiateLocale(cookie, acceptLanguage);
}

export function isAdminPath(pathname: string): boolean {
  const stripped = stripLocalePrefix(pathname);
  return stripped === "/admin" || stripped.startsWith("/admin/");
}

export function isAdminLoginPath(pathname: string): boolean {
  return stripLocalePrefix(pathname) === "/admin/login";
}
