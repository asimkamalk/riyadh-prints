import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";

import {
  isAdminPath,
  localeFromPathname,
  LOCALE_COOKIE,
  stripLocalePrefix,
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

function nextWithPath(request: NextRequest, pathname: string, locale: Locale): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set("x-locale", locale);
  return withLocaleCookie(NextResponse.next({ request: { headers: requestHeaders } }), locale);
}

function handleLocale(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const pathLocale = localeFromPathname(pathname);
  const stripped = stripLocalePrefix(pathname);

  if (isAdminPath(pathname)) {
    if (pathLocale) {
      const url = request.nextUrl.clone();
      url.pathname = stripped;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathLocale === "en") {
    const url = request.nextUrl.clone();
    url.pathname = stripped;
    return withLocaleCookie(NextResponse.redirect(url), "en");
  }

  if (pathLocale === "ar") {
    return nextWithPath(request, pathname, "ar");
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = `/en${stripped === "/" ? "" : stripped}`;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set("x-locale", "en");
  return withLocaleCookie(
    NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } }),
    "en",
  );
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
