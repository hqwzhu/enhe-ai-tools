import { describe, expect, it } from "vitest";
import { buildMetaDescription, buildMetadataTitle, buildToolMetaDescription, buildToolMetadataTitle } from "@/lib/seo";

describe("seo helpers", () => {
  it("normalizes and truncates metadata descriptions", () => {
    expect(buildMetaDescription("  AI \n helper    for teams  ", "fallback", 17)).toBe("AI helper for...");
    expect(buildMetaDescription("   ", "fallback")).toBe("fallback");
  });

  it("builds page titles without duplicating the brand", () => {
    expect(buildMetadataTitle({ pageTitle: "ENHE AI", brand: "ENHE AI" })).toBe("ENHE AI");
    expect(buildMetadataTitle({ pageTitle: "ENHE AI", brand: "Symbiosis ENHE AI" })).toBe("Symbiosis ENHE AI");
    expect(buildMetadataTitle({ pageTitle: "AI Software Apps", brand: "ENHE AI" })).toBe("AI Software Apps | ENHE AI");
    expect(buildMetadataTitle({ pageTitle: "AI Software Apps | ENHE AI", brand: "ENHE AI" })).toBe("AI Software Apps | ENHE AI");
  });

  it("builds locale-aware tool titles without duplicate names", () => {
    expect(buildToolMetadataTitle({ name: "Symbiosis", englishName: "Symbiosis", brand: "ENHE AI" })).toBe(
      "Symbiosis | ENHE AI"
    );
    expect(buildToolMetadataTitle({ name: "即梦AI", englishName: "Dreamina", brand: "ENHE AI", locale: "zh" })).toBe(
      "即梦AI (Dreamina) | ENHE AI"
    );
    expect(buildToolMetadataTitle({ name: "即梦AI", englishName: "Dreamina", brand: "ENHE AI", locale: "en" })).toBe(
      "Dreamina (即梦AI) | ENHE AI"
    );

    const longTitle = buildToolMetadataTitle({
      name: "A very long product name for creators and operators",
      englishName: "Another descriptive English subtitle",
      brand: "ENHE AI",
      locale: "en",
      maxLength: 42
    });

    expect(longTitle.endsWith(" | ENHE AI")).toBe(true);
    expect(longTitle.length).toBeLessThanOrEqual(42);
    expect(longTitle).not.toContain("·");

    const longZhTitle = buildToolMetadataTitle({
      name: "A very long product name for creators and operators",
      englishName: "Another descriptive English subtitle",
      brand: "Symbiosis ENHE AI",
      locale: "zh",
      maxLength: 42
    });

    expect(longZhTitle.endsWith(" | Symbiosis ENHE AI")).toBe(true);
    expect(longZhTitle.length).toBeLessThanOrEqual(42);
    expect(longZhTitle).not.toContain("(");
  });

  it("builds locale-aware tool descriptions for detail pages", () => {
    const englishDescription = buildToolMetaDescription({
      name: "即梦AI",
      englishName: "Dreamina",
      description: "一款用于生成图片和视频的 AI 创作工具。",
      brand: "ENHE AI",
      locale: "en",
      type: "software"
    });

    expect(englishDescription).toBe(
      "Dreamina is available on ENHE AI. Explore features, pricing, tutorials, and access guidance for this AI software app."
    );

    const chineseDescription = buildToolMetaDescription({
      name: "即梦AI",
      englishName: "Dreamina",
      description: "  一款用于生成图片和视频的 AI 创作工具。  ",
      brand: "ENHE AI",
      locale: "zh",
      type: "software"
    });

    expect(chineseDescription.startsWith("一款用于生成图片和视频的 AI 创作工具。")).toBe(true);
    expect(chineseDescription).toContain("ENHE AI");
    expect(chineseDescription.length).toBeLessThanOrEqual(160);
  });
});
