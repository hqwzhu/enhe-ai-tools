import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

function exists(path: string) {
  return existsSync(join(process.cwd(), path));
}

function readPrismaModel(modelName: string) {
  const schema = read("prisma/schema.prisma");
  const match = schema.match(new RegExp(`model ${modelName} \\{[\\s\\S]*?\\n\\}`));
  expect(match).not.toBeNull();
  return match?.[0] ?? "";
}

describe("AI news auto publishing source contracts", () => {
  it("adds a token-protected import route and shared import service", () => {
    expect(exists("src/app/api/admin/ai-news/import/route.ts")).toBe(true);
    expect(exists("src/lib/ai-news-import.ts")).toBe(true);

    const route = read("src/app/api/admin/ai-news/import/route.ts");
    expect(route).toContain("importAiNewsArticle");
    expect(route).toContain("verifyAiNewsImportToken");
    expect(route).toContain("NextResponse.json");
    expect(route).not.toContain("requireAdmin");
  });

  it("documents import environment variables and provides a local publishing script", () => {
    expect(read(".env.example")).toContain("AI_NEWS_IMPORT_TOKEN");
    expect(read(".env.example")).toContain("AI_NEWS_IMPORT_URL");
    expect(exists("scripts/publish-ai-news.ts")).toBe(true);

    const script = read("scripts/publish-ai-news.ts");
    expect(script).toContain("AI_NEWS_IMPORT_TOKEN");
    expect(script).toContain("AI_NEWS_IMPORT_URL");
    expect(script).toContain("Authorization");
    expect(script).toContain("Bearer");
  });

  it("adds import metadata to NewsArticle and exposes an admin badge", () => {
    const newsArticleModel = readPrismaModel("NewsArticle");
    expect(newsArticleModel).toContain("sourceChannel");
    expect(newsArticleModel).toContain("@map(\"source_channel\")");
    expect(newsArticleModel).toContain("importedAt");
    expect(newsArticleModel).toContain("@map(\"imported_at\")");
    expect(newsArticleModel).toContain("importBatchId");
    expect(newsArticleModel).toContain("@map(\"import_batch_id\")");
    expect(newsArticleModel).toContain("rawImportPayload");
    expect(newsArticleModel).toContain("@map(\"raw_import_payload\")");
    expect(newsArticleModel).toContain("@@index([sourceChannel, importedAt])");
    expect(newsArticleModel).toContain("@@index([importBatchId])");

    const adminList = read("src/app/admin/ai-news/page.tsx");
    expect(adminList).toContain("sourceChannel");
    expect(adminList).toContain("自动导入");
  });
});
