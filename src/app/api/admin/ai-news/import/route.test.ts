import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ZodError, z } from "zod";
import { DuplicateAiNewsCoverImageError, importAiNewsArticle } from "@/lib/ai-news-import";
import { generateAiNewsEnglishDraft } from "@/lib/ai-news-translation";
import { notifyIndexNow } from "@/lib/indexnow";
import { POST } from "./route";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

vi.mock("@/lib/ai-news-import", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/ai-news-import")>();

  return {
    ...actual,
    importAiNewsArticle: vi.fn()
  };
});

vi.mock("@/lib/indexnow", () => ({
  notifyIndexNow: vi.fn()
}));

vi.mock("@/lib/ai-news-translation", () => ({
  generateAiNewsEnglishDraft: vi.fn()
}));

const importAiNewsArticleMock = vi.mocked(importAiNewsArticle);
const generateAiNewsEnglishDraftMock = vi.mocked(generateAiNewsEnglishDraft);
const notifyIndexNowMock = vi.mocked(notifyIndexNow);
const revalidatePathMock = vi.mocked(revalidatePath);

const originalImportToken = process.env.AI_NEWS_IMPORT_TOKEN;

afterEach(() => {
  vi.clearAllMocks();
  if (originalImportToken === undefined) {
    delete process.env.AI_NEWS_IMPORT_TOKEN;
  } else {
    process.env.AI_NEWS_IMPORT_TOKEN = originalImportToken;
  }
});

function createRequest({ authorization = "Bearer test-token", body = "{}" }: { authorization?: string | null; body?: BodyInit } = {}) {
  const headers = new Headers();
  if (authorization !== null) {
    headers.set("authorization", authorization);
  }

  return new Request("http://localhost/api/admin/ai-news/import", {
    method: "POST",
    headers,
    body
  }) as NextRequest;
}

async function readJson(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

function createTitleRequiredZodError() {
  try {
    z.object({ title: z.string().min(1, "Title is required.") }).parse({ title: "" });
  } catch (error) {
    return error as ZodError;
  }

  throw new Error("Expected Zod validation to fail.");
}

describe("POST /api/admin/ai-news/import", () => {
  it("returns 401 for an invalid token and does not import", async () => {
    process.env.AI_NEWS_IMPORT_TOKEN = "test-token";

    const response = await POST(createRequest({ authorization: "Bearer wrong-token" }));

    expect(response.status).toBe(401);
    expect(await readJson(response)).toEqual({
      ok: false,
      error: "UNAUTHORIZED",
      message: "Invalid AI news import token."
    });
    expect(importAiNewsArticleMock).not.toHaveBeenCalled();
  });

  it("returns 400 when the request body is not valid JSON", async () => {
    process.env.AI_NEWS_IMPORT_TOKEN = "test-token";

    const response = await POST(createRequest({ body: "{" }));

    expect(response.status).toBe(400);
    expect(await readJson(response)).toEqual({
      ok: false,
      error: "VALIDATION_ERROR",
      message: "Request body must be valid JSON."
    });
    expect(importAiNewsArticleMock).not.toHaveBeenCalled();
  });

  it("returns 400 when the import service raises a Zod validation error", async () => {
    process.env.AI_NEWS_IMPORT_TOKEN = "test-token";
    importAiNewsArticleMock.mockRejectedValueOnce(createTitleRequiredZodError());

    const response = await POST(createRequest());

    expect(response.status).toBe(400);
    expect(await readJson(response)).toEqual({
      ok: false,
      error: "VALIDATION_ERROR",
      message: "Title is required."
    });
  });

  it("returns a generic 500 message and logs internal import errors", async () => {
    process.env.AI_NEWS_IMPORT_TOKEN = "test-token";
    const internalError = new Error("Prisma failed to connect to db.internal:5432");
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    importAiNewsArticleMock.mockRejectedValueOnce(internalError);

    const response = await POST(createRequest());

    expect(response.status).toBe(500);
    expect(await readJson(response)).toEqual({
      ok: false,
      error: "IMPORT_FAILED",
      message: "AI news import failed."
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith("AI news import failed.", internalError);

    consoleErrorSpy.mockRestore();
  });

  it("returns 400 when the imported cover image has already been used", async () => {
    process.env.AI_NEWS_IMPORT_TOKEN = "test-token";
    importAiNewsArticleMock.mockRejectedValueOnce(new DuplicateAiNewsCoverImageError("https://images.unsplash.com/photo-reused-cover"));

    const response = await POST(createRequest());

    expect(response.status).toBe(400);
    expect(await readJson(response)).toEqual({
      ok: false,
      error: "DUPLICATE_COVER_IMAGE",
      message: "AI news cover image is already used by another article."
    });
  });

  it("imports a draft article and revalidates the admin AI news page", async () => {
    process.env.AI_NEWS_IMPORT_TOKEN = "test-token";
    importAiNewsArticleMock.mockResolvedValueOnce({
      articleId: "article-1",
      slug: "draft-story",
      canonicalSlug: "draft-story",
      status: "draft",
      adminUrl: "/admin/ai-news/article-1",
      publicUrl: null
    });

    const response = await POST(createRequest({ body: JSON.stringify({ article: { title: "Draft story" } }) }));

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({
      ok: true,
      articleId: "article-1",
      slug: "draft-story",
      status: "draft",
      adminUrl: "/admin/ai-news/article-1",
      publicUrl: null
    });
    expect(revalidatePathMock).toHaveBeenCalledTimes(1);
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/ai-news");
    expect(notifyIndexNowMock).not.toHaveBeenCalled();
  });

  it("converts HTML import requests before importing", async () => {
    process.env.AI_NEWS_IMPORT_TOKEN = "test-token";
    importAiNewsArticleMock.mockResolvedValueOnce({
      articleId: "article-html",
      slug: "html-story",
      canonicalSlug: "html-story",
      status: "draft",
      adminUrl: "/admin/ai-news/article-html",
      publicUrl: null
    });

    const response = await POST(
      createRequest({
        body: JSON.stringify({
          format: "html",
          publishMode: "draft",
          importBatchId: "html-batch",
          categoryName: "AI Flash",
          tags: ["Automation"],
          html: `
            <article>
              <h1>Agent platforms reach more teams</h1>
              <meta name="description" content="A short factual summary for ENHE readers.">
              <meta name="keywords" content="AI agents, local AI">
              <p>Teams are adopting agent workflows for practical office automation.</p>
              <h2>Sources</h2>
              <a href="https://example.com/report">Example report</a>
            </article>
          `
        })
      })
    );

    expect(response.status).toBe(200);
    expect(importAiNewsArticleMock).toHaveBeenCalledWith({
      publishMode: "draft",
      importBatchId: "html-batch",
      article: expect.objectContaining({
        title: "Agent platforms reach more teams",
        summary: "A short factual summary for ENHE readers.",
        content: "Teams are adopting agent workflows for practical office automation.",
        categoryName: "AI Flash",
        tags: ["AI agents", "local AI", "Automation"],
        externalSources: [{ title: "Example report", url: "https://example.com/report", sourceType: "source" }]
      })
    });
  });

  it("passes CMS SEO and English fields from HTML import requests to the import service", async () => {
    process.env.AI_NEWS_IMPORT_TOKEN = "test-token";
    importAiNewsArticleMock.mockResolvedValueOnce({
      articleId: "article-cms-html",
      slug: "cms-html-story",
      canonicalSlug: "cms-html-story",
      status: "published",
      adminUrl: "/admin/ai-news/article-cms-html",
      publicUrl: "/ai-news/cms-html-story"
    });

    const response = await POST(
      createRequest({
        body: JSON.stringify({
          format: "html",
          publishMode: "published",
          html: `
            <article>
              <h1>AI agents move into team workflows</h1>
              <time datetime="2026-06-18">2026年6月18日</time>
              <meta name="description" content="A short factual summary for ENHE readers.">
              <meta name="keywords" content="AI agents, workflow automation">
              <p>Teams are adopting agent workflows for practical office automation.</p>
              <section id="cms-fields">
                <h2>CMS 字段</h2>
                <section data-field="keyTakeaways"><h3>核心要点，每行一条</h3><ul><li>智能体开始进入团队流程</li><li>权限管理影响实际落地</li></ul></section>
                <section data-field="impactNotes"><h3>这对用户意味着什么</h3><p>用户需要评估账号权限、流程复用和审计能力。</p></section>
                <section data-field="seoTitle"><h3>SEO 标题</h3><p>AI agents and workflow automation for teams</p></section>
                <section data-field="seoDescription"><h3>SEO 描述</h3><p>A concise ENHE AI brief on AI agents, team workflows and account safety.</p></section>
                <section data-field="englishTitle"><h3>English title</h3><p>AI agents move into team workflows</p></section>
                <section data-field="englishSeoDescription"><h3>English SEO description</h3><p>AI agents, workflow automation and account safety for small teams.</p></section>
                <section data-field="tags"><h3>标签</h3><p>AI资讯, 自动发布</p></section>
              </section>
              <h2>Sources</h2>
              <a href="https://example.com/report">Example report</a>
            </article>
          `
        })
      })
    );

    expect(response.status).toBe(200);
    expect(importAiNewsArticleMock).toHaveBeenCalledWith({
      publishMode: "published",
      publishedAt: new Date("2026-06-18T00:00:00.000Z"),
      article: expect.objectContaining({
        title: "AI agents move into team workflows",
        keyTakeaways: ["智能体开始进入团队流程", "权限管理影响实际落地"],
        impactNotes: "用户需要评估账号权限、流程复用和审计能力。",
        seoTitle: "AI agents and workflow automation for teams",
        seoDescription: "A concise ENHE AI brief on AI agents, team workflows and account safety.",
        englishTitle: "AI agents move into team workflows",
        englishDescription: "AI agents, workflow automation and account safety for small teams.",
        englishSeoDescription: "AI agents, workflow automation and account safety for small teams.",
        tags: ["AI agents", "workflow automation", "AI资讯", "自动发布"],
        externalSources: [{ title: "Example report", url: "https://example.com/report", sourceType: "source" }]
      })
    });
  });

  it("auto-generates English article fields for HTML automation imports that only contain Chinese content", async () => {
    process.env.AI_NEWS_IMPORT_TOKEN = "test-token";
    generateAiNewsEnglishDraftMock.mockResolvedValueOnce({
      englishTitle: "AI agents enter practical team workflows",
      englishSubtitle: "What small teams should evaluate before adoption",
      englishSummary:
        "AI agent updates are moving from demos into practical team workflows, making permissions, repeatability, and account safety more important.",
      englishContent:
        "## Fact Summary\n\nAI agent updates are moving from demos into practical team workflows.\n\n## Practical Impact\n\nSmall teams should evaluate permissions, repeatability, account safety, and tool integration before adoption.",
      englishKeyTakeaways: [
        "AI agents are moving toward team workflows.",
        "Permission boundaries matter before adoption.",
      ],
      englishImpactNotes:
        "ENHE AI readers should compare workflow reliability, account safety, and implementation scope before changing tools.",
      englishConclusion:
        "The practical value of agents depends on governed workflow automation, not only model capability.",
      englishDescription:
        "A concise ENHE AI news brief about AI agents, workflow automation, and practical adoption.",
      englishSeoTitle: "AI agents and workflow automation for small teams",
      englishSeoDescription:
        "A concise ENHE AI news brief about AI agents, workflow automation, account safety, and practical adoption.",
      englishKeywords: "AI agents, workflow automation, AI account safety",
      englishSeoKeywords: "AI agents, workflow automation, AI account safety",
    });
    importAiNewsArticleMock.mockResolvedValueOnce({
      articleId: "article-auto-en",
      slug: "ai-agent-workflows",
      canonicalSlug: "ai-agent-workflows",
      status: "published",
      adminUrl: "/admin/ai-news/article-auto-en",
      publicUrl: "/ai-news/ai-agent-workflows",
    });

    const response = await POST(
      createRequest({
        body: JSON.stringify({
          format: "html",
          publishMode: "published",
          html: `
            <article>
              <h1>AI智能体进入团队工作流</h1>
              <time datetime="2026-06-26">2026年6月26日</time>
              <meta name="description" content="AI智能体正在从演示走向团队工作流，权限、复用和账号安全成为落地前必须评估的问题。">
              <meta name="keywords" content="AI智能体,AI工作流自动化">
              <p>AI智能体正在从演示走向团队工作流，权限、复用和账号安全成为落地前必须评估的问题。</p>
              <section id="cms-fields">
                <section data-field="subtitle"><h3>副标题</h3><p>团队采用AI智能体前需要检查的关键问题</p></section>
                <section data-field="keyTakeaways"><h3>核心要点</h3><ul><li>智能体开始进入团队流程。</li><li>权限边界影响实际落地。</li></ul></section>
                <section data-field="impactNotes"><h3>影响说明</h3><p>用户需要评估账号权限、流程复用和审计能力。</p></section>
                <section data-field="conclusion"><h3>总结</h3><p>智能体价值正在转向可管理的工作流。</p></section>
                <section data-field="seoTitle"><h3>SEO标题</h3><p>AI智能体与团队工作流自动化</p></section>
                <section data-field="seoDescription"><h3>SEO描述</h3><p>AI智能体进入团队工作流后，权限、复用和账号安全成为小团队落地前必须评估的问题。</p></section>
              </section>
              <h2>来源</h2>
              <a href="https://example.com/report">Example report</a>
            </article>
          `,
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(generateAiNewsEnglishDraftMock).toHaveBeenCalledWith({
      title: "AI智能体进入团队工作流",
      subtitle: "团队采用AI智能体前需要检查的关键问题",
      summary:
        "AI智能体正在从演示走向团队工作流，权限、复用和账号安全成为落地前必须评估的问题。",
      content:
        "AI智能体正在从演示走向团队工作流，权限、复用和账号安全成为落地前必须评估的问题。",
      keyTakeaways: ["智能体开始进入团队流程。", "权限边界影响实际落地。"],
      impactNotes: "用户需要评估账号权限、流程复用和审计能力。",
      conclusion: "智能体价值正在转向可管理的工作流。",
      seoTitle: "AI智能体与团队工作流自动化",
      seoDescription:
        "AI智能体进入团队工作流后，权限、复用和账号安全成为小团队落地前必须评估的问题。",
      keywords: "AI智能体,AI工作流自动化",
    });
    expect(importAiNewsArticleMock).toHaveBeenCalledWith({
      publishMode: "published",
      publishedAt: new Date("2026-06-26T00:00:00.000Z"),
      article: expect.objectContaining({
        englishTitle: "AI agents enter practical team workflows",
        englishSummary:
          "AI agent updates are moving from demos into practical team workflows, making permissions, repeatability, and account safety more important.",
        englishContent: expect.stringContaining("## Fact Summary"),
        englishSeoTitle: "AI agents and workflow automation for small teams",
        englishSeoKeywords: "AI agents, workflow automation, AI account safety",
      }),
    });
  });

  it("returns 400 when an HTML import request is invalid", async () => {
    process.env.AI_NEWS_IMPORT_TOKEN = "test-token";

    const response = await POST(
      createRequest({
        body: JSON.stringify({
          format: "html",
          publishMode: "published",
          html: "<article><h1>No sources</h1><p>This published article has no source links.</p></article>"
        })
      })
    );

    expect(response.status).toBe(400);
    expect(await readJson(response)).toEqual({
      ok: false,
      error: "VALIDATION_ERROR",
      message: "Published HTML imports require at least one source link."
    });
    expect(importAiNewsArticleMock).not.toHaveBeenCalled();
  });

  it("imports a published article and revalidates public and admin AI news paths", async () => {
    process.env.AI_NEWS_IMPORT_TOKEN = "test-token";
    importAiNewsArticleMock.mockResolvedValueOnce({
      articleId: "article-2",
      slug: "published-story",
      canonicalSlug: "published-story-canonical",
      status: "published",
      adminUrl: "/admin/ai-news/article-2",
      publicUrl: "/custom-public-url"
    });

    const response = await POST(createRequest({ body: JSON.stringify({ article: { title: "Published story" } }) }));

    expect(response.status).toBe(200);
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/ai-news");
    expect(revalidatePathMock).toHaveBeenCalledWith("/ai-news");
    expect(revalidatePathMock).toHaveBeenCalledWith("/en/ai-news");
    expect(revalidatePathMock).toHaveBeenCalledWith("/ai-news/published-story-canonical");
    expect(revalidatePathMock).toHaveBeenCalledWith("/en/ai-news/published-story-canonical");
    expect(revalidatePathMock).not.toHaveBeenCalledWith("/custom-public-url");
    expect(notifyIndexNowMock).toHaveBeenCalledWith(["/custom-public-url"]);
  });
});
