import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("technical seo phase one source", () => {
  it("defines locale-aware public routing, alternates, and sitemap language entries", () => {
    const seo = read("src/lib/seo.ts");
    const sitemap = read("src/app/sitemap.ts");
    const sharedLayout = read("src/app/root-layout-shared.tsx");
    const zhLayout = read("src/app/(zh-public)/layout.tsx");

    expect(seo).toContain("buildLocalePath");
    expect(seo).toContain("buildLanguageAlternates");
    expect(seo).toContain("alternates:");
    expect(seo).toContain("languages:");
    expect(seo).toContain('x-default');

    expect(sharedLayout).toContain("sharedRootMetadata");
    expect(sharedLayout).toContain("icons:");
    expect(sharedLayout).not.toContain('export const dynamic = "force-dynamic"');
    expect(zhLayout).toContain('lang="zh-CN"');

    expect(sitemap).toContain("alternates:");
    expect(sitemap).toContain("languages:");
    expect(sitemap).toContain('"/en"');
    expect(sitemap).toContain('"/en/software"');
    expect(sitemap).toContain('"/en/online-tools"');
    expect(sitemap).toContain('"/en/skill-learning"');
  });

  it("adds an indexable english route tree and locale-aware public navigation", () => {
    const enLayout = read("src/app/en/layout.tsx");
    const enHome = read("src/app/en/page.tsx");
    const enSoftware = read("src/app/en/software/page.tsx");
    const enOnline = read("src/app/en/online-tools/page.tsx");
    const enSkillLearning = read("src/app/en/skill-learning/page.tsx");
    const enPricing = read("src/app/en/pricing/page.tsx");
    const enTutorials = read("src/app/en/tutorials/page.tsx");
    const enToolDetail = read("src/app/en/tools/[slug]/page.tsx");
    const enLegal = read("src/app/en/legal/[slug]/page.tsx");
    const header = read("src/components/site-header.tsx");
    const footer = read("src/components/site-footer.tsx");
    const toolCard = read("src/components/tool-card.tsx");

    expect(enLayout).toContain("RootDocument");
    expect(enLayout).toContain('lang="en-US"');
    expect(enHome).toContain('forceLocale="en"');
    expect(enSoftware).toContain('forceLocale="en"');
    expect(enOnline).toContain('forceLocale="en"');
    expect(enSkillLearning).toContain('forceLocale="en"');
    expect(enPricing).toContain('forceLocale="en"');
    expect(enTutorials).toContain('forceLocale="en"');
    expect(enToolDetail).toContain('forceLocale="en"');
    expect(enLegal).toContain('forceLocale="en"');

    expect(header).toContain("buildLocalePath");
    expect(header).toContain('href={buildLocalePath("/", locale)}');
    expect(footer).toContain("buildLocalePath");
    expect(toolCard).toContain("buildLocalePath");
  });

  it("splits public caching from user-specific surfaces and adds favicon metadata coverage", () => {
    const home = read("src/app/(zh-public)/page.tsx");
    const siteHeader = read("src/components/site-header.tsx");
    const siteFooter = read("src/components/site-footer.tsx");
    const publicChrome = read("src/components/public-site-chrome.tsx");
    const publicContent = read("src/lib/public-content.ts");
    const sharedLayout = read("src/app/root-layout-shared.tsx");
    const nextConfig = read("next.config.ts");
    const seo = read("src/lib/seo.ts");

    expect(home).toContain('export const revalidate = 300');
    expect(siteHeader).not.toContain('export const dynamic = "force-dynamic"');
    expect(siteFooter).not.toContain('export const dynamic = "force-dynamic"');
    expect(publicChrome).toContain("StructuredData");
    expect(publicChrome).toContain("buildWebsiteSchema");
    expect(publicChrome).toContain("buildOrganizationSchema");
    expect(publicChrome).toContain('forceLocale === "en" ? "en-US" : "zh-CN"');
    expect(publicContent).toContain("publicContentRevalidate = 300");
    expect(sharedLayout).not.toContain("buildWebsiteSchema");
    expect(sharedLayout).not.toContain("buildOrganizationSchema");
    expect(sharedLayout).toContain("icons:");
    expect(sharedLayout).toContain("shortcut");
    expect(seo).toContain('"/images/brand/enhe-icon-gradient-white-bg-cropped.png"');

    expect(nextConfig).toContain("headers()");
    expect(nextConfig).toContain("Cache-Control");
    expect(nextConfig).toContain("s-maxage=300");
  });
});
