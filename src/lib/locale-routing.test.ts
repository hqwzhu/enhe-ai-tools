import { describe, expect, it } from "vitest";
import {
  getRequestCountryCode,
  getRequestedLocaleSwitch,
  inferLocaleFromRequest,
  isSearchOrAiCrawler,
  normalizePathForRequestedLocale,
  shouldRedirectRootToEnglish,
} from "@/lib/locale-routing";

function headers(values: Record<string, string>) {
  return new Headers(values);
}

describe("locale routing", () => {
  it("prefers country headers for root-page locale inference", () => {
    expect(inferLocaleFromRequest(headers({ "cf-ipcountry": "CN", "accept-language": "en-US,en;q=0.9" }))).toBe("zh");
    expect(inferLocaleFromRequest(headers({ "x-country-code": "US", "accept-language": "zh-CN,zh;q=0.9" }))).toBe("en");
    expect(getRequestCountryCode(headers({ "cloudfront-viewer-country": "DE" }))).toBe("DE");
  });

  it("falls back to Accept-Language when the server has no country header", () => {
    expect(inferLocaleFromRequest(headers({ "accept-language": "zh-CN,zh;q=0.9,en;q=0.8" }))).toBe("zh");
    expect(inferLocaleFromRequest(headers({ "accept-language": "fr-FR,fr;q=0.9,en;q=0.8" }))).toBe("en");
  });

  it("keeps the public root path on stable Chinese by default", () => {
    expect(
      shouldRedirectRootToEnglish({
        pathname: "/",
        headers: headers({ "cf-ipcountry": "US", "user-agent": "Mozilla/5.0" }),
      }),
    ).toBe(false);

    expect(
      shouldRedirectRootToEnglish({
        pathname: "/",
        cookieLocale: "en",
        headers: headers({ "cf-ipcountry": "US", "user-agent": "Mozilla/5.0" }),
      }),
    ).toBe(false);

    expect(
      shouldRedirectRootToEnglish({
        pathname: "/software",
        headers: headers({ "cf-ipcountry": "US", "user-agent": "Mozilla/5.0" }),
      }),
    ).toBe(false);

    expect(
      shouldRedirectRootToEnglish({
        pathname: "/",
        headers: headers({ "cf-ipcountry": "CN", "user-agent": "Mozilla/5.0" }),
      }),
    ).toBe(false);
  });

  it("does not auto-redirect search and AI crawlers", () => {
    expect(isSearchOrAiCrawler("GPTBot/1.0")).toBe(true);
    expect(isSearchOrAiCrawler("Googlebot/2.1")).toBe(true);
    expect(
      shouldRedirectRootToEnglish({
        pathname: "/",
        headers: headers({ "cf-ipcountry": "US", "user-agent": "GPTBot/1.0" }),
      }),
    ).toBe(false);
  });

  it("honors explicit user language switching before root geo redirects", () => {
    expect(getRequestedLocaleSwitch(new URLSearchParams("locale=zh"))).toBe(
      "zh",
    );
    expect(getRequestedLocaleSwitch(new URLSearchParams("locale=en"))).toBe(
      "en",
    );
    expect(getRequestedLocaleSwitch(new URLSearchParams("locale=fr"))).toBe(
      null,
    );
    expect(normalizePathForRequestedLocale("/en", "zh")).toBe("/");
    expect(normalizePathForRequestedLocale("/en/software/demo", "zh")).toBe(
      "/software/demo",
    );
    expect(normalizePathForRequestedLocale("/", "en")).toBe("/en");
    expect(normalizePathForRequestedLocale("/software/demo", "en")).toBe(
      "/software/demo",
    );
  });

  it("keeps admin locale switches on the same path for any visitor region", () => {
    expect(normalizePathForRequestedLocale("/admin", "zh")).toBe("/admin");
    expect(normalizePathForRequestedLocale("/admin", "en")).toBe("/admin");
    expect(normalizePathForRequestedLocale("/admin/ai-news", "zh")).toBe(
      "/admin/ai-news",
    );
    expect(
      shouldRedirectRootToEnglish({
        pathname: "/admin",
        headers: headers({ "cf-ipcountry": "US", "user-agent": "Mozilla/5.0" }),
      }),
    ).toBe(false);
  });
});
