import { describe, expect, it } from "vitest";
import {
  buildBrandSearchResult,
  buildPublicToolSearchWhere,
  normalizePublicSearchQuery,
} from "@/lib/public-search";

describe("public search", () => {
  it("normalizes whitespace and control characters without trusting raw query input", () => {
    expect(normalizePublicSearchQuery("  AI\u0000   tools\n guide  ")).toBe("AI tools guide");
    expect(normalizePublicSearchQuery("x".repeat(120))).toHaveLength(80);
    expect(normalizePublicSearchQuery(" \n\t ")).toBe("");
  });

  it("returns only the localized public brand page for matching brand queries", () => {
    expect(buildBrandSearchResult("恩禾", "zh")).toMatchObject({
      type: "brand",
      href: "/about",
    });
    expect(buildBrandSearchResult("ENHE", "en")).toMatchObject({
      type: "brand",
      href: "/en/about",
    });
    expect(buildBrandSearchResult("unrelated phrase", "zh")).toBeNull();
  });

  it("searches product names, categories, summaries, and body copy", () => {
    const where = JSON.stringify(buildPublicToolSearchWhere("voice"));

    expect(where).toContain('"name"');
    expect(where).toContain('"englishName"');
    expect(where).toContain('"category"');
    expect(where).toContain('"shortDescription"');
    expect(where).toContain('"content"');
  });
});
