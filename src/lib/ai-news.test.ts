import { describe, expect, it } from "vitest";
import {
  extractNewsTableOfContents,
  isEnglishNewsArticleIndexable,
  parseNewsRelationIds,
  parseNewsSearchParams,
  renderNewsContentBlocks,
  resolveNewsSlug,
  toNewsIsoDate
} from "@/lib/ai-news";

describe("AI news helpers", () => {
  it("resolves clean slugs with a stable fallback", () => {
    expect(resolveNewsSlug({ title: "OpenAI Agent Update", slugInput: "", fallbackSeed: "abc" })).toBe("openai-agent-update");
    expect(resolveNewsSlug({ title: "中文标题", slugInput: "", fallbackSeed: "abc" })).toBe("news-abc");
    expect(resolveNewsSlug({ title: "Ignored", slugInput: "AI 视频 2026", fallbackSeed: "abc" })).toBe("ai-2026");
  });

  it("parses search params with safe defaults", () => {
    expect(parseNewsSearchParams({ q: "  agent ", page: "3", sort: "hot", category: "cat", tag: "tag" })).toEqual({
      q: "agent",
      page: 3,
      pageSize: 9,
      skip: 18,
      sort: "hot",
      category: "cat",
      tag: "tag"
    });
    expect(parseNewsSearchParams({ page: "-2", sort: "unknown" })).toMatchObject({
      page: 1,
      skip: 0,
      sort: "latest"
    });
  });

  it("extracts H2 and H3 headings for a table of contents", () => {
    const toc = extractNewsTableOfContents("## 发生了什么？\n正文\n### 对普通用户\n## 总结");

    expect(toc).toEqual([
      { id: "section-1", level: 2, title: "发生了什么？" },
      { id: "section-2", level: 3, title: "对普通用户" },
      { id: "section-3", level: 2, title: "总结" }
    ]);
  });

  it("renders safe content blocks and escapes raw html", () => {
    const blocks = renderNewsContentBlocks("## 标题\n<script>alert(1)</script>\n- 要点\n> 引用");

    expect(blocks).toEqual([
      { type: "heading", level: 2, id: "section-1", text: "标题" },
      { type: "paragraph", text: "&lt;script&gt;alert(1)&lt;/script&gt;" },
      { type: "list", ordered: false, items: ["要点"] },
      { type: "quote", text: "引用" }
    ]);
  });

  it("guards English indexing when translated content is too thin", () => {
    expect(isEnglishNewsArticleIndexable({ englishTitle: "AI news", englishSummary: "Short", englishContent: "Tiny" })).toBe(false);
    expect(
      isEnglishNewsArticleIndexable({
        englishTitle: "OpenAI releases a practical agent update",
        englishSummary: "A concise summary for English readers.",
        englishContent: "This update matters because it changes how teams can connect model capabilities with everyday workflows. ".repeat(3)
      })
    ).toBe(true);
  });

  it("parses relation ids from comma and newline separated fields", () => {
    expect(parseNewsRelationIds("a, b\nc，a")).toEqual(["a", "b", "c"]);
  });

  it("serializes cached Date strings for structured data", () => {
    expect(toNewsIsoDate("2026-06-18T08:00:00.000Z")).toBe("2026-06-18T08:00:00.000Z");
    expect(toNewsIsoDate(new Date("2026-06-18T08:00:00.000Z"))).toBe("2026-06-18T08:00:00.000Z");
  });
});
