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
    expect(buildHomeMetadataTitle("zh", dictionaries.zh.brand)).toContain("让 AI 真正为每个人所用");
    expect(buildHomeMetadataTitle("en", dictionaries.en.brand)).toContain("Real Tasks");
    expect(buildHomeMetadataTitle("en", dictionaries.en.brand)).toContain("Safer AI");

    expect(dictionaries.zh.listing.softwareIntro.length).toBeGreaterThanOrEqual(50);
    expect(dictionaries.zh.listing.onlineIntro.length).toBeGreaterThanOrEqual(50);
    expect(dictionaries.zh.listing.skillLearningIntro.length).toBeGreaterThanOrEqual(50);
    expect(dictionaries.zh.pricing.intro.length).toBeGreaterThanOrEqual(50);
  });

  it("keeps the homepage featured fallback as useful internal links", () => {
    const homeShell = read("src/app/page-shell.tsx");

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

    expect(homeShell).toContain("homeProductPaths");
    expect(homeShell).toContain("homeSupportLinks");
    expect(homeShell).toContain("home-seo-disclosure");
  });

  it("keeps P2 topic-growth links discoverable inside the folded homepage support area", () => {
    const homeShell = read("src/app/page-shell.tsx");
    const globals = read("src/app/globals.css");

    for (const path of [
      '"/ai-topics/ai-content-creation-tools"',
      '"/ai-topics/local-ai-deployment"',
      '"/ai-topics/ai-account-service-compliance"',
      '"/ai-topics/ai-skill-learning-path"',
    ]) {
      expect(homeShell).toContain(path);
    }

    expect(homeShell).toContain("homeTopicGrowthLinks");
    expect(homeShell).toContain("home-topic-growth-grid");
    expect(homeShell.indexOf("home-topic-growth-grid")).toBeGreaterThan(
      homeShell.indexOf("home-seo-disclosure"),
    );
    expect(globals).toContain(".home-topic-growth-grid");
    expect(globals).toContain(".home-topic-growth-link");
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
    expect(dictionaries.zh.toolDetail.buyDownload).toBe("购买并获取下载 ¥{price}");
    expect(dictionaries.zh.toolDetail.buyService).toBe("咨询并购买服务");
    expect(dictionaries.zh.toolDetail.buyCourse).toBe("购买课程 ¥{price}");
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
    const pricingOffers = read("src/lib/pricing-offers.ts");
    const pricingMarkdown = read("public/pricing.md");

    expect(pricingPage).toContain('"@type": "OfferCatalog"');
    expect(pricingPage).toContain("pricingOfferCatalogSchema");
    expect(pricingPage).toContain("pricingOfferItems");
    expect(pricingOffers).toContain('path: "/software/windows-ai"');
    expect(pricingOffers).toContain("price: 50");
    expect(pricingOffers).toContain('path: "/account-services/gmail-google"');
    expect(pricingOffers).toContain("price: 30.8");
    expect(pricingPage).toContain("StructuredData data={[breadcrumbSchema, pricingOfferCatalogSchema]}");
    expect(pricingMarkdown).toContain("https://www.enhe-tech.com.cn/software/windows-ai");
    expect(pricingMarkdown).toContain("Price: CNY 50.00");
    expect(pricingMarkdown).toContain("https://www.enhe-tech.com.cn/account-services/gmail-google");
    expect(pricingMarkdown).toContain("Price: CNY 30.80");
  });

  it("keeps the mobile product-demo carousel inside the viewport", () => {
    const globals = read("src/app/globals.css");
    const mobileCarouselBlock = globals.slice(
      globals.indexOf("  .home-product-demo-grid {"),
      globals.indexOf("  .home-product-demo-grid .product-demo-card {"),
    );

    expect(mobileCarouselBlock).toContain("overflow-x: auto");
    expect(mobileCarouselBlock).toContain("max-width: 100%");
    expect(mobileCarouselBlock).toContain("margin-right: 0");
    expect(mobileCarouselBlock).not.toContain("margin-right: -1rem");
  });
});
