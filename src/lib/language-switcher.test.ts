import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildLanguageSwitcherHref, buildLocalePath } from "@/lib/seo";

describe("buildLanguageSwitcherHref", () => {
  it("keeps localized public routes on the matching page", () => {
    expect(buildLanguageSwitcherHref("/", "en")).toBe("/en?locale=en");
    expect(buildLanguageSwitcherHref("/en", "zh")).toBe("/?locale=zh");
    expect(buildLanguageSwitcherHref("/software", "en")).toBe("/en/software?locale=en");
    expect(buildLanguageSwitcherHref("/en/software", "zh")).toBe("/software?locale=zh");
    expect(buildLanguageSwitcherHref("/software/demo-tool", "en")).toBe("/en/software/demo-tool?locale=en");
    expect(buildLanguageSwitcherHref("/skill-learning/demo-course", "en")).toBe("/en/skill-learning/demo-course?locale=en");
    expect(buildLanguageSwitcherHref("/account-services/demo-service", "en")).toBe("/en/account-services/demo-service?locale=en");
    expect(buildLanguageSwitcherHref("/ai-trends", "en")).toBe("/en/ai-trends?locale=en");
    expect(buildLanguageSwitcherHref("/en/ai-trends", "zh")).toBe("/ai-trends?locale=zh");
    expect(buildLanguageSwitcherHref("/ai-trends/daily/2026-06-19", "en")).toBe("/en/ai-trends/daily/2026-06-19?locale=en");
    expect(buildLanguageSwitcherHref("/en/legal/privacy-policy", "zh")).toBe("/legal/privacy-policy?locale=zh");
  });

  it("keeps same-path locale routes in place while still triggering explicit locale switching", () => {
    expect(buildLanguageSwitcherHref("/admin", "en")).toBe("/admin?locale=en");
    expect(buildLanguageSwitcherHref("/admin/orders", "zh")).toBe(
      "/admin/orders?locale=zh",
    );
    expect(buildLanguageSwitcherHref("/orders", "en")).toBe(
      "/orders?locale=en",
    );
    expect(buildLanguageSwitcherHref("/orders/order-1/pay", "zh")).toBe(
      "/orders/order-1/pay?locale=zh",
    );
    expect(buildLanguageSwitcherHref("/login", "en")).toBe("/en/login?locale=en");
    expect(buildLanguageSwitcherHref("/en/login", "zh")).toBe("/login?locale=zh");
    expect(buildLanguageSwitcherHref("/register", "en")).toBe("/en/register?locale=en");
    expect(buildLanguageSwitcherHref("/user", "en")).toBe("/en/user?locale=en");
    expect(buildLanguageSwitcherHref("/en/user", "zh")).toBe("/user?locale=zh");
    expect(buildLanguageSwitcherHref("/relay", "zh")).toBe("/?locale=zh");
  });
});

describe("buildLocalePath", () => {
  it("keeps same-path locale routes stable while still localizing public paths", () => {
    expect(buildLocalePath("/admin", "en")).toBe("/admin");
    expect(buildLocalePath("/admin/users", "en")).toBe("/admin/users");
    expect(buildLocalePath("/orders/order-1", "en")).toBe("/orders/order-1");
    expect(buildLocalePath("/login", "en")).toBe("/en/login");
    expect(buildLocalePath("/register", "en")).toBe("/en/register");
    expect(buildLocalePath("/user", "en")).toBe("/en/user");
    expect(buildLocalePath("/ai-trends", "en")).toBe("/en/ai-trends");
  });
});

describe("language switcher source", () => {
  it("uses link-friendly styles and locale-aware fallback href generation", () => {
    const component = readFileSync(new URL("../components/language-switcher.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

    expect(component).toContain("buildLanguageSwitcherHref");
    expect(component).not.toContain("buildLocalePath(normalizedPath, item)");

    expect(css).toContain(".site-language-switcher a");
    expect(css).toContain(".site-language-switcher a.is-active");
    expect(css).not.toContain(".site-language-switcher button");
    expect(css).not.toContain(".site-language-switcher button.is-active");
  });
});
