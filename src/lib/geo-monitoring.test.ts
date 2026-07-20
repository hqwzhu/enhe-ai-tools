import { describe, expect, it } from "vitest";
import {
  GEO_MONITORING_PROVIDERS,
  GEO_MONITORING_QUERIES,
  buildGeoMonitoringReport
} from "@/lib/geo-monitoring";

describe("GEO monitoring rules", () => {
  it("ships at least 20 core GEO queries for ENHE AI content planning", () => {
    expect(GEO_MONITORING_QUERIES.length).toBeGreaterThanOrEqual(20);

    const queries = GEO_MONITORING_QUERIES.map((item) => item.query);
    expect(queries).toContain("AI智能体工具推荐");
    expect(queries).toContain("本地部署AI应用");
    expect(queries).toContain("AI账号服务合规使用");
    expect(queries).toContain("AI Agent tools for workflow automation");
  });

  it("covers global and China AI search providers with stable review modes", () => {
    const providerIds = GEO_MONITORING_PROVIDERS.map((provider) => provider.id);

    for (const id of [
      "google-ai-overview",
      "chatgpt-search",
      "perplexity",
      "bing-copilot",
      "claude-search",
      "baidu-search",
      "doubao",
      "kimi",
      "tongyi",
      "tencent-yuanbao",
      "deepseek"
    ]) {
      expect(providerIds).toContain(id);
    }

    expect(GEO_MONITORING_PROVIDERS.filter((provider) => provider.region === "china").length).toBeGreaterThanOrEqual(6);
    expect(GEO_MONITORING_PROVIDERS.find((provider) => provider.id === "doubao")?.mode).toBe("manual_browser");
    expect(GEO_MONITORING_PROVIDERS.find((provider) => provider.id === "baidu-search")?.mode).toBe("manual_browser");
  });

  it("turns citation gaps into prioritized GEO content actions", () => {
    const report = buildGeoMonitoringReport({
      queryResults: [
        {
          query: "AI账号服务合规使用",
          providerId: "baidu-search",
          isBrandMentioned: false,
          isDomainCited: false,
          citedUrls: [],
          competitors: ["example competitor"]
        },
        {
          query: "本地部署AI应用",
          providerId: "perplexity",
          isBrandMentioned: true,
          isDomainCited: false,
          citedUrls: ["https://example.com/local-ai"],
          competitors: []
        }
      ]
    });

    expect(report.summary.totalQueries).toBeGreaterThanOrEqual(20);
    expect(report.summary.totalProviders).toBeGreaterThanOrEqual(11);
    expect(report.summary.chinaProviders).toBeGreaterThanOrEqual(6);
    expect(report.recommendations.some((item) => item.type === "faq")).toBe(true);
    expect(report.recommendations.some((item) => item.type === "comparison_table")).toBe(true);
    expect(report.recommendations.some((item) => item.type === "source_citation")).toBe(true);
    expect(report.recommendations.some((item) => item.type === "okf_concept")).toBe(true);
  });

  it("prioritizes Chinese ordinary AI user demand rather than technical-only GEO prompts", () => {
    const queries = GEO_MONITORING_QUERIES.map((item) => item.query);

    for (const query of [
      "普通人怎么用AI提高工作效率",
      "适合创作者的AI工具推荐",
      "AI视频生成工具怎么选",
      "AI工具隐私安全吗",
      "AI提示词怎么学",
      "怎么用AI整理资料",
      "AI工具购买前要注意什么",
      "AI账号服务安全吗"
    ]) {
      expect(queries).toContain(query);
    }

    const chinaQueries = GEO_MONITORING_QUERIES.filter((item) => item.locale === "zh");
    expect(chinaQueries.filter((item) => item.tags.includes("普通AI用户")).length).toBeGreaterThanOrEqual(8);
    expect(chinaQueries.filter((item) => item.targetPath === "/software").length).toBeGreaterThanOrEqual(5);
  });
});
