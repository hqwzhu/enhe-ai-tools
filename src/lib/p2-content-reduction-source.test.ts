import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("P2 content reduction source contracts", () => {
  it("folds listing guidance while keeping product discovery visible", () => {
    const software = read("src/app/software/page-shell.tsx");
    const accountServices = read("src/app/account-services/page-shell.tsx");
    const css = read("src/app/globals.css");

    for (const source of [software, accountServices]) {
      expect(source).toContain("<ListingGuidanceFold forceLocale={forceLocale} />");
      expect(source).toContain('className="content-fold listing-guidance-fold"');
      expect(source).toContain("<ListingDecisionStrip forceLocale={forceLocale} />");
      expect(source).toContain("<ListingTrustNote forceLocale={forceLocale} />");
      expect(source).toContain("buildFaqSchema");

      expect(source.indexOf("<ListingGuidanceFold")).toBeLessThan(
        source.indexOf("<FilterBar"),
      );
      expect(source.indexOf("<FilterBar")).toBeLessThan(
        source.indexOf("<ToolCard key={tool.id}"),
      );
    }

    expect(css).toContain(".listing-guidance-fold");
  });

  it("folds pricing support notes while keeping offers and OfferCatalog visible", () => {
    const pricing = read("src/app/pricing/page-shell.tsx");
    const css = read("src/app/globals.css");

    expect(pricing).toContain(
      "<StructuredData data={[breadcrumbSchema, pricingOfferCatalogSchema]} />",
    );
    expect(pricing).toContain("getPricingOfferItems");
    expect(pricing).toContain('className="content-fold pricing-guidance-fold"');
    expect(pricing.indexOf("pricingOfferItemsForLocale.map((item) => (")).toBeLessThan(
      pricing.indexOf('className="content-fold pricing-guidance-fold"'),
    );
    expect(css).toContain(".pricing-guidance-fold");
  });
});
