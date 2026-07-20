import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { buildAiNewsImportPayloadFromHtml } from "@/lib/ai-news-html-import";
import {
  DuplicateAiNewsCoverImageError,
  importAiNewsArticle,
  verifyAiNewsImportToken,
  type AiNewsImportPayload,
} from "@/lib/ai-news-import";
import { generateAiNewsEnglishDraft } from "@/lib/ai-news-translation";
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

const cjkTextPattern = /[\u3400-\u9fff]/;

function hasCjkText(value: string | null | undefined) {
  return cjkTextPattern.test(String(value ?? ""));
}

function shouldGenerateEnglishDraft(payload: AiNewsImportPayload) {
  const article = payload.article;
  if (article.englishContent?.trim()) return false;

  return [
    article.title,
    article.subtitle,
    article.summary,
    article.content,
    article.seoTitle,
    article.seoDescription,
  ].some(hasCjkText);
}

function fillMissingText<T extends Record<string, unknown>>(
  target: T,
  key: keyof T,
  value: unknown,
) {
  if (typeof target[key] === "string" && String(target[key]).trim()) return;
  if (typeof value === "string" && value.trim()) {
    target[key] = value.trim() as T[keyof T];
  }
}

function fillMissingList<T extends Record<string, unknown>>(
  target: T,
  key: keyof T,
  value: unknown,
) {
  if (Array.isArray(target[key]) && target[key].length) return;
  if (Array.isArray(value) && value.length) {
    target[key] = value as T[keyof T];
  }
}

async function completeEnglishFieldsForHtmlPayload(
  payload: AiNewsImportPayload,
) {
  if (!shouldGenerateEnglishDraft(payload)) return payload;

  const article = { ...payload.article };
  const englishDraft = await generateAiNewsEnglishDraft({
    title: article.title,
    subtitle: article.subtitle ?? "",
    summary: article.summary,
    content: article.content,
    keyTakeaways: article.keyTakeaways,
    impactNotes: article.impactNotes ?? "",
    conclusion: article.conclusion ?? "",
    seoTitle: article.seoTitle ?? "",
    seoDescription: article.seoDescription ?? article.description ?? "",
    keywords: article.seoKeywords ?? article.keywords ?? "",
  });

  fillMissingText(article, "englishTitle", englishDraft.englishTitle);
  fillMissingText(article, "englishSubtitle", englishDraft.englishSubtitle);
  fillMissingText(article, "englishSummary", englishDraft.englishSummary);
  fillMissingText(article, "englishContent", englishDraft.englishContent);
  fillMissingText(article, "englishDescription", englishDraft.englishDescription);
  fillMissingText(article, "englishSeoTitle", englishDraft.englishSeoTitle);
  fillMissingText(
    article,
    "englishSeoDescription",
    englishDraft.englishSeoDescription,
  );
  fillMissingText(article, "englishKeywords", englishDraft.englishKeywords);
  fillMissingText(
    article,
    "englishSeoKeywords",
    englishDraft.englishSeoKeywords || englishDraft.englishKeywords,
  );
  fillMissingText(article, "englishImpactNotes", englishDraft.englishImpactNotes);
  fillMissingText(article, "englishConclusion", englishDraft.englishConclusion);
  fillMissingList(
    article,
    "englishKeyTakeaways",
    englishDraft.englishKeyTakeaways,
  );

  return {
    ...payload,
    article,
  };
}

async function normalizeImportPayload(payload: unknown) {
  if (!isRecord(payload) || payload.format !== "html") return payload;

  if (typeof payload.html !== "string") {
    throw new Error("HTML import requires an html string.");
  }

  const htmlImportPayload = buildAiNewsImportPayloadFromHtml({
    html: payload.html,
    publishMode: payload.publishMode === "published" ? "published" : "draft",
    importBatchId: typeof payload.importBatchId === "string" ? payload.importBatchId : undefined,
    categoryName: typeof payload.categoryName === "string" ? payload.categoryName : undefined,
    categorySlug: typeof payload.categorySlug === "string" ? payload.categorySlug : undefined,
    tags: Array.isArray(payload.tags) ? payload.tags.filter((tag): tag is string => typeof tag === "string") : undefined
  });

  return completeEnglishFieldsForHtmlPayload(htmlImportPayload);
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
    importPayload = await normalizeImportPayload(payload);
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
