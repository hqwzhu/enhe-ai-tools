import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

function exists(path: string) {
  return existsSync(join(process.cwd(), path));
}

describe("AI news source contracts", () => {
  it("adds localized public and admin AI news routes", () => {
    expect(exists("src/app/ai-news/page-shell.tsx")).toBe(true);
    expect(exists("src/app/ai-news/[slug]/page-shell.tsx")).toBe(true);
    expect(exists("src/app/(zh-public)/ai-news/page.tsx")).toBe(true);
    expect(exists("src/app/(zh-public)/ai-news/[slug]/page.tsx")).toBe(true);
    expect(exists("src/app/en/ai-news/page.tsx")).toBe(true);
    expect(exists("src/app/en/ai-news/[slug]/page.tsx")).toBe(true);
    expect(exists("src/app/admin/ai-news/page.tsx")).toBe(true);
    expect(exists("src/app/admin/ai-news/[id]/page.tsx")).toBe(true);
  });

  it("exposes AI news navigation in public and admin chrome", () => {
    const dictionaries = read("src/lib/dictionaries.ts");
    const header = read("src/components/site-header.tsx");
    const adminLayout = read("src/app/admin/layout.tsx");
    const adminI18n = read("src/lib/admin-i18n.ts");

    expect(dictionaries).toContain("aiNews");
    expect(dictionaries).toContain("AI资讯");
    expect(dictionaries).toContain("AI News");
    expect(header).toContain('buildLocalePath("/ai-news", locale)');
    expect(adminLayout).toContain('["aiNews", "/admin/ai-news"]');
    expect(adminI18n).toContain("aiNews");
  });

  it("adds AI news to localized SEO, public cache, and sitemap source", () => {
    const seo = read("src/lib/seo.ts");
    const publicContent = read("src/lib/public-content.ts");
    const sitemap = read("src/app/sitemap.ts");

    expect(seo).toContain("/^\\/ai-news$/");
    expect(seo).toContain("/^\\/ai-news\\/.+$/");
    expect(publicContent).toContain("getPublicNewsListing");
    expect(publicContent).toContain("getPublicNewsArticleBySlug");
    expect(sitemap).toContain('"/ai-news"');
    expect(sitemap).toContain('"/en/ai-news"');
    expect(sitemap).toContain("newsArticle");
  });

  it("adds Prisma news models and interaction APIs", () => {
    const schema = read("prisma/schema.prisma");

    expect(schema).toContain("enum NewsStatus");
    expect(schema).toContain("model NewsArticle");
    expect(schema).toContain("model NewsCategory");
    expect(schema).toContain("model NewsTag");
    expect(schema).toContain("model NewsExternalSource");
    expect(schema).toContain("model NewsArticleFavorite");
    expect(schema).toContain("model NewsArticleLike");
    expect(exists("src/app/api/ai-news/[slug]/view/route.ts")).toBe(true);
    expect(exists("src/app/api/ai-news/[slug]/like/route.ts")).toBe(true);
    expect(exists("src/app/api/ai-news/[slug]/favorite/route.ts")).toBe(true);
  });
});
