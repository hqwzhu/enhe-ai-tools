import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/seo";

const staticRoutes = [
  "/",
  "/software",
  "/online-tools",
  "/pricing",
  "/tutorials",
  "/legal/user-agreement",
  "/legal/privacy-policy",
  "/legal/membership-refund",
  "/legal/disclaimer"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tools = await prisma.tool.findMany({
    where: { status: "published" },
    select: { slug: true, updatedAt: true, type: true }
  });

  const now = new Date();
  return [
    ...staticRoutes.map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: path === "/" ? ("daily" as const) : ("weekly" as const),
      priority: path === "/" ? 1 : path === "/pricing" ? 0.9 : 0.7
    })),
    ...tools.map((tool) => ({
      url: absoluteUrl(`/tools/${tool.slug}`),
      lastModified: tool.updatedAt,
      changeFrequency: "weekly" as const,
      priority: tool.type === "software" ? 0.85 : 0.8
    }))
  ];
}
