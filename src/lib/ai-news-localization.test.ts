import { describe, expect, it } from "vitest";
import {
  buildLocalizedNewsKeywordList,
  buildLocalizedNewsSummary,
  buildLocalizedNewsTitle,
  buildLocalizedTutorialPreviewTitle,
  buildLocalizedTutorialPreviewToolName,
  localizeAiNewsDiscoveryLabel,
  resolveLocalizedNewsCategoryName,
  resolveLocalizedNewsTagName,
} from "@/lib/ai-news-localization";

describe("AI news localization helpers", () => {
  it("keeps already-English categories and tags readable on English pages", () => {
    expect(resolveLocalizedNewsCategoryName("AI News", "en")).toBe("AI News");
    expect(resolveLocalizedNewsCategoryName("Trend Insights", "en")).toBe(
      "Trend Insights",
    );
    expect(resolveLocalizedNewsTagName("Automation", "en")).toBe(
      "Automation",
    );
    expect(resolveLocalizedNewsTagName("Agent", "en")).toBe("Agent");
  });

  it("uses English summaries and keywords when source English fields exist", () => {
    const summary = buildLocalizedNewsSummary(
      {
        title: "\u4e2d\u6587\u6807\u9898",
        englishTitle: "OpenAI Agent Update",
        summary: "\u4e2d\u6587\u6458\u8981",
        englishSummary: null,
        description: "\u4e2d\u6587\u63cf\u8ff0",
        englishDescription:
          "OpenAI updates its agent workflow so teams can move from model output to production tasks more quickly.",
      },
      "en",
    );

    const keywords = buildLocalizedNewsKeywordList(
      {
        keywords: "ENHE AI",
        seoKeywords: null,
        englishKeywords: "AI News,AI Trends,AI Tools",
        englishSeoKeywords: "Automation,Productivity",
        categoryName: "AI News",
        tagNames: ["Agent"],
      },
      "en",
    );

    expect(summary).toContain("OpenAI updates its agent workflow");
    expect(summary).not.toContain("\u4e2d\u6587");
    expect(keywords).toEqual(
      expect.arrayContaining([
        "AI News",
        "AI Trends",
        "AI Tools",
        "Automation",
        "Productivity",
        "Agent",
      ]),
    );
  });

  it("falls back to source title and summary instead of generic English copy", () => {
    expect(
      buildLocalizedNewsTitle(
        {
          title: "\u4e2d\u6587\u6807\u9898",
          englishTitle: null,
          categoryName: "AI News",
        },
        "en",
      ),
    ).toBe("\u4e2d\u6587\u6807\u9898");

    expect(
      buildLocalizedNewsSummary(
        {
          title: "\u4e2d\u6587\u6807\u9898",
          englishTitle: null,
          summary: "\u4e2d\u6587\u6458\u8981",
          englishSummary: null,
          description: "\u4e2d\u6587\u63cf\u8ff0",
          englishDescription: null,
          categoryName: "AI News",
        },
        "en",
      ),
    ).toBe("\u4e2d\u6587\u6458\u8981");
  });

  it("builds english tutorial preview labels for related content cards", () => {
    expect(
      buildLocalizedTutorialPreviewTitle(
        "\u4f7f\u7528\u6b65\u9aa4",
        {
          slug: "chatgpt-plus",
          name: "ChatGPT Plus \u8d26\u53f7\u670d\u52a1",
          englishName: "ChatGPT Plus",
          type: "online",
        },
        "en",
      ),
    ).toBe("ChatGPT Plus guide");

    expect(
      buildLocalizedTutorialPreviewToolName(
        {
          slug: "chatgpt-plus",
          name: "ChatGPT Plus \u8d26\u53f7\u670d\u52a1",
          englishName: "ChatGPT Plus",
          type: "online",
        },
        "en",
      ),
    ).toBe("ChatGPT Plus");
  });

  it("localizes AI news discovery labels when English source labels are present", () => {
    expect(localizeAiNewsDiscoveryLabel("AI News", "en", "AI Insights")).toBe(
      "AI News",
    );
    expect(localizeAiNewsDiscoveryLabel("OpenAI", "en", "AI Insights")).toBe(
      "OpenAI",
    );
  });
});
