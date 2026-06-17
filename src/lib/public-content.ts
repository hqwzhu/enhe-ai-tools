import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

const publicContentRevalidate = 300;

const getCachedHomeRecommendedTools = unstable_cache(
  async () =>
    prisma.tool.findMany({
      where: { status: "published" },
      include: { category: true, priceSpecs: { where: { status: "active" }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
      orderBy: [{ isHomeRecommended: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      take: 6
    }),
  ["public-home-recommended-tools"],
  { revalidate: publicContentRevalidate, tags: ["public-home", "public-tools"] }
);

const getCachedPublicToolListing = unstable_cache(
  async (type: "software" | "online" | "skill_learning", categoryId?: string, keyword?: string, paid?: string, sort?: string) =>
    prisma.tool.findMany({
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
    }),
  ["public-tool-listing"],
  { revalidate: publicContentRevalidate, tags: ["public-tools"] }
);

const getCachedPublicTutorials = unstable_cache(
  async () =>
    prisma.tutorial.findMany({
      where: { status: "active", tool: { status: "published" } },
      include: { tool: true },
      orderBy: { sortOrder: "asc" }
    }),
  ["public-tutorials"],
  { revalidate: publicContentRevalidate, tags: ["public-tutorials"] }
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

export async function getPublicToolListing(type: "software" | "online" | "skill_learning", categoryId?: string, keyword?: string, paid?: string, sort?: string) {
  return getCachedPublicToolListing(type, categoryId, keyword, paid, sort);
}

export async function getPublicTutorials() {
  return getCachedPublicTutorials();
}

export async function getPublicLegalPage(locale: "zh" | "en", slug: string) {
  return getCachedPublicLegalPages(locale, slug);
}
