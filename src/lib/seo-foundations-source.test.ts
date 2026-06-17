import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../..");

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("SEO foundations source contract", () => {
  it("gives public pages explicit metadata and h1 headings", () => {
    const ui = read("src/components/ui.tsx");
    const software = read("src/app/software/page.tsx");
    const onlineTools = read("src/app/online-tools/page.tsx");
    const skillLearning = read("src/app/skill-learning/page.tsx");
    const pricing = read("src/app/pricing/page.tsx");
    const tutorials = read("src/app/tutorials/page.tsx");
    const legal = read("src/app/legal/[slug]/page.tsx");

    expect(ui).toContain('as?: "h1" | "h2"');
    expect(ui).toContain("const TitleTag");

    for (const page of [software, onlineTools, skillLearning, pricing, tutorials]) {
      expect(page).toContain('as="h1"');
    }

    expect(pricing).toContain("generateMetadata");
    expect(pricing).toContain('path: "/pricing"');
    expect(tutorials).toContain("generateMetadata");
    expect(tutorials).toContain('path: "/tutorials"');
    expect(legal).toContain("generateMetadata");
    expect(legal).toContain("buildPageMetadata");
    expect(legal).toContain("path: `/legal/${slug}`");
  });

  it("adds site-wide and detail-page JSON-LD contracts", () => {
    const layout = read("src/app/layout.tsx");
    const toolDetail = read("src/app/tools/[slug]/page.tsx");
    const software = read("src/app/software/page.tsx");

    expect(layout).toContain("StructuredData");
    expect(layout).toContain("WebSite");
    expect(layout).toContain("Organization");

    expect(software).toContain("BreadcrumbList");
    expect(toolDetail).toContain("BreadcrumbList");
    expect(toolDetail).toContain("SoftwareApplication");
    expect(toolDetail).toContain("Service");
    expect(toolDetail).toContain("Course");
  });

  it("uses stable sitemap timestamps and cached public settings", () => {
    const sitemap = read("src/app/sitemap.ts");
    const settings = read("src/lib/settings.ts");

    expect(sitemap).toContain("export const revalidate");
    expect(sitemap).toContain("staticRouteLastModified");
    expect(sitemap).toContain('"/skill-learning"');
    expect(sitemap).toContain('"/legal/copyright-complaint"');
    expect(sitemap).toContain('"/legal/minor-protection"');
    expect(sitemap).not.toContain("const now = new Date()");

    expect(settings).toContain("unstable_cache");
    expect(settings).toContain("site-settings");
  });
});
