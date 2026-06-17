import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/seo";
import { legalSlugs } from "@/lib/legal";

export const revalidate = 300;

const staticRoutes = [
  "/",
  "/software",
  "/online-tools",
  "/skill-learning",
  "/pricing",
  "/tutorials",
  "/legal/user-agreement",
  "/legal/privacy-policy",
  "/legal/membership-refund",
  "/legal/disclaimer",
  "/legal/copyright-complaint",
  "/legal/minor-protection"
];

const staticRouteLastModified = {
  "/": new Date("2026-06-17T00:00:00.000Z"),
  "/software": new Date("2026-06-17T00:00:00.000Z"),
  "/online-tools": new Date("2026-06-17T00:00:00.000Z"),
  "/skill-learning": new Date("2026-06-17T00:00:00.000Z"),
  "/pricing": new Date("2026-06-17T00:00:00.000Z"),
  "/tutorials": new Date("2026-06-17T00:00:00.000Z"),
  "/legal/user-agreement": new Date("2026-06-17T00:00:00.000Z"),
  "/legal/privacy-policy": new Date("2026-06-17T00:00:00.000Z"),
  "/legal/membership-refund": new Date("2026-06-17T00:00:00.000Z"),
  "/legal/disclaimer": new Date("2026-06-17T00:00:00.000Z"),
  "/legal/copyright-complaint": new Date("2026-06-17T00:00:00.000Z"),
  "/legal/minor-protection": new Date("2026-06-17T00:00:00.000Z")
} as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tools = await prisma.tool.findMany({
    where: { status: "published" },
    select: { slug: true, updatedAt: true, type: true }
  });

  return [
    ...staticRoutes.map((path) => ({
      url: absoluteUrl(path),
      lastModified: staticRouteLastModified[path as keyof typeof staticRouteLastModified],
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
