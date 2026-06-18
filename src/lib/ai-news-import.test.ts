import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
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

const txMock = vi.hoisted(() => ({
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
    title: "!!!",
    summary: "AI agent deployments are increasing.",
    content: "## Facts\n\nBody copy",
    tags: ["Agents", "AI Deployment"],
    externalSources: [
      {
        title: "Official notice",
        url: "https://www.cac.gov.cn/2026-05/08/c_1779979789523320.htm",
        sourceType: "official_announcement"
      },
      {
        title: "Industry report",
        url: "https://example.com/report",
        sourceType: "authority_media",
        description: "Supporting case"
      }
    ]
  }
};

beforeEach(() => {
  vi.clearAllMocks();

  prismaMock.$transaction.mockImplementation(async (callback) => callback(txMock));
  txMock.newsArticle.findFirst.mockResolvedValue(null);
  txMock.newsCategory.upsert.mockResolvedValue({
    id: "category-1",
    name: "AI\u5feb\u8baf",
    slug: "ai-news-flash"
  });
  txMock.newsArticle.create.mockImplementation(async ({ data }) => ({
    id: "article-1",
    ...data
  }));
  txMock.newsTag.upsert.mockImplementation(async ({ create }) => ({
    id: `tag-${create.slug}`,
    ...create
  }));
  txMock.newsArticleTag.deleteMany.mockResolvedValue({ count: 0 });
  txMock.newsArticleTag.createMany.mockResolvedValue({ count: 0 });
  txMock.newsExternalSource.deleteMany.mockResolvedValue({ count: 0 });
  txMock.newsExternalSource.createMany.mockResolvedValue({ count: 0 });
  txMock.adminAuditLog.create.mockResolvedValue({ id: "audit-1" });
  auditMock.writeAdminAuditLog.mockResolvedValue(undefined);
});

describe("AI news import helpers", () => {
  it("verifies bearer tokens without accepting missing or wrong values", () => {
    expect(verifyAiNewsImportToken("Bearer secret-token", "secret-token")).toBe(true);
    expect(verifyAiNewsImportToken("Bearer wrong", "secret-token")).toBe(false);
    expect(verifyAiNewsImportToken(null, "secret-token")).toBe(false);
    expect(verifyAiNewsImportToken("secret-token", "secret-token")).toBe(false);
    expect(verifyAiNewsImportToken("Bearer secret-token", "")).toBe(false);
    expect(verifyAiNewsImportToken("Bearer secret-token", undefined)).toBe(false);
  });

  it("rejects unsafe raw HTML and script-like content", () => {
    expect(() => rejectUnsafeNewsImportContent("## Body\n\nPlain paragraph")).not.toThrow();
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
        title: "China agent deployment accelerates",
        summary: "More AI agent applications are shipping.",
        content: "## Facts\n\nBody copy",
        externalSources: [
          {
            title: "Official source",
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
          title: "Title",
          summary: "Summary",
          content: "## Body\n\nContent",
          externalSources: []
        }
      })
    ).toThrow();
  });

  it("rejects oversized content and raw import payloads", () => {
    expect(() =>
      aiNewsImportPayloadSchema.parse({
        article: {
          ...baseImportPayload.article,
          content: "x".repeat(50_001)
        }
      })
    ).toThrow();

    const parsed = aiNewsImportPayloadSchema.parse({
      article: {
        ...baseImportPayload.article,
        content: "x".repeat(50_000),
        englishContent: "y".repeat(50_000)
      }
    });
    expect(() => buildAiNewsImportData(parsed, new Date("2026-06-18T08:00:00.000Z"))).toThrow("Raw import payload exceeds");
  });

  it("rejects oversized readingTime values", () => {
    expect(() =>
      aiNewsImportPayloadSchema.parse({
        article: {
          ...baseImportPayload.article,
          readingTime: 121
        }
      })
    ).toThrow();
  });

  it("rejects non-string publishedAt values instead of accepting Unix epoch coercion", () => {
    expect(() =>
      aiNewsImportPayloadSchema.parse({
        ...baseImportPayload,
        publishMode: "published",
        publishedAt: null
      })
    ).toThrow();
    expect(() =>
      aiNewsImportPayloadSchema.parse({
        ...baseImportPayload,
        publishMode: "published",
        publishedAt: 0
      })
    ).toThrow();
    expect(() =>
      aiNewsImportPayloadSchema.parse({
        ...baseImportPayload,
        publishMode: "published",
        publishedAt: true
      })
    ).toThrow();
  });

  it("builds draft import data with safe defaults", () => {
    const data = buildAiNewsImportData(aiNewsImportPayloadSchema.parse(baseImportPayload), new Date("2026-06-18T08:00:00.000Z"));

    expect(data.category).toEqual({ name: "AI\u5feb\u8baf", slug: "ai-news-flash" });
    expect(data.article).toMatchObject({
      status: "draft",
      publishedAt: null,
      sourceChannel: "ai_auto_import",
      importBatchId: "batch-42"
    });
  });

  it("normalizes category names and slugs without accidentally using the default slug", () => {
    const data = buildAiNewsImportData(
      aiNewsImportPayloadSchema.parse({
        ...baseImportPayload,
        article: {
          ...baseImportPayload.article,
          categoryName: "AI Policy"
        }
      }),
      new Date("2026-06-18T08:00:00.000Z")
    );

    expect(data.category).toEqual({
      name: "AI Policy",
      slug: "ai-policy"
    });
  });

  it("imports draft news into article, tags, sources, and audit log in a transaction", async () => {
    const result = await importAiNewsArticle(baseImportPayload);

    expect(result).toEqual({
      articleId: "article-1",
      slug: "news-batch-42",
      status: "draft",
      adminUrl: "/admin/ai-news/article-1",
      publicUrl: null
    });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(txMock.newsCategory.upsert).toHaveBeenCalledWith({
      where: { slug: "ai-news-flash" },
      update: { status: "active" },
      create: { name: "AI\u5feb\u8baf", slug: "ai-news-flash", status: "active" }
    });

    const articleData = txMock.newsArticle.create.mock.calls[0][0].data;
    expect(articleData).toMatchObject({
      title: "!!!",
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

    expect(txMock.newsTag.upsert).toHaveBeenCalledTimes(2);
    expect(txMock.newsArticleTag.deleteMany).toHaveBeenCalledWith({ where: { articleId: "article-1" } });
    expect(txMock.newsArticleTag.createMany.mock.calls[0][0].data).toHaveLength(2);
    expect(txMock.newsExternalSource.deleteMany).toHaveBeenCalledWith({ where: { articleId: "article-1" } });
    expect(txMock.newsExternalSource.createMany).toHaveBeenCalledWith({
      data: [
        {
          articleId: "article-1",
          title: "Official notice",
          url: "https://www.cac.gov.cn/2026-05/08/c_1779979789523320.htm",
          sourceType: "official_announcement",
          description: null,
          sortOrder: 0
        },
        {
          articleId: "article-1",
          title: "Industry report",
          url: "https://example.com/report",
          sourceType: "authority_media",
          description: "Supporting case",
          sortOrder: 1
        }
      ]
    });
    expect(txMock.adminAuditLog.create).toHaveBeenCalledWith({
      data: {
        adminId: null,
        action: "news_article.auto_import",
        targetType: "news_article",
        targetId: "article-1",
        summary: "Auto-imported AI news article.",
        metadata: {
          title: "!!!",
          slug: "news-batch-42",
          status: "draft",
          importBatchId: "batch-42",
          sourceChannel: "ai_auto_import",
          sourceCount: 2,
          tagCount: 2
        },
        ip: null,
        userAgent: null
      }
    });
    expect(prismaMock.newsArticle.create).not.toHaveBeenCalled();
    expect(prismaMock.newsCategory.upsert).not.toHaveBeenCalled();
    expect(prismaMock.newsTag.upsert).not.toHaveBeenCalled();
    expect(prismaMock.newsExternalSource.createMany).not.toHaveBeenCalled();
    expect(prismaMock.adminAuditLog.create).not.toHaveBeenCalled();
    expect(auditMock.writeAdminAuditLog).not.toHaveBeenCalled();
  });

  it("ignores caller-provided sourceChannel and audits the fixed import channel", async () => {
    await importAiNewsArticle({
      ...baseImportPayload,
      sourceChannel: "evil"
    });

    const articleData = txMock.newsArticle.create.mock.calls[0][0].data;
    expect(articleData.sourceChannel).toBe("ai_auto_import");
    expect(articleData.rawImportPayload.sourceChannel).toBe("ai_auto_import");
    expect(txMock.adminAuditLog.create.mock.calls[0][0].data.metadata.sourceChannel).toBe("ai_auto_import");
  });

  it("does not rename an existing category when only categorySlug is provided", async () => {
    await importAiNewsArticle({
      ...baseImportPayload,
      article: {
        ...baseImportPayload.article,
        categorySlug: "AI Policy Updates!"
      }
    });

    expect(txMock.newsCategory.upsert).toHaveBeenCalledWith({
      where: { slug: "ai-policy-updates" },
      update: { status: "active" },
      create: { name: "AI\u5feb\u8baf", slug: "ai-policy-updates", status: "active" }
    });
  });

  it("does not rename an existing category when only categoryName normalizes to an existing slug", async () => {
    await importAiNewsArticle({
      ...baseImportPayload,
      article: {
        ...baseImportPayload.article,
        categoryName: "AI Policy"
      }
    });

    expect(txMock.newsCategory.upsert).toHaveBeenCalledWith({
      where: { slug: "ai-policy" },
      update: { status: "active" },
      create: { name: "AI Policy", slug: "ai-policy", status: "active" }
    });
  });

  it("does not rename an existing category when categorySlug and categoryName are both provided", async () => {
    await importAiNewsArticle({
      ...baseImportPayload,
      article: {
        ...baseImportPayload.article,
        categorySlug: "existing-cat",
        categoryName: "Injected Name"
      }
    });

    expect(txMock.newsCategory.upsert).toHaveBeenCalledWith({
      where: { slug: "existing-cat" },
      update: { status: "active" },
      create: { name: "Injected Name", slug: "existing-cat", status: "active" }
    });
  });

  it("uses a deterministic slug suffix when the base slug already exists", async () => {
    txMock.newsArticle.findFirst.mockResolvedValueOnce({ id: "existing-article" }).mockResolvedValueOnce(null);

    const result = await importAiNewsArticle({
      ...baseImportPayload,
      article: {
        ...baseImportPayload.article,
        title: "OpenAI Agent Update"
      }
    });

    expect(result.slug).toBe("openai-agent-update-2");
    expect(txMock.newsArticle.create.mock.calls[0][0].data.slug).toBe("openai-agent-update-2");
    expect(txMock.newsArticle.findFirst).toHaveBeenNthCalledWith(1, { where: { slug: "openai-agent-update" }, select: { id: true } });
    expect(txMock.newsArticle.findFirst).toHaveBeenNthCalledWith(2, { where: { slug: "openai-agent-update-2" }, select: { id: true } });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });

  it("retries with the next deterministic suffix when article creation hits a unique slug collision", async () => {
    txMock.newsArticle.create
      .mockRejectedValueOnce({ code: "P2002" })
      .mockImplementationOnce(async ({ data }) => ({
        id: "article-retry",
        ...data
      }));

    const result = await importAiNewsArticle({
      ...baseImportPayload,
      article: {
        ...baseImportPayload.article,
        title: "OpenAI Agent Update"
      }
    });

    expect(result.slug).toBe("openai-agent-update-2");
    expect(txMock.newsArticle.create.mock.calls[0][0].data.slug).toBe("openai-agent-update");
    expect(txMock.newsArticle.create.mock.calls[1][0].data.slug).toBe("openai-agent-update-2");
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(2);
  });

  it("imports published news with non-null publishedAt and a public URL", async () => {
    txMock.newsArticle.create.mockImplementationOnce(async ({ data }) => ({
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

    const articleData = txMock.newsArticle.create.mock.calls[0][0].data;
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
