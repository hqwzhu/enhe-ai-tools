import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await prisma.newsArticle.updateMany({
    where: { slug, status: "published" },
    data: { viewCount: { increment: 1 } }
  });
  return NextResponse.json({ ok: true });
}
