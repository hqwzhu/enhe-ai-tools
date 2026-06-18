import type { MetadataRoute } from "next";
import { isEnglishNewsArticleIndexable } from "@/lib/ai-news";
import { prisma } from "@/lib/db";
import { absoluteUrl, buildLanguageAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 300;

const staticRoutes = [
  "/",
  "/en",
  "/software",
  "/en/software",
  "/online-tools",
  "/en/online-tools",
  "/skill-learning",
  "/en/skill-learning",
  "/pricing",
  "/en/pricing",
  "/tutorials",
  "/en/tutorials",
  "/ai-news",
  "/en/ai-news",
  "/legal/user-agreement",
  "/en/legal/user-agreement",
  "/legal/privacy-policy",
  "/en/legal/privacy-policy",
  "/legal/membership-refund",
  "/en/legal/membership-refund",
  "/legal/disclaimer",
  "/en/legal/disclaimer",
  "/legal/copyright-complaint",
  "/en/legal/copyright-complaint",
  "/legal/minor-protection",
  "/en/legal/minor-protection"
] as const;

const staticRouteLastModified: Record<(typeof staticRoutes)[number], Date> = {
  "/": new Date("2026-06-17T00:00:00.000Z"),
  "/en": new Date("2026-06-17T00:00:00.000Z"),
  "/software": new Date("2026-06-17T00:00:00.000Z"),
  "/en/software": new Date("2026-06-17T00:00:00.000Z"),
  "/online-tools": new Date("2026-06-17T00:00:00.000Z"),
  "/en/online-tools": new Date("2026-06-17T00:00:00.000Z"),
  "/skill-learning": new Date("2026-06-17T00:00:00.000Z"),
  "/en/skill-learning": new Date("2026-06-17T00:00:00.000Z"),
  "/pricing": new Date("2026-06-17T00:00:00.000Z"),
  "/en/pricing": new Date("2026-06-17T00:00:00.000Z"),
  "/tutorials": new Date("2026-06-17T00:00:00.000Z"),
  "/en/tutorials": new Date("2026-06-17T00:00:00.000Z"),
  "/ai-news": new Date("2026-06-18T00:00:00.000Z"),
  "/en/ai-news": new Date("2026-06-18T00:00:00.000Z"),
  "/legal/user-agreement": new Date("2026-06-17T00:00:00.000Z"),
  "/en/legal/user-agreement": new Date("2026-06-17T00:00:00.000Z"),
  "/legal/privacy-policy": new Date("2026-06-17T00:00:00.000Z"),
  "/en/legal/privacy-policy": new Date("2026-06-17T00:00:00.000Z"),
  "/legal/membership-refund": new Date("2026-06-17T00:00:00.000Z"),
  "/en/legal/membership-refund": new Date("2026-06-17T00:00:00.000Z"),
  "/legal/disclaimer": new Date("2026-06-17T00:00:00.000Z"),
  "/en/legal/disclaimer": new Date("2026-06-17T00:00:00.000Z"),
  "/legal/copyright-complaint": new Date("2026-06-17T00:00:00.000Z"),
  "/en/legal/copyright-complaint": new Date("2026-06-17T00:00:00.000Z"),
  "/legal/minor-protection": new Date("2026-06-17T00:00:00.000Z"),
  "/en/legal/minor-protection": new Date("2026-06-17T00:00:00.000Z")
};

function getPriority(path: string) {
  if (path === "/" || path === "/en") return 1;
  if (path === "/pricing" || path === "/en/pricing") return 0.9;
  return 0.7;
}

function getCanonicalSourcePath(path: string) {
  return path.startsWith("/en/") ? path.slice(3) : path === "/en" ? "/" : path;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tools = await prisma.tool
    .findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true, type: true }
    })
    .catch(() => []);
  const newsArticles = await prisma.newsArticle
    .findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true, englishTitle: true, englishSummary: true, englishContent: true }
    })
    .catch(() => []);

  return [
    ...staticRoutes.map((path) => ({
      url: absoluteUrl(path),
      lastModified: staticRouteLastModified[path],
      alternates: {
        languages: buildLanguageAlternates(getCanonicalSourcePath(path))
      },
      changeFrequency: path === "/" || path === "/en" ? ("daily" as const) : ("weekly" as const),
      priority: getPriority(path)
    })),
    ...tools.flatMap((tool) =>
      (["/tools", "/en/tools"] as const).map((basePath) => ({
        url: absoluteUrl(`${basePath}/${tool.slug}`),
        lastModified: tool.updatedAt,
        alternates: {
          languages: buildLanguageAlternates(`/tools/${tool.slug}`)
        },
        changeFrequency: "weekly" as const,
        priority: tool.type === "software" ? 0.85 : 0.8
      }))
    ),
    ...newsArticles.flatMap((newsArticle) => {
      const routes = [
        { path: `/ai-news/${newsArticle.slug}`, priority: 0.78 },
        ...(isEnglishNewsArticleIndexable(newsArticle) ? [{ path: `/en/ai-news/${newsArticle.slug}`, priority: 0.72 }] : [])
      ];

      return routes.map((route) => ({
        url: absoluteUrl(route.path),
        lastModified: newsArticle.updatedAt,
        alternates: {
          languages: buildLanguageAlternates(`/ai-news/${newsArticle.slug}`)
        },
        changeFrequency: "weekly" as const,
        priority: route.priority
      }));
    })
  ];
}
