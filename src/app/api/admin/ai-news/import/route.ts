import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { importAiNewsArticle, verifyAiNewsImportToken } from "@/lib/ai-news-import";

export const dynamic = "force-dynamic";

function errorResponse(status: number, error: string, message: string) {
  return NextResponse.json(
    {
      ok: false,
      error,
      message
    },
    { status }
  );
}

export async function POST(request: NextRequest) {
  if (!verifyAiNewsImportToken(request.headers.get("authorization"), process.env.AI_NEWS_IMPORT_TOKEN)) {
    return errorResponse(401, "UNAUTHORIZED", "Invalid AI news import token.");
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse(400, "VALIDATION_ERROR", "Request body must be valid JSON.");
  }

  try {
    const result = await importAiNewsArticle(payload);
    revalidatePath("/admin/ai-news");
    if (result.status === "published") {
      revalidatePath("/ai-news");
      revalidatePath("/en/ai-news");
      revalidatePath(`/ai-news/${result.slug}`);
      revalidatePath(`/en/ai-news/${result.slug}`);
    }

    return NextResponse.json({
      ok: true,
      articleId: result.articleId,
      slug: result.slug,
      status: result.status,
      adminUrl: result.adminUrl,
      publicUrl: result.publicUrl
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(400, "VALIDATION_ERROR", error.issues[0]?.message ?? "Invalid AI news import payload.");
    }
    console.error("AI news import failed.", error);
    return errorResponse(500, "IMPORT_FAILED", "AI news import failed.");
  }
}
