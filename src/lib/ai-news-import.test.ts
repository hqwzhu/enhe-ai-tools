import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  newsArticle: {
    findFirst: vi.fn(),
    create: vi.fn()
  },
  newsCategory: {
    upsert: vi.fn()
  },
  newsTag: {
    upsert: vi.fn()
  },
  newsArticleTag: {
    deleteMany: vi.fn(),
    createMany: vi.fn()
  },
  newsExternalSource: {
    deleteMany: vi.fn(),
    createMany: vi.fn()
  },
  adminAuditLog: {
    create: vi.fn()
  }
}));

const auditMock = vi.hoisted(() => ({
  writeAdminAuditLog: vi.fn()
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));
vi.mock("@/lib/admin-audit", () => auditMock);

import {
  aiNewsImportPayloadSchema,
  buildAiNewsImportData,
  importAiNewsArticle,
  rejectUnsafeNewsImportContent,
  verifyAiNewsImportToken
} from "@/lib/ai-news-import";

const baseImportPayload = {
  publishMode: "draft" as const,
  importBatchId: "batch-42",
  article: {
    title: "中国智能体落地提速",
    summary: "中国AI智能体应用案例增多。",
    content: "## 事实概述\n\n正文",
    tags: ["智能体", "AI落地"],
    externalSources: [
      {
        title: "中国网信网",
        url: "https://www.cac.gov.cn/2026-05/08/c_1779979789523320.htm",
        sourceType: "official_announcement"
      },
      {
        title: "行业研究",
        url: "https://example.com/report",
        sourceType: "authority_media",
        description: "补充案例"
      }
    ]
  }
};

beforeEach(() => {
  vi.clearAllMocks();

  prismaMock.newsArticle.findFirst.mockResolvedValue(null);
  prismaMock.newsCategory.upsert.mockResolvedValue({
    id: "category-1",
    name: "AI快讯",
    slug: "ai-news-flash"
  });
  prismaMock.newsArticle.create.mockImplementation(async ({ data }) => ({
    id: "article-1",
    ...data
  }));
  prismaMock.newsTag.upsert.mockImplementation(async ({ create }) => ({
    id: `tag-${create.slug}`,
    ...create
  }));
  prismaMock.newsArticleTag.deleteMany.mockResolvedValue({ count: 0 });
  prismaMock.newsArticleTag.createMany.mockResolvedValue({ count: 0 });
  prismaMock.newsExternalSource.deleteMany.mockResolvedValue({ count: 0 });
  prismaMock.newsExternalSource.createMany.mockResolvedValue({ count: 0 });
  auditMock.writeAdminAuditLog.mockResolvedValue(undefined);
});

describe("AI news import helpers", () => {
  it("verifies bearer tokens without accepting missing or wrong values", () => {
    expect(verifyAiNewsImportToken("Bearer secret-token", "secret-token")).toBe(true);
    expect(verifyAiNewsImportToken("Bearer wrong", "secret-token")).toBe(false);
    expect(verifyAiNewsImportToken(null, "secret-token")).toBe(false);
    expect(verifyAiNewsImportToken("secret-token", "secret-token")).toBe(false);
    expect(verifyAiNewsImportToken("Bearer secret-token", "")).toBe(false);
  });

  it("rejects unsafe raw HTML and script-like content", () => {
    expect(() => rejectUnsafeNewsImportContent("## 正文\n\n普通段落")).not.toThrow();
    expect(() => rejectUnsafeNewsImportContent("<!doctype html><html><body>x</body></html>")).toThrow("raw HTML");
    expect(() => rejectUnsafeNewsImportContent("<script>alert(1)</script>")).toThrow("script");
    expect(() => rejectUnsafeNewsImportContent("<style>body{}</style>")).toThrow("style");
    expect(() => rejectUnsafeNewsImportContent("<p onclick=\"alert(1)\">x</p>")).toThrow("event handler");
  });

  it("validates the required import payload shape", () => {
    const parsed = aiNewsImportPayloadSchema.parse({
      publishMode: "draft",
      importBatchId: "batch-1",
      article: {
        title: "中国智能体落地提速",
        summary: "中国AI智能体应用案例增多。",
        content: "## 事实概述\n\n正文",
        externalSources: [
          {
            title: "中国网信网",
            url: "https://www.cac.gov.cn/2026-05/08/c_1779979789523320.htm",
            sourceType: "official_announcement"
          }
        ]
      }
    });

    expect(parsed.publishMode).toBe("draft");
    expect(parsed.article.externalSources).toHaveLength(1);
  });

  it("rejects payloads without valid external sources", () => {
    expect(() =>
      aiNewsImportPayloadSchema.parse({
        article: {
          title: "标题",
          summary: "摘要",
          content: "## 正文\n\n内容",
          externalSources: []
        }
      })
    ).toThrow();
  });

  it("builds draft import data with safe defaults", () => {
    const data = buildAiNewsImportData(aiNewsImportPayloadSchema.parse(baseImportPayload), new Date("2026-06-18T08:00:00.000Z"));

    expect(data.category).toEqual({ name: "AI快讯", slug: "ai-news-flash" });
    expect(data.article).toMatchObject({
      status: "draft",
      publishedAt: null,
      sourceChannel: "ai_auto_import",
      importBatchId: "batch-42"
    });
  });

  it("imports draft news into article, tags, sources, and audit log", async () => {
    const result = await importAiNewsArticle(baseImportPayload);

    expect(result).toEqual({
      articleId: "article-1",
      slug: "news-batch-42",
      status: "draft",
      adminUrl: "/admin/ai-news/article-1",
      publicUrl: null
    });
    expect(prismaMock.newsCategory.upsert).toHaveBeenCalledWith({
      where: { slug: "ai-news-flash" },
      update: { name: "AI快讯", status: "active" },
      create: { name: "AI快讯", slug: "ai-news-flash", status: "active" }
    });

    const articleData = prismaMock.newsArticle.create.mock.calls[0][0].data;
    expect(articleData).toMatchObject({
      title: "中国智能体落地提速",
      slug: "news-batch-42",
      status: "draft",
      publishedAt: null,
      sourceChannel: "ai_auto_import",
      importBatchId: "batch-42",
      categoryId: "category-1"
    });
    expect(articleData.rawImportPayload).toMatchObject({
      publishMode: "draft",
      importBatchId: "batch-42",
      sourceChannel: "ai_auto_import"
    });

    expect(prismaMock.newsTag.upsert).toHaveBeenCalledTimes(2);
    expect(prismaMock.newsArticleTag.deleteMany).toHaveBeenCalledWith({ where: { articleId: "article-1" } });
    expect(prismaMock.newsArticleTag.createMany.mock.calls[0][0].data).toHaveLength(2);
    expect(prismaMock.newsExternalSource.deleteMany).toHaveBeenCalledWith({ where: { articleId: "article-1" } });
    expect(prismaMock.newsExternalSource.createMany).toHaveBeenCalledWith({
      data: [
        {
          articleId: "article-1",
          title: "中国网信网",
          url: "https://www.cac.gov.cn/2026-05/08/c_1779979789523320.htm",
          sourceType: "official_announcement",
          description: null,
          sortOrder: 0
        },
        {
          articleId: "article-1",
          title: "行业研究",
          url: "https://example.com/report",
          sourceType: "authority_media",
          description: "补充案例",
          sortOrder: 1
        }
      ]
    });
    expect(auditMock.writeAdminAuditLog).toHaveBeenCalledWith({
      adminId: null,
      action: "news_article.auto_import",
      targetType: "news_article",
      targetId: "article-1",
      summary: "Auto-imported AI news article.",
      metadata: {
        title: "中国智能体落地提速",
        slug: "news-batch-42",
        status: "draft",
        importBatchId: "batch-42",
        sourceChannel: "ai_auto_import"
      }
    });
  });

  it("imports published news with non-null publishedAt and a public URL", async () => {
    prismaMock.newsArticle.create.mockImplementationOnce(async ({ data }) => ({
      id: "article-published",
      ...data
    }));

    const result = await importAiNewsArticle({
      ...baseImportPayload,
      publishMode: "published",
      publishedAt: "2026-06-18T08:00:00.000Z",
      importBatchId: "batch-published",
      article: {
        ...baseImportPayload.article,
        title: "OpenAI Agent Update",
        summary: "OpenAI released an agent workflow update."
      }
    });

    const articleData = prismaMock.newsArticle.create.mock.calls[0][0].data;
    expect(articleData).toMatchObject({
      slug: "openai-agent-update",
      status: "published",
      sourceChannel: "ai_auto_import",
      importBatchId: "batch-published"
    });
    expect(articleData.publishedAt).toEqual(new Date("2026-06-18T08:00:00.000Z"));
    expect(result).toEqual({
      articleId: "article-published",
      slug: "openai-agent-update",
      status: "published",
      adminUrl: "/admin/ai-news/article-published",
      publicUrl: "/ai-news/openai-agent-update"
    });
  });
});
