import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";

import {
  isAdminPath,
  localeFromPathname,
  LOCALE_COOKIE,
  resolveLocale,
  stripLocalePrefix,
  withLocalePath,
  type Locale,
} from "@/i18n/routing";
import {
  applyCachedRedirect,
  loadRedirectMapForMiddleware,
} from "@/lib/middleware-redirects";
import { authConfig } from "@/server/auth/auth.config";

const { auth } = NextAuth(authConfig);

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function withLocaleCookie(response: NextResponse, locale: Locale): NextResponse {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
  return response;
}

function handleLocale(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const pathLocale = localeFromPathname(pathname);
  const locale = resolveLocale(
    pathname,
    request.cookies.get(LOCALE_COOKIE)?.value,
    request.headers.get("accept-language"),
  );
  const stripped = stripLocalePrefix(pathname);

  if (isAdminPath(pathname)) {
    if (pathLocale) {
      const url = request.nextUrl.clone();
      url.pathname = stripped;
      return NextResponse.redirect(url);
    }
    return withLocaleCookie(NextResponse.next(), locale);
  }

  if (pathLocale === "en") {
    const url = request.nextUrl.clone();
    url.pathname = stripped;
    return withLocaleCookie(NextResponse.redirect(url), "en");
  }

  if (!pathLocale && locale === "ar") {
    const url = request.nextUrl.clone();
    url.pathname = withLocalePath("ar", stripped);
    return withLocaleCookie(NextResponse.redirect(url), "ar");
  }

  if (pathLocale === "ar") {
    return withLocaleCookie(NextResponse.next(), "ar");
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = `/en${stripped === "/" ? "" : stripped}`;
  return withLocaleCookie(NextResponse.rewrite(rewriteUrl), "en");
}

export default auth(async (request) => {
  const map = await loadRedirectMapForMiddleware(request);
  const redirected = applyCachedRedirect(request, map);
  if (redirected) {
    return redirected;
  }
  return handleLocale(request);
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next/data|_next/webpack-hmr|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
