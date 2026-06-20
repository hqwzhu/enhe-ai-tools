import { describe, expect, it } from "vitest";
import {
  aiTrendDateSlugToDate,
  buildAiTrendLoginUrl,
  isValidAiTrendDateSlug,
  localizeAiTrendBriefingView,
  normalizeAiTrendSourceSignals,
  sanitizeAiTrendBriefingHtml,
  toAiTrendBriefingView,
  validateAiTrendBriefingInput,
  type AiTrendBriefingRecord
} from "@/lib/ai-trends";

const validSourceSignals = [
  {
    title: "Google Trends",
    url: "https://trends.google.com/trends/",
    sourceType: "search trend",
    observedSignal: "AI video and AI productivity queries remain prominent."
  }
];

const validInput = {
  date: "2026-06-19",
  title: "AI 需求趋势分析",
  summary: "本期摘要显示，用户最想用 AI 处理重复工作、内容生产和复杂研究。",
  coreConclusion: "AI 的高频需求正在从尝鲜转向可衡量的任务完成。",
  publicHighlights: ["工作效率仍是最强需求", "视频生成和内容创作保持高热度"],
  fullHtml: "<article><h1>AI 需求趋势分析</h1><p>完整报告正文。</p></article>",
  sourceSignals: validSourceSignals,
  status: "published" as const
};

const validBriefing: AiTrendBriefingRecord = {
  id: "briefing-1",
  date: new Date("2026-06-19T00:00:00.000Z"),
  slug: "2026-06-19",
  title: "AI 需求趋势分析",
  summary: "公开摘要",
  coreConclusion: "核心结论",
  publicHighlights: ["亮点一", "亮点二"],
  fullHtml: "<article><p>完整 HTML</p></article>",
  sourceSignals: validSourceSignals,
  status: "published",
  publishedAt: new Date("2026-06-19T00:00:00.000Z"),
  isIncludedInTopicPage: true,
  createdAt: new Date("2026-06-19T00:00:00.000Z"),
  updatedAt: new Date("2026-06-19T00:00:00.000Z")
};

describe("AI trend briefing helpers", () => {
  it("accepts only real YYYY-MM-DD date slugs", () => {
    expect(isValidAiTrendDateSlug("2026-06-19")).toBe(true);
    expect(isValidAiTrendDateSlug("2026-6-19")).toBe(false);
    expect(isValidAiTrendDateSlug("2026-02-30")).toBe(false);
    expect(aiTrendDateSlugToDate("2026-06-19").toISOString()).toBe("2026-06-19T00:00:00.000Z");
  });

  it("rejects unsafe generated HTML before it can be rendered", () => {
    expect(() => sanitizeAiTrendBriefingHtml("<script>alert(1)</script>")).toThrow(/script/i);
    expect(() => sanitizeAiTrendBriefingHtml('<a onclick="alert(1)">x</a>')).toThrow(/event handler/i);
    expect(() => sanitizeAiTrendBriefingHtml('<a href="javascript:alert(1)">x</a>')).toThrow(/javascript/i);
    expect(sanitizeAiTrendBriefingHtml("\uFEFF<article><p>安全内容</p></article>")).toBe(
      "<article><p>安全内容</p></article>"
    );
  });

  it("requires credible source signals before publishing a briefing", () => {
    expect(() =>
      validateAiTrendBriefingInput({
        ...validInput,
        sourceSignals: []
      })
    ).toThrow(/source/i);

    expect(validateAiTrendBriefingInput(validInput)).toMatchObject({
      slug: "2026-06-19",
      title: validInput.title,
      status: "published"
    });
  });

  it("normalizes source signals and drops invalid rows", () => {
    expect(
      normalizeAiTrendSourceSignals([
        ...validSourceSignals,
        { title: "No URL", sourceType: "social", observedSignal: "missing URL" },
        { title: "Bad URL", url: "ftp://example.com", sourceType: "web", observedSignal: "bad protocol" }
      ])
    ).toEqual(validSourceSignals);
  });

  it("keeps full HTML out of public views and includes it for logged-in users", () => {
    expect(toAiTrendBriefingView(validBriefing, false)).not.toHaveProperty("fullHtml");
    expect(toAiTrendBriefingView(validBriefing, true)).toHaveProperty("fullHtml", validBriefing.fullHtml);
  });

  it("builds login URLs that return to the requested daily report", () => {
    expect(buildAiTrendLoginUrl("2026-06-19")).toBe("/login?next=%2Fai-trends%2Fdaily%2F2026-06-19");
    expect(buildAiTrendLoginUrl("2026-06-19", "en")).toBe("/en/login?next=%2Fen%2Fai-trends%2Fdaily%2F2026-06-19");
  });

  it("builds English-safe trend briefings when stored content is only available in Chinese", () => {
    const localized = localizeAiTrendBriefingView(toAiTrendBriefingView(validBriefing, true), "en");

    expect(localized.title).toBe("AI Demand Briefing - 2026-06-19");
    expect(localized.summary).not.toMatch(/[\u3400-\u9fff]/);
    expect(localized.coreConclusion).not.toMatch(/[\u3400-\u9fff]/);
    expect(localized.publicHighlights.join(" ")).not.toMatch(/[\u3400-\u9fff]/);
    expect(localized.sourceSignals[0]?.observedSignal).not.toMatch(/[\u3400-\u9fff]/);
    expect(localized.fullHtml).toContain("AI Demand Briefing");
    expect(localized.fullHtml).not.toMatch(/[\u3400-\u9fff]/);
  });
});
