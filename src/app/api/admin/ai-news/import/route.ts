import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { buildAiNewsImportPayloadFromHtml } from "@/lib/ai-news-html-import";
import { DuplicateAiNewsCoverImageError, importAiNewsArticle, verifyAiNewsImportToken } from "@/lib/ai-news-import";
import { notifyBaiduSearch } from "@/lib/baidu-push";
import { notifyIndexNow } from "@/lib/indexnow";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeImportPayload(payload: unknown) {
  if (!isRecord(payload) || payload.format !== "html") return payload;

  if (typeof payload.html !== "string") {
    throw new Error("HTML import requires an html string.");
  }

  return buildAiNewsImportPayloadFromHtml({
    html: payload.html,
    publishMode: payload.publishMode === "published" ? "published" : "draft",
    importBatchId: typeof payload.importBatchId === "string" ? payload.importBatchId : undefined,
    categoryName: typeof payload.categoryName === "string" ? payload.categoryName : undefined,
    categorySlug: typeof payload.categorySlug === "string" ? payload.categorySlug : undefined,
    tags: Array.isArray(payload.tags) ? payload.tags.filter((tag): tag is string => typeof tag === "string") : undefined
  });
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

  let importPayload: unknown;
  try {
    importPayload = normalizeImportPayload(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid AI news HTML import payload.";
    return errorResponse(400, "VALIDATION_ERROR", message);
  }

  try {
    const result = await importAiNewsArticle(importPayload);
    revalidatePath("/admin/ai-news");
    if (result.status === "published") {
      revalidatePath("/ai-news");
      revalidatePath("/en/ai-news");
      revalidatePath(`/ai-news/${result.canonicalSlug}`);
      revalidatePath(`/en/ai-news/${result.canonicalSlug}`);
      await notifyIndexNow([result.publicUrl]);
      await notifyBaiduSearch([result.publicUrl]);
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
    if (error instanceof DuplicateAiNewsCoverImageError) {
      return errorResponse(400, error.code, error.message);
    }
    console.error("AI news import failed.", error);
    return errorResponse(500, "IMPORT_FAILED", "AI news import failed.");
  }
}
