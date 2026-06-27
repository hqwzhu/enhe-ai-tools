import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { dictionaries } from "@/lib/dictionaries";
import { buildHomeMetadataTitle } from "@/lib/seo";

const root = resolve(__dirname, "../..");

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("site audit regression coverage", () => {
  it("keeps homepage and listing metadata broad enough for current SEO targets", () => {
    expect(buildHomeMetadataTitle("zh", dictionaries.zh.brand)).toContain("AI前沿资讯");
    expect(buildHomeMetadataTitle("en", dictionaries.en.brand)).toContain("AI News");

    expect(dictionaries.zh.listing.softwareIntro.length).toBeGreaterThanOrEqual(50);
    expect(dictionaries.zh.listing.onlineIntro.length).toBeGreaterThanOrEqual(50);
    expect(dictionaries.zh.listing.skillLearningIntro.length).toBeGreaterThanOrEqual(50);
    expect(dictionaries.zh.pricing.intro.length).toBeGreaterThanOrEqual(50);
  });

  it("keeps the homepage featured fallback as useful internal links", () => {
    const homeShell = read("src/app/page-shell.tsx");

    expect(homeShell).toContain('{" "}');
    expect(dictionaries.zh.home.featuredContentEmpty).not.toContain("后台设置");
    expect(dictionaries.en.home.featuredContentEmpty).not.toContain("admin panel");
    expect(homeShell).toContain("home-fallback-link-grid");
    expect(homeShell).toContain('"/ai-news"');
    expect(homeShell).toContain('"/account-services"');
  });

  it("keeps the homepage growth hub linked to major SEO and conversion paths", () => {
    const homeShell = read("src/app/page-shell.tsx");

    for (const path of [
      '"/ai-news"',
      '"/ai-trends"',
      '"/software"',
      '"/skill-learning"',
      '"/account-services"',
      '"/pricing"',
      '"/tutorials"',
      '"/build-your-own-x"',
    ]) {
      expect(homeShell).toContain(path);
    }

    expect(homeShell).toContain("creatorOutcomeCards");
    expect(homeShell).toContain("creatorWorkflowSteps");
    expect(homeShell).toContain("buildYourOwnXSpotlight");
  });

  it("gives robots and sitemap public cache headers", () => {
    const nextConfig = read("next.config.ts");

    expect(nextConfig).toContain('source: "/robots.txt"');
    expect(nextConfig).toContain('source: "/sitemap.xml"');
    expect(nextConfig).toContain("stale-while-revalidate=86400");
  });

  it("treats zh AI news routes as Chinese public pages in middleware", () => {
    const middleware = read("src/middleware.ts");

    expect(middleware).toContain('"/ai-news"');
    expect(middleware).toContain('pathname.startsWith("/ai-news/")');
  });

  it("renders AI news publish dates with machine-readable time tags", () => {
    const newsDetail = read("src/app/ai-news/[slug]/page-shell.tsx");

    expect(newsDetail).toContain("<time");
    expect(newsDetail).toContain("dateTime=");
  });

  it("keeps tool detail CTAs, course copy, and purchase form fields readable", () => {
    const toolDetail = read("src/app/tools/[slug]/page-shell.tsx");

    expect(toolDetail).not.toContain("鐐");
    expect(toolDetail).not.toContain("楼");
    expect(toolDetail).toContain("freeDownloadButtonLabel");
    expect(toolDetail).toContain("priceSpecHelpId");
    expect(toolDetail).toContain("paymentMethodLabelId");
    expect(toolDetail).toContain('aria-describedby={priceSpecHelpId}');
    expect(toolDetail).toContain('aria-describedby={paymentMethodHelpId}');
    expect(toolDetail).toContain('required');
    expect(toolDetail).toContain('title=');
  });

  it("clips homepage motion and glow effects horizontally", () => {
    const globals = read("src/app/globals.css");

    expect(globals).toContain("overflow-x: clip");
    expect(globals).toContain("@supports not (overflow: clip)");
    expect(globals).toContain("overflow-x: hidden");
  });

  it("uses absolute URLs in account service collection schema", () => {
    const accountServices = read("src/app/account-services/page-shell.tsx");

    expect(accountServices).toContain("absoluteUrl");
    expect(accountServices).toContain('const url = absoluteUrl(buildLocalePath("/account-services", forceLocale));');
  });

  it("adds an offer catalog schema to the pricing page", () => {
    const pricingPage = read("src/app/pricing/page-shell.tsx");

    expect(pricingPage).toContain('"@type": "OfferCatalog"');
    expect(pricingPage).toContain("pricingOfferCatalogSchema");
    expect(pricingPage).toContain("StructuredData data={[breadcrumbSchema, pricingOfferCatalogSchema]}");
  });
});
