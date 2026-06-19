import { NextResponse } from "next/server";
import type { Locale } from "@/lib/dictionaries";
import { prisma } from "@/lib/db";
import { resolvePublicToolSlug } from "@/lib/public-content";
import { buildCanonicalToolPath } from "@/lib/public-slugs";

export async function buildLegacyToolDetailRedirectResponse(slug: string, forceLocale: Locale, requestUrl: string) {
  const slugMatch = await resolvePublicToolSlug(slug);
  if (!slugMatch) return null;

  const tool = await prisma.tool.findUnique({
    where: { id: slugMatch.id },
    select: { slug: true, name: true, englishName: true, status: true, type: true }
  });
  if (!tool || tool.status !== "published") return null;

  const location = new URL(buildCanonicalToolPath(tool, forceLocale), requestUrl);
  return NextResponse.redirect(location, 301);
}
