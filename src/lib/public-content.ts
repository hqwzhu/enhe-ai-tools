import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

const publicContentRevalidate = 300;

type PublicToolType = "software" | "online" | "skill_learning";

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
