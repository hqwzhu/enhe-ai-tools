import { timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { resolveNewsSlug } from "@/lib/ai-news";
import { prisma } from "@/lib/db";
import { tagSlug } from "@/lib/tool-content";

const defaultAiNewsCategory = {
  name: "AI快讯",
  slug: "ai-news-flash"
};

const aiNewsImportSourceChannel = "ai_auto_import";
const maxRawImportPayloadChars = 100_000;
const maxSlugCollisionAttempts = 5;

const optionalTrimmedString = (max: number) => z.string().trim().min(1).max(max).optional();
const optionalHttpUrl = z.string().trim().url().max(2_000).refine((value) => /^https?:\/\//i.test(value), "URL must use http or https").optional();
const publishedAtSchema = z.string().trim().datetime().transform((value) => new Date(value)).optional();

export const aiNewsSourceSchema = z.object({
  title: z.string().trim().min(1).max(220),
  url: z.string().trim().url().max(2_000).refine((value) => /^https?:\/\//i.test(value), "Source URL must use http or https"),
  sourceType: z.string().trim().min(1).max(80),
  description: optionalTrimmedString(500)
});

export const aiNewsImportArticleSchema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: optionalTrimmedString(220),
  subtitle: optionalTrimmedString(220),
  description: optionalTrimmedString(500),
  keywords: optionalTrimmedString(500),
  summary: z.string().trim().min(1).max(1_200),
  content: z.string().trim().min(1).max(50_000),
  coverImage: optionalHttpUrl,
  videoUrl: optionalHttpUrl,
  videoTitle: optionalTrimmedString(220),
  videoDescription: optionalTrimmedString(500),
  author: optionalTrimmedString(120),
  categoryName: optionalTrimmedString(120),
  categorySlug: optionalTrimmedString(220),
  tags: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  readingTime: z.number().int().positive().max(120).optional(),
  seoTitle: optionalTrimmedString(220),
  seoDescription: optionalTrimmedString(500),
  seoKeywords: optionalTrimmedString(500),
  canonicalUrl: optionalHttpUrl,
  keyTakeaways: z.array(z.string().trim().min(1).max(220)).max(8).default([]),
  impactNotes: optionalTrimmedString(2_000),
  conclusion: optionalTrimmedString(2_000),
  relatedArticleIds: z.array(z.string().trim().min(1).max(120)).max(20).default([]),
  relatedToolIds: z.array(z.string().trim().min(1).max(120)).max(20).default([]),
  relatedTutorialIds: z.array(z.string().trim().min(1).max(120)).max(20).default([]),
  englishTitle: optionalTrimmedString(180),
  englishSubtitle: optionalTrimmedString(220),
  englishDescription: optionalTrimmedString(500),
  englishSummary: optionalTrimmedString(1_200),
  englishContent: optionalTrimmedString(50_000),
  englishKeywords: optionalTrimmedString(500),
  englishSeoTitle: optionalTrimmedString(220),
  englishSeoDescription: optionalTrimmedString(500),
  englishSeoKeywords: optionalTrimmedString(500),
  englishKeyTakeaways: z.array(z.string().trim().min(1).max(220)).max(8).default([]),
  englishImpactNotes: optionalTrimmedString(2_000),
  englishConclusion: optionalTrimmedString(2_000),
  externalSources: z.array(aiNewsSourceSchema).min(1).max(12)
});

export const aiNewsImportPayloadSchema = z.object({
  publishMode: z.enum(["draft", "published"]).default("draft"),
  publishedAt: publishedAtSchema,
  importBatchId: optionalTrimmedString(120),
  article: aiNewsImportArticleSchema
});

export type AiNewsImportPayload = z.infer<typeof aiNewsImportPayloadSchema>;
export type AiNewsImportArticle = z.infer<typeof aiNewsImportArticleSchema>;

export type AiNewsImportData = {
  category: {
    name: string;
    slug: string;
    shouldUpdateName: boolean;
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

export function verifyAiNewsImportToken(authorization: string | null, expectedToken: string | undefined) {
  const expected = expectedToken?.trim();
  if (!expected || !authorization) return false;

  const match = authorization.match(/^Bearer\s+(.+)$/);
  if (!match) return false;

  const receivedBuffer = Buffer.from(match[1]);
  const expectedBuffer = Buffer.from(expected);
  if (receivedBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(receivedBuffer, expectedBuffer);
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
  const sanitized = JSON.parse(
    JSON.stringify({
      ...payload,
      publishedAt: payload.publishedAt?.toISOString(),
      sourceChannel: aiNewsImportSourceChannel
    })
  );
  const length = JSON.stringify(sanitized).length;
  if (length > maxRawImportPayloadChars) {
    throw new Error(`Raw import payload exceeds ${maxRawImportPayloadChars} characters.`);
  }

  return sanitized;
}

function buildImportCategory(article: AiNewsImportArticle) {
  if (article.categorySlug) {
    return {
      name: article.categoryName ?? defaultAiNewsCategory.name,
      slug: resolveNewsSlug({ title: article.categorySlug, slugInput: article.categorySlug, fallbackSeed: defaultAiNewsCategory.slug }),
      shouldUpdateName: false
    };
  }

  if (article.categoryName) {
    return {
      name: article.categoryName,
      slug: resolveNewsSlug({ title: article.categoryName, fallbackSeed: defaultAiNewsCategory.slug }),
      shouldUpdateName: true
    };
  }

  return {
    ...defaultAiNewsCategory,
    shouldUpdateName: true
  };
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
  const category = buildImportCategory(payload.article);

  return {
    category,
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
      sourceChannel: aiNewsImportSourceChannel,
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

type AiNewsImportTransaction = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

function importSlugCandidate(baseSlug: string, attempt: number) {
  return attempt === 1 ? baseSlug : `${baseSlug}-${attempt}`;
}

async function resolveUniqueImportSlug(tx: AiNewsImportTransaction, baseSlug: string) {
  for (let attempt = 1; attempt <= maxSlugCollisionAttempts; attempt += 1) {
    const slug = importSlugCandidate(baseSlug, attempt);
    const existing = await tx.newsArticle.findFirst({ where: { slug }, select: { id: true } });
    if (!existing) return slug;
  }

  throw new Error("Unable to resolve a unique AI news article slug.");
}

function isPrismaUniqueCollision(error: unknown) {
  return (
    (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") ||
    (typeof error === "object" && error !== null && "code" in error && error.code === "P2002")
  );
}

async function createImportAuditLog({
  tx,
  article,
  payload,
  sourceCount,
  tagCount
}: {
  tx: AiNewsImportTransaction;
  article: { id: string; title: string; slug: string; status: string };
  payload: AiNewsImportPayload;
  sourceCount: number;
  tagCount: number;
}) {
  await tx.adminAuditLog.create({
    data: {
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
        sourceChannel: aiNewsImportSourceChannel,
        sourceCount,
        tagCount
      },
      ip: null,
      userAgent: null
    }
  });
}

async function persistAiNewsImportAttempt({
  tx,
  payload,
  now,
  slug
}: {
  tx: AiNewsImportTransaction;
  payload: AiNewsImportPayload;
  now: Date;
  slug: string;
}) {
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

  const category = await tx.newsCategory.upsert({
    where: { slug: data.category.slug },
    update: data.category.shouldUpdateName
      ? {
          name: data.category.name,
          status: "active"
        }
      : {
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

  const article = await tx.newsArticle.create({ data: articleCreateData });

  const tags = await Promise.all(
    data.tags.map((name) =>
      tx.newsTag.upsert({
        where: { name },
        update: { status: "active" },
        create: { name, slug: tagSlug(name), status: "active" }
      })
    )
  );

  await tx.newsArticleTag.deleteMany({ where: { articleId: article.id } });
  if (tags.length) {
    await tx.newsArticleTag.createMany({
      data: tags.map((tag) => ({ articleId: article.id, tagId: tag.id })),
      skipDuplicates: true
    });
  }

  await tx.newsExternalSource.deleteMany({ where: { articleId: article.id } });
  await tx.newsExternalSource.createMany({
    data: data.externalSources.map((source) => ({
      articleId: article.id,
      title: source.title,
      url: source.url,
      sourceType: source.sourceType,
      description: source.description ?? null,
      sortOrder: source.sortOrder
    }))
  });

  await createImportAuditLog({
    tx,
    article,
    payload,
    sourceCount: data.externalSources.length,
    tagCount: tags.length
  });

  return article;
}

export async function importAiNewsArticle(rawPayload: unknown): Promise<AiNewsImportResult> {
  const payload = aiNewsImportPayloadSchema.parse(rawPayload);
  const now = new Date();
  const baseSlug = resolveNewsSlug({
    title: payload.article.title,
    slugInput: payload.article.slug,
    fallbackSeed: payload.importBatchId ?? now.getTime().toString(36)
  });

  for (let attempt = 1; attempt <= maxSlugCollisionAttempts; attempt += 1) {
    try {
      const article = await prisma.$transaction(async (tx) => {
        const slug = await resolveUniqueImportSlug(tx, importSlugCandidate(baseSlug, attempt));
        return persistAiNewsImportAttempt({ tx, payload, now, slug });
      });
      const status = article.status as "draft" | "published";

      return {
        articleId: article.id,
        slug: article.slug,
        status,
        adminUrl: `/admin/ai-news/${article.id}`,
        publicUrl: status === "published" ? `/ai-news/${article.slug}` : null
      };
    } catch (error) {
      if (!isPrismaUniqueCollision(error) || attempt === maxSlugCollisionAttempts) {
        throw error;
      }
    }
  }

  throw new Error("Unable to import AI news article with a unique slug.");
}
