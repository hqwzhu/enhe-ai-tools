import { readFile } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { materializeAiTrendBriefingArtifacts } from "./write-ai-trend-briefing-artifacts";

describe("write-ai-trend-briefing-artifacts", () => {
  it("writes utf8-safe html, summary, and summary-with-html artifacts", async () => {
    const dir = await mkdtemp(join(tmpdir(), "ai-trend-artifacts-"));
    const result = await materializeAiTrendBriefingArtifacts(
      {
        date: "2026-07-01",
        title: "AI趋势分析：人类最渴望用 AI 解决哪些问题",
        summary:
          "基于最新公开趋势信号，AI 需求最高热度集中在工作效率、视频生成、内容创作、编程与学习教育，真实机会来自能把高频任务闭环化的产品。",
        coreConclusion:
          "下一阶段最强机会不是单点聊天，而是把会议、邮件、资料、表格与跨应用任务串成可交付、可追踪、可复用的工作流。",
        publicHighlights: ["工作效率最高热", "视频生成仍在扩张"],
        fullHtml: "<!doctype html><html lang=\"zh-CN\"><body><h1>AI趋势分析</h1></body></html>",
        sourceSignals: [
          {
            title: "Stanford HAI",
            url: "https://hai.stanford.edu/",
            sourceType: "annual report",
            observedSignal: "组织级 AI 采用持续扩大。"
          }
        ],
        demandBreakdowns: [
          {
            direction: "工作效率",
            heat: 95,
            summary: "高频重复工作最值得被 AI 接管。",
            scenarios: [
              {
                name: "会议纪要与行动项追踪",
                heat: 94,
                urgency: "A",
                typicalUsers: ["项目经理", "销售"],
                painPoint: "会后任务经常散落。",
                representativeScenarios: ["录音转纪要", "会后待办同步"],
                aiValue: "自动提取行动项并回写工作流。",
                productOpportunity: "会议到项目的闭环助手。",
                developmentPriority: "A",
                evidenceSignals: ["annual report"]
              }
            ]
          }
        ],
        status: "published",
        isIncludedInTopicPage: true
      },
      { outputDir: dir }
    );

    const [html, summary, summaryWithHtml] = await Promise.all([
      readFile(result.htmlFile, "utf8"),
      readFile(result.summaryFile, "utf8"),
      readFile(result.summaryWithHtmlFile, "utf8")
    ]);

    expect(html).toContain("AI趋势分析");
    expect(summary).toContain("工作效率");
    expect(summaryWithHtml).toContain("fullHtml");

    const parsedSummary = JSON.parse(summary) as Record<string, unknown>;
    const parsedSummaryWithHtml = JSON.parse(summaryWithHtml) as Record<string, unknown>;

    expect(parsedSummary.fullHtml).toBeUndefined();
    expect(parsedSummary.title).toBe("AI趋势分析：人类最渴望用 AI 解决哪些问题");
    expect(parsedSummaryWithHtml.fullHtml).toContain("<h1>AI趋势分析</h1>");
  });

  it("rejects already-corrupted chinese content before writing files", async () => {
    const dir = await mkdtemp(join(tmpdir(), "ai-trend-artifacts-guard-"));

    await expect(
      materializeAiTrendBriefingArtifacts(
        {
          date: "2026-07-01",
          title: "AI ?????????????",
          summary: "???? OpenAI ??????????",
          coreConclusion: "????????????????????",
          fullHtml: "<!doctype html><html lang=\"zh-CN\"><body><h1>bad</h1></body></html>",
          sourceSignals: [
            {
              title: "OpenAI",
              url: "https://openai.com/",
              sourceType: "usage signal",
              observedSignal: "Usage remained high."
            }
          ],
          demandBreakdowns: [
            {
              direction: "????????",
              heat: 80,
              summary: "????????",
              scenarios: [
                {
                  name: "????????",
                  heat: 80,
                  urgency: "A",
                  typicalUsers: ["builder"],
                  painPoint: "????????",
                  representativeScenarios: ["????????"],
                  aiValue: "????????",
                  productOpportunity: "????????",
                  developmentPriority: "A",
                  evidenceSignals: ["usage signal"]
                }
              ]
            }
          ],
          status: "draft"
        },
        { outputDir: dir }
      )
    ).rejects.toThrow("encoding-corrupted");
  });
});
