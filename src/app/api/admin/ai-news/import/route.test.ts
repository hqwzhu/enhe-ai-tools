import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ZodError, z } from "zod";
import { importAiNewsArticle } from "@/lib/ai-news-import";
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

const importAiNewsArticleMock = vi.mocked(importAiNewsArticle);
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

  it("imports a draft article and revalidates the admin AI news page", async () => {
    process.env.AI_NEWS_IMPORT_TOKEN = "test-token";
    importAiNewsArticleMock.mockResolvedValueOnce({
      articleId: "article-1",
      slug: "draft-story",
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
  });

  it("imports a published article and revalidates public and admin AI news paths", async () => {
    process.env.AI_NEWS_IMPORT_TOKEN = "test-token";
    importAiNewsArticleMock.mockResolvedValueOnce({
      articleId: "article-2",
      slug: "published-story",
      status: "published",
      adminUrl: "/admin/ai-news/article-2",
      publicUrl: "/custom-public-url"
    });

    const response = await POST(createRequest({ body: JSON.stringify({ article: { title: "Published story" } }) }));

    expect(response.status).toBe(200);
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/ai-news");
    expect(revalidatePathMock).toHaveBeenCalledWith("/ai-news");
    expect(revalidatePathMock).toHaveBeenCalledWith("/en/ai-news");
    expect(revalidatePathMock).toHaveBeenCalledWith("/ai-news/published-story");
    expect(revalidatePathMock).toHaveBeenCalledWith("/en/ai-news/published-story");
    expect(revalidatePathMock).not.toHaveBeenCalledWith("/custom-public-url");
  });
});
