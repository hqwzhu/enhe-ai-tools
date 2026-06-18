import { describe, expect, it } from "vitest";
import {
  applyKeywordInterventions,
  buildAiNewsKeywordCloud,
  buildAiNewsTopicCollections,
  defaultAiNewsExternalSeoProvider,
  normalizeAiNewsKeyword,
  passesAiNewsKeywordSeoRules
} from "@/lib/ai-news-discovery";

describe("AI news discovery helpers", () => {
  it("normalizes keywords and removes noisy fragments", () => {
    expect(normalizeAiNewsKeyword("  AI视频  ")).toBe("AI视频");
    expect(normalizeAiNewsKeyword("AI")).toBeNull();
    expect(normalizeAiNewsKeyword("2026")).toBeNull();
    expect(normalizeAiNewsKeyword("***")).toBeNull();
  });

  it("checks SEO admission rules against article coverage and signal strength", () => {
    expect(
      passesAiNewsKeywordSeoRules({
        keyword: "AI视频",
        articleCount: 3,
        searchCount30d: 0,
        totalHeat: 0
      })
    ).toBe(true);
    expect(
      passesAiNewsKeywordSeoRules({
        keyword: "工具",
        articleCount: 10,
        searchCount30d: 12,
        totalHeat: 100
      })
    ).toBe(false);
    expect(
      passesAiNewsKeywordSeoRules({
        keyword: "AI视频",
        articleCount: 1,
        searchCount30d: 1,
        totalHeat: 1
      })
    ).toBe(false);
  });

  it("applies pin, hide, rename, and weight boost intervention rules", () => {
    const items = applyKeywordInterventions(
      [
        { keyword: "AI视频", score: 10, displayName: "AI视频", articleCount: 4, searchCount30d: 7, totalHeat: 22 },
        { keyword: "OpenAI", score: 8, displayName: "OpenAI", articleCount: 3, searchCount30d: 3, totalHeat: 14 }
      ],
      [
        { keyword: "OpenAI", locale: "zh", isPinned: true, isHidden: false, displayName: "OpenAI 最新", weightBoost: 6 },
        { keyword: "AI视频", locale: "zh", isPinned: false, isHidden: true, displayName: null, weightBoost: 0 }
      ]
    );

    expect(items).toEqual([expect.objectContaining({ keyword: "OpenAI", displayName: "OpenAI 最新", isPinned: true })]);
  });

  it("builds a ranked keyword cloud capped to 12 items", async () => {
    const items = await buildAiNewsKeywordCloud({
      locale: "zh",
      candidates: Array.from({ length: 14 }).map((_, index) => ({
        keyword: `AI关键词${index + 1}`,
        articleCount: 3,
        searchCount30d: index + 1,
        totalHeat: 20 - index,
        freshnessDays: 2,
        tagHits: 1,
        keywordFieldHits: 1
      })),
      interventions: [],
      externalProvider: defaultAiNewsExternalSeoProvider
    });

    expect(items).toHaveLength(12);
    expect(items[0]?.keyword).toBe("AI关键词14");
  });

  it("builds exactly five topic collections with keyword fallback", () => {
    const topics = buildAiNewsTopicCollections({
      locale: "zh",
      keywordItems: [
        { keyword: "AI视频", displayName: "AI视频", score: 12, articleCount: 4, searchCount30d: 9, totalHeat: 24, isPinned: false },
        { keyword: "ComfyUI", displayName: "ComfyUI", score: 11, articleCount: 4, searchCount30d: 8, totalHeat: 18, isPinned: false }
      ],
      fallbackTags: [
        { keyword: "本地部署AI", displayName: "本地部署AI", score: 10, articleCount: 4, searchCount30d: 0, totalHeat: 12, isPinned: false },
        { keyword: "AI办公", displayName: "AI办公", score: 9, articleCount: 4, searchCount30d: 0, totalHeat: 10, isPinned: false },
        { keyword: "AI智能体", displayName: "AI智能体", score: 8, articleCount: 4, searchCount30d: 0, totalHeat: 8, isPinned: false }
      ]
    });

    expect(topics).toHaveLength(5);
    expect(topics.map((item) => item.query)).toEqual(["AI视频", "ComfyUI", "本地部署AI", "AI办公", "AI智能体"]);
  });
});
