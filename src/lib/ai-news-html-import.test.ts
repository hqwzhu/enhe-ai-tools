import { describe, expect, it } from "vitest";
import { buildAiNewsImportPayloadFromHtml } from "@/lib/ai-news-html-import";

describe("AI news HTML import parser", () => {
  it("extracts article fields from no-CSS HTML", () => {
    const payload = buildAiNewsImportPayloadFromHtml({
      html: `
        <article>
          <h1>OpenAI 发布新的智能体能力</h1>
          <time datetime="2026-06-18">2026年6月18日</time>
          <meta name="description" content="这是一条面向 ENHE 用户的 AI 智能体新闻摘要。">
          <meta name="keywords" content="AI智能体, 本地部署AI, AI教程">
          <img src="https://images.unsplash.com/photo-1" alt="AI workspace">
          <h2 id="facts">事实概述</h2>
          <p>OpenAI 发布了新的智能体能力，开发者可以将其用于自动化工作流。</p>
          <ul><li>支持多步骤任务</li><li>强调安全边界</li></ul>
          <blockquote>这类能力会影响团队对 AI 工具的选择。</blockquote>
          <h2 id="sources">来源</h2>
          <ul><li><a href="https://example.com/news">官方公告</a></li></ul>
        </article>
      `,
      publishMode: "published",
      importBatchId: "html-test",
      tags: ["自动发布"],
      categoryName: "AI快讯"
    });

    expect(payload.publishMode).toBe("published");
    expect(payload.publishedAt?.toISOString()).toBe("2026-06-18T00:00:00.000Z");
    expect(payload.importBatchId).toBe("html-test");
    expect(payload.article.title).toBe("OpenAI 发布新的智能体能力");
    expect(payload.article.summary).toBe("这是一条面向 ENHE 用户的 AI 智能体新闻摘要。");
    expect(payload.article.coverImage).toBe("https://images.unsplash.com/photo-1");
    expect(payload.article.categoryName).toBe("AI快讯");
    expect(payload.article.tags).toEqual(["AI智能体", "本地部署AI", "AI教程", "自动发布"]);
    expect(payload.article.externalSources).toEqual([
      { title: "官方公告", url: "https://example.com/news", sourceType: "source" }
    ]);
    expect(payload.article.content).toContain("## 事实概述");
    expect(payload.article.content).toContain("OpenAI 发布了新的智能体能力");
    expect(payload.article.content).toContain("- 支持多步骤任务");
    expect(payload.article.content).toContain("> 这类能力会影响团队对 AI 工具的选择。");
  });

  it("uses the first paragraph as summary when meta description is absent", () => {
    const payload = buildAiNewsImportPayloadFromHtml({
      html: `
        <article>
          <h1>本地部署 AI 工具更新</h1>
          <p>这是一段足够清晰的摘要，说明本地部署 AI 工具的最新变化。</p>
          <h2>来源</h2>
          <a href="https://example.com/local-ai">来源报道</a>
        </article>
      `,
      publishMode: "draft"
    });

    expect(payload.article.summary).toBe("这是一段足够清晰的摘要，说明本地部署 AI 工具的最新变化。");
    expect(payload.article.externalSources).toEqual([
      { title: "来源报道", url: "https://example.com/local-ai", sourceType: "source" }
    ]);
  });

  it("rejects published HTML without source links", () => {
    expect(() =>
      buildAiNewsImportPayloadFromHtml({
        html: "<article><h1>无来源发布</h1><p>这篇文章没有任何可核验来源链接。</p></article>",
        publishMode: "published"
      })
    ).toThrow("Published HTML imports require at least one source link.");
  });

  it("rejects unsafe HTML", () => {
    expect(() =>
      buildAiNewsImportPayloadFromHtml({
        html: "<article><h1>Bad</h1><script>alert(1)</script></article>",
        publishMode: "draft"
      })
    ).toThrow("HTML cannot contain script tags.");

    expect(() =>
      buildAiNewsImportPayloadFromHtml({
        html: '<article><h1 style="color:red">Bad</h1><p>Inline CSS</p></article>',
        publishMode: "draft"
      })
    ).toThrow("HTML cannot contain style attributes.");

    expect(() =>
      buildAiNewsImportPayloadFromHtml({
        html: '<article><h1 onclick="alert(1)">Bad</h1><p>Inline handler</p></article>',
        publishMode: "draft"
      })
    ).toThrow("HTML cannot contain inline event handlers.");
  });
});
