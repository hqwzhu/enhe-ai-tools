import { Prisma } from "@prisma/client";
import { z } from "zod";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import { resolveNewsSlug } from "@/lib/ai-news";
import { prisma } from "@/lib/db";
import { tagSlug } from "@/lib/tool-content";

const defaultAiNewsCategory = {
  name: "AI快讯",
  slug: "ai-news-flash"
};

export const aiNewsSourceSchema = z.object({
  title: z.string().trim().min(1),
  url: z.string().trim().url().refine((value) => /^https?:\/\//i.test(value), "Source URL must use http or https"),
  sourceType: z.string().trim().min(1),
  description: z.string().trim().min(1).optional()
});

export const aiNewsImportArticleSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1).optional(),
  subtitle: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  keywords: z.string().trim().min(1).optional(),
  summary: z.string().trim().min(1),
  content: z.string().trim().min(1),
  coverImage: z.string().trim().min(1).optional(),
  videoUrl: z.string().trim().min(1).optional(),
  videoTitle: z.string().trim().min(1).optional(),
  videoDescription: z.string().trim().min(1).optional(),
  author: z.string().trim().min(1).optional(),
  categoryName: z.string().trim().min(1).optional(),
  categorySlug: z.string().trim().min(1).optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  readingTime: z.number().int().positive().optional(),
  seoTitle: z.string().trim().min(1).optional(),
  seoDescription: z.string().trim().min(1).optional(),
  seoKeywords: z.string().trim().min(1).optional(),
  canonicalUrl: z.string().trim().min(1).optional(),
  keyTakeaways: z.array(z.string().trim().min(1)).default([]),
  impactNotes: z.string().trim().min(1).optional(),
  conclusion: z.string().trim().min(1).optional(),
  relatedArticleIds: z.array(z.string().trim().min(1)).default([]),
  relatedToolIds: z.array(z.string().trim().min(1)).default([]),
  relatedTutorialIds: z.array(z.string().trim().min(1)).default([]),
  englishTitle: z.string().trim().min(1).optional(),
  englishSubtitle: z.string().trim().min(1).optional(),
  englishDescription: z.string().trim().min(1).optional(),
  englishSummary: z.string().trim().min(1).optional(),
  englishContent: z.string().trim().min(1).optional(),
  englishKeywords: z.string().trim().min(1).optional(),
  englishSeoTitle: z.string().trim().min(1).optional(),
  englishSeoDescription: z.string().trim().min(1).optional(),
  englishSeoKeywords: z.string().trim().min(1).optional(),
  englishKeyTakeaways: z.array(z.string().trim().min(1)).default([]),
  englishImpactNotes: z.string().trim().min(1).optional(),
  englishConclusion: z.string().trim().min(1).optional(),
  externalSources: z.array(aiNewsSourceSchema).min(1)
});

export const aiNewsImportPayloadSchema = z.object({
  publishMode: z.enum(["draft", "published"]).default("draft"),
  publishedAt: z.coerce.date().optional(),
  importBatchId: z.string().trim().min(1).optional(),
  sourceChannel: z.string().trim().min(1).default("ai_auto_import"),
  article: aiNewsImportArticleSchema
});

export type AiNewsImportPayload = z.infer<typeof aiNewsImportPayloadSchema>;
export type AiNewsImportArticle = z.infer<typeof aiNewsImportArticleSchema>;

export type AiNewsImportData = {
  category: {
    name: string;
    slug: string;
  };
  article: Omit<Prisma.NewsArticleUncheckedCreateInput, "categoryId">;
  tags: string[];
  externalSources: Array<z.infer<typeof aiNewsSourceSchema> & { sortOrder: number }>;
};

export type AiNewsImportResult = {
  articleId: string;
  slug: string;
  status: "draft" | "published";
  adminUrl: string;
  publicUrl: string | null;
};

export function verifyAiNewsImportToken(authorization: string | null, expectedToken: string) {
  if (!expectedToken.trim() || !authorization) return false;

  const match = authorization.match(/^Bearer\s+(.+)$/);
  if (!match) return false;

  return match[1] === expectedToken;
}

export function rejectUnsafeNewsImportContent(content: string) {
  if (/<!doctype\s+html\b/i.test(content) || /<html[\s>]/i.test(content)) {
    throw new Error("Imported content cannot contain raw HTML documents.");
  }

  if (/<script[\s>]/i.test(content) || /<\/script\s*>/i.test(content)) {
    throw new Error("Imported content cannot contain script tags.");
  }

  if (/<style[\s>]/i.test(content) || /<\/style\s*>/i.test(content)) {
    throw new Error("Imported content cannot contain style tags.");
  }

  if (/<[a-z][^>]*\son[a-z]+\s*=/i.test(content)) {
    throw new Error("Imported content cannot contain inline event handler attributes.");
  }
}

export function sanitizeRawImportPayload(payload: AiNewsImportPayload) {
  return JSON.parse(
    JSON.stringify({
      ...payload,
      publishedAt: payload.publishedAt?.toISOString()
    })
  );
}

export function buildAiNewsImportData(payload: AiNewsImportPayload, now = new Date()): AiNewsImportData {
  rejectUnsafeNewsImportContent(payload.article.content);
  if (payload.article.englishContent) {
    rejectUnsafeNewsImportContent(payload.article.englishContent);
  }

  const status = payload.publishMode;
  const publishedAt = status === "published" ? payload.publishedAt ?? now : null;
  const fallbackSeed = payload.importBatchId ?? now.getTime().toString(36);
  const slug = resolveNewsSlug({
    title: payload.article.title,
    slugInput: payload.article.slug,
    fallbackSeed
  });
  const categorySlug = payload.article.categorySlug ?? defaultAiNewsCategory.slug;
  const categoryName = payload.article.categoryName ?? defaultAiNewsCategory.name;

  return {
    category: {
      name: categoryName,
      slug: categorySlug
    },
    article: {
      title: payload.article.title,
      slug,
      subtitle: payload.article.subtitle ?? null,
      description: payload.article.description ?? null,
      keywords: payload.article.keywords ?? null,
      summary: payload.article.summary,
      content: payload.article.content,
      coverImage: payload.article.coverImage ?? null,
      videoUrl: payload.article.videoUrl ?? null,
      videoTitle: payload.article.videoTitle ?? null,
      videoDescription: payload.article.videoDescription ?? null,
      author: payload.article.author ?? null,
      status,
      publishedAt,
      readingTime: payload.article.readingTime ?? 5,
      viewCount: 0,
      likeCount: 0,
      favoriteCount: 0,
      isFeatured: false,
      isPinned: false,
      sortOrder: 0,
      seoTitle: payload.article.seoTitle ?? null,
      seoDescription: payload.article.seoDescription ?? null,
      seoKeywords: payload.article.seoKeywords ?? null,
      canonicalUrl: payload.article.canonicalUrl ?? null,
      sourceChannel: payload.sourceChannel,
      importedAt: now,
      importBatchId: payload.importBatchId ?? null,
      rawImportPayload: sanitizeRawImportPayload(payload),
      keyTakeaways: payload.article.keyTakeaways,
      impactNotes: payload.article.impactNotes ?? null,
      conclusion: payload.article.conclusion ?? null,
      relatedArticleIds: payload.article.relatedArticleIds,
      relatedToolIds: payload.article.relatedToolIds,
      relatedTutorialIds: payload.article.relatedTutorialIds,
      englishTitle: payload.article.englishTitle ?? null,
      englishSubtitle: payload.article.englishSubtitle ?? null,
      englishDescription: payload.article.englishDescription ?? null,
      englishSummary: payload.article.englishSummary ?? null,
      englishContent: payload.article.englishContent ?? null,
      englishKeywords: payload.article.englishKeywords ?? null,
      englishSeoTitle: payload.article.englishSeoTitle ?? null,
      englishSeoDescription: payload.article.englishSeoDescription ?? null,
      englishSeoKeywords: payload.article.englishSeoKeywords ?? null,
      englishKeyTakeaways: payload.article.englishKeyTakeaways,
      englishImpactNotes: payload.article.englishImpactNotes ?? null,
      englishConclusion: payload.article.englishConclusion ?? null
    },
    tags: payload.article.tags,
    externalSources: payload.article.externalSources.map((source, index) => ({
      ...source,
      description: source.description ?? undefined,
      sortOrder: index
    }))
  };
}

async function resolveUniqueImportSlug(input: { title: string; slugInput?: string | null; fallbackSeed: string }) {
  let slug = resolveNewsSlug(input);
  const baseSlug = slug;
  let retry = 0;

  while (await prisma.newsArticle.findFirst({ where: { slug }, select: { id: true } })) {
    retry += 1;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`;
    if (retry > 10) break;
  }

  return slug;
}

export async function importAiNewsArticle(rawPayload: unknown): Promise<AiNewsImportResult> {
  const payload = aiNewsImportPayloadSchema.parse(rawPayload);
  const now = new Date();
  const slug = await resolveUniqueImportSlug({
    title: payload.article.title,
    slugInput: payload.article.slug,
    fallbackSeed: payload.importBatchId ?? now.getTime().toString(36)
  });
  const data = buildAiNewsImportData(
    {
      ...payload,
      article: {
        ...payload.article,
        slug
      }
    },
    now
  );

  const category = await prisma.newsCategory.upsert({
    where: { slug: data.category.slug },
    update: {
      name: data.category.name,
      status: "active"
    },
    create: {
      name: data.category.name,
      slug: data.category.slug,
      status: "active"
    }
  });

  const articleCreateData: Prisma.NewsArticleUncheckedCreateInput = {
    ...data.article,
    categoryId: category.id
  };

  const article = await prisma.newsArticle.create({ data: articleCreateData });

  const tags = await Promise.all(
    data.tags.map((name) =>
      prisma.newsTag.upsert({
        where: { name },
        update: { status: "active" },
        create: { name, slug: tagSlug(name), status: "active" }
      })
    )
  );

  await prisma.newsArticleTag.deleteMany({ where: { articleId: article.id } });
  if (tags.length) {
    await prisma.newsArticleTag.createMany({
      data: tags.map((tag) => ({ articleId: article.id, tagId: tag.id })),
      skipDuplicates: true
    });
  }

  await prisma.newsExternalSource.deleteMany({ where: { articleId: article.id } });
  await prisma.newsExternalSource.createMany({
    data: data.externalSources.map((source) => ({
      articleId: article.id,
      title: source.title,
      url: source.url,
      sourceType: source.sourceType,
      description: source.description ?? null,
      sortOrder: source.sortOrder
    }))
  });

  await writeAdminAuditLog({
    adminId: null,
    action: "news_article.auto_import",
    targetType: "news_article",
    targetId: article.id,
    summary: "Auto-imported AI news article.",
    metadata: {
      title: article.title,
      slug: article.slug,
      status: article.status,
      importBatchId: payload.importBatchId ?? null,
      sourceChannel: payload.sourceChannel
    }
  });

  const status = article.status as "draft" | "published";

  return {
    articleId: article.id,
    slug: article.slug,
    status,
    adminUrl: `/admin/ai-news/${article.id}`,
    publicUrl: status === "published" ? `/ai-news/${article.slug}` : null
  };
}
