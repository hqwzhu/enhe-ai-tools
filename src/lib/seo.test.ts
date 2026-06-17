import { describe, expect, it } from "vitest";
import { buildMetaDescription, buildToolMetadataTitle } from "@/lib/seo";

describe("seo helpers", () => {
  it("normalizes and truncates metadata descriptions", () => {
    expect(buildMetaDescription("  AI \n helper    for teams  ", "fallback", 17)).toBe("AI helper for...");
    expect(buildMetaDescription("   ", "fallback")).toBe("fallback");
  });

  it("builds compact tool titles without duplicating names", () => {
    expect(buildToolMetadataTitle({ name: "Symbiosis", englishName: "Symbiosis", brand: "ENHE AI" })).toBe(
      "Symbiosis | ENHE AI"
    );

    const longTitle = buildToolMetadataTitle({
      name: "A very long product name for creators and operators",
      englishName: "Another descriptive English subtitle",
      brand: "ENHE AI",
      maxLength: 42
    });

    expect(longTitle.endsWith(" | ENHE AI")).toBe(true);
    expect(longTitle.length).toBeLessThanOrEqual(42);
  });
});
