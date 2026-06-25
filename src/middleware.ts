import { NextResponse, type NextRequest } from "next/server";
import {
  localeDetectionVaryHeader,
  localeCookieMaxAge,
  localeCookieName,
  shouldRedirectRootToEnglish,
} from "@/lib/locale-routing";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const pathname = request.nextUrl.pathname;
  const cookieLocale = request.cookies.get(localeCookieName)?.value;
  const isEnglishPath = pathname === "/en" || pathname.startsWith("/en/");
  const isChinesePublicPath =
    pathname === "/" ||
    ["/software", "/account-services", "/online-tools", "/skill-learning", "/pricing", "/tutorials", "/ai-news", "/ai-trends"].includes(pathname) ||
    pathname.startsWith("/software/") ||
    pathname.startsWith("/account-services/") ||
    pathname.startsWith("/skill-learning/") ||
    pathname.startsWith("/ai-news/") ||
    pathname.startsWith("/ai-trends/") ||
    pathname.startsWith("/tools/") ||
    pathname.startsWith("/legal/");

  if (
    shouldRedirectRootToEnglish({
      pathname,
      cookieLocale,
      headers: request.headers,
    })
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/en";
    const response = NextResponse.redirect(redirectUrl);
    response.headers.set("Content-Language", "en-US");
    response.headers.set("Vary", localeDetectionVaryHeader);
    response.cookies.set(localeCookieName, "en", {
      path: "/",
      maxAge: localeCookieMaxAge,
      sameSite: "lax"
    });
    return response;
  }

  const resolvedLocale = isEnglishPath ? "en" : isChinesePublicPath ? "zh" : cookieLocale === "en" ? "en" : "zh";
  const htmlLocale = isEnglishPath ? "en" : isChinesePublicPath ? "zh" : resolvedLocale;

  requestHeaders.set("x-enhe-locale", resolvedLocale);
  requestHeaders.set("x-enhe-html-locale", htmlLocale);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
  response.headers.set("Content-Language", htmlLocale === "en" ? "en-US" : "zh-CN");
  if (pathname === "/") {
    response.headers.set("Vary", localeDetectionVaryHeader);
  }

  if (isEnglishPath && cookieLocale !== "en") {
    response.cookies.set(localeCookieName, "en", {
      path: "/",
      maxAge: localeCookieMaxAge,
      sameSite: "lax"
    });
  } else if (isChinesePublicPath && cookieLocale === "en") {
    response.cookies.set(localeCookieName, "zh", {
      path: "/",
      maxAge: localeCookieMaxAge,
      sameSite: "lax"
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|uploads).*)"
  ]
};
