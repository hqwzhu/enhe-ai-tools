import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

const publicContentRevalidate = 300;

type PublicToolType = "software" | "online" | "skill_learning";

export type PublicNewsListingFilters = {
  q?: string;
  category?: string;
  tag?: string;
  sort?: "latest" | "hot" | "featured";
  skip?: number;
  take?: number;
};

function isRecoverablePublicReadError(error: unknown) {
  if (!(error instanceof Error)) return false;

  const errorWithCode = error as Error & { code?: unknown };
  const code = typeof errorWithCode.code === "string" ? errorWithCode.code : "";
  const message = error.message;

  return code === "P1001" || /Can't reach database server/i.test(message) || /ECONNREFUSED/i.test(message);
}

const getCachedHomeRecommendedTools = unstable_cache(
  async () => {
    try {
      return await prisma.tool.findMany({
        where: { status: "published" },
        include: { category: true, priceSpecs: { where: { status: "active" }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
        orderBy: [{ isHomeRecommended: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
        take: 6
      });
    } catch (error) {
      if (isRecoverablePublicReadError(error)) {
        return [];
      }

      throw error;
    }
  },
  ["public-home-recommended-tools"],
  { revalidate: publicContentRevalidate, tags: ["public-home", "public-tools"] }
);

const getCachedPublicToolListing = unstable_cache(
  async (type: PublicToolType, categoryId?: string, keyword?: string, paid?: string, sort?: string) => {
    try {
      return await prisma.tool.findMany({
        where: {
          type,
          status: "published",
          ...(categoryId ? { categoryId } : {}),
          ...(type === "software" && paid === "paid" ? { isDownloadPaid: true } : type === "software" && paid === "free" ? { isDownloadPaid: false } : {}),
          ...(keyword
            ? {
                OR: [
                  { name: { contains: keyword, mode: "insensitive" } },
                  { englishName: { contains: keyword, mode: "insensitive" } },
                  { shortDescription: { contains: keyword, mode: "insensitive" } }
                ]
              }
            : {})
        },
        include: { category: true, priceSpecs: { where: { status: "active" }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
        orderBy:
          type === "software"
            ? sort === "hot"
              ? { downloadCount: "desc" }
              : { createdAt: "desc" }
            : sort === "hot"
              ? { usageCount: "desc" }
              : { createdAt: "desc" }
      });
    } catch (error) {
      if (isRecoverablePublicReadError(error)) {
        return [];
      }

      throw error;
    }
  },
  ["public-tool-listing"],
  { revalidate: publicContentRevalidate, tags: ["public-tools"] }
);

const getCachedPublicTutorials = unstable_cache(
  async () => {
    try {
      return await prisma.tutorial.findMany({
        where: { status: "active", tool: { status: "published" } },
        include: { tool: true },
        orderBy: { sortOrder: "asc" }
      });
    } catch (error) {
      if (isRecoverablePublicReadError(error)) {
        return [];
      }

      throw error;
    }
  },
  ["public-tutorials"],
  { revalidate: publicContentRevalidate, tags: ["public-tutorials"] }
);

const getCachedPublicToolCategories = unstable_cache(
  async (type: PublicToolType) => {
    try {
      return await prisma.toolCategory.findMany({
        where: { type, status: "active" },
        orderBy: { sortOrder: "asc" }
      });
    } catch (error) {
      if (isRecoverablePublicReadError(error)) {
        return [];
      }

      throw error;
    }
  },
  ["public-tool-categories"],
  { revalidate: publicContentRevalidate, tags: ["public-tools"] }
);

const getCachedPublicLegalPages = unstable_cache(
  async (locale: "zh" | "en", slug: string) => {
    const { getLegalPage } = await import("@/lib/legal");
    return getLegalPage(slug, locale);
  },
  ["public-legal-pages"],
  { revalidate: publicContentRevalidate, tags: ["public-legal-pages"] }
);

function buildNewsWhere(filters: PublicNewsListingFilters): Prisma.NewsArticleWhereInput {
  const keyword = filters.q?.trim();

  return {
    status: "published",
    ...(filters.category ? { categoryId: filters.category } : {}),
    ...(filters.tag ? { tagLinks: { some: { tag: { slug: filters.tag } } } } : {}),
    ...(keyword
      ? {
          OR: [
            { title: { contains: keyword, mode: "insensitive" } },
            { subtitle: { contains: keyword, mode: "insensitive" } },
            { summary: { contains: keyword, mode: "insensitive" } },
            { description: { contains: keyword, mode: "insensitive" } },
            { keywords: { contains: keyword, mode: "insensitive" } },
            { tagLinks: { some: { tag: { name: { contains: keyword, mode: "insensitive" } } } } }
          ]
        }
      : {})
  };
}

const getCachedPublicNewsListing = unstable_cache(
  async (filters: PublicNewsListingFilters) => {
    try {
      const where = buildNewsWhere(filters);
      const orderBy: Prisma.NewsArticleOrderByWithRelationInput[] =
        filters.sort === "hot"
          ? [{ viewCount: "desc" }, { publishedAt: "desc" }]
          : filters.sort === "featured"
            ? [{ isPinned: "desc" }, { isFeatured: "desc" }, { sortOrder: "asc" }, { publishedAt: "desc" }]
            : [{ isPinned: "desc" }, { publishedAt: "desc" }];
      const [articles, total] = await Promise.all([
        prisma.newsArticle.findMany({
          where,
          include: { category: true, tagLinks: { include: { tag: true } } },
          orderBy,
          skip: filters.skip ?? 0,
          take: filters.take ?? 9
        }),
        prisma.newsArticle.count({ where })
      ]);

      return { articles, total };
    } catch (error) {
      if (isRecoverablePublicReadError(error)) return { articles: [], total: 0 };
      throw error;
    }
  },
  ["public-news-listing"],
  { revalidate: publicContentRevalidate, tags: ["public-news"] }
);

const getCachedPublicNewsCategories = unstable_cache(
  async () => {
    try {
      return await prisma.newsCategory.findMany({
        where: { status: "active" },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
      });
    } catch (error) {
      if (isRecoverablePublicReadError(error)) return [];
      throw error;
    }
  },
  ["public-news-categories"],
  { revalidate: publicContentRevalidate, tags: ["public-news"] }
);

const getCachedPublicNewsTags = unstable_cache(
  async () => {
    try {
      return await prisma.newsTag.findMany({
        where: { status: "active" },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
      });
    } catch (error) {
      if (isRecoverablePublicReadError(error)) return [];
      throw error;
    }
  },
  ["public-news-tags"],
  { revalidate: publicContentRevalidate, tags: ["public-news"] }
);

const getCachedPublicNewsArticleBySlug = unstable_cache(
  async (slug: string) => {
    try {
      return await prisma.newsArticle.findFirst({
        where: { slug, status: "published" },
        include: {
          category: true,
          tagLinks: { include: { tag: true } },
          externalSources: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }
        }
      });
    } catch (error) {
      if (isRecoverablePublicReadError(error)) return null;
      throw error;
    }
  },
  ["public-news-article-by-slug"],
  { revalidate: publicContentRevalidate, tags: ["public-news"] }
);

export async function getHomeRecommendedTools() {
  return getCachedHomeRecommendedTools();
}

export async function getPublicToolCategories(type: PublicToolType) {
  return getCachedPublicToolCategories(type);
}

export async function getPublicToolListing(type: PublicToolType, categoryId?: string, keyword?: string, paid?: string, sort?: string) {
  return getCachedPublicToolListing(type, categoryId, keyword, paid, sort);
}

export async function getPublicTutorials() {
  return getCachedPublicTutorials();
}

export async function getPublicLegalPage(locale: "zh" | "en", slug: string) {
  return getCachedPublicLegalPages(locale, slug);
}

export async function getPublicNewsListing(filters: PublicNewsListingFilters) {
  return getCachedPublicNewsListing(filters);
}

export async function getPublicNewsCategories() {
  return getCachedPublicNewsCategories();
}

export async function getPublicNewsTags() {
  return getCachedPublicNewsTags();
}

export async function getPublicNewsArticleBySlug(slug: string) {
  return getCachedPublicNewsArticleBySlug(slug);
}
