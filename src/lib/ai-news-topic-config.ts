import { unstable_cache } from "next/cache";
import type { Locale } from "@/lib/dictionaries";
import {
  aiNewsTopics,
  getAiNewsTopicCopy,
  type AiNewsTopic,
  type AiNewsTopicSlug,
} from "@/lib/ai-news-topics";
import { prisma } from "@/lib/db";

type TopicActionLink = AiNewsTopic["zh"]["actionLinks"][number];
type TopicFaq = AiNewsTopic["zh"]["faqs"][number];
type TopicSourceLink = AiNewsTopic["sourceLinks"][number];

export type AiNewsTopicRecord = {
  slug: string;
  updatedAt: Date | string;
  title: string;
  description: string;
  intro: string;
  answer: string;
  searchQuery: string;
  keywords: string[];
  whyItMatters: string[];
  actionLinks: unknown;
  faqs: unknown;
  sourceLinks: unknown;
  englishTitle: string | null;
  englishDescription: string | null;
  englishIntro: string | null;
  englishAnswer: string | null;
  englishSearchQuery: string | null;
  englishKeywords: string[];
  englishWhyItMatters: string[];
  englishActionLinks: unknown;
  englishFaqs: unknown;
};

export type AiNewsTopicMatchableArticle = {
  title: string | null;
  summary: string | null;
  description: string | null;
  keywords: string | null;
  englishTitle?: string | null;
  englishSummary?: string | null;
  englishDescription?: string | null;
  englishKeywords?: string | null;
  tagLinks?: Array<{ tag: { name: string | null } }>;
};

type TopicDelimitedRowKind = "faq" | "source" | "action";

function isRecoverableTopicReadError(error: unknown) {
  if (!(error instanceof Error)) return false;

  const errorWithCode = error as Error & { code?: unknown; meta?: { table?: unknown } };
  const code = typeof errorWithCode.code === "string" ? errorWithCode.code : "";
  const table = typeof errorWithCode.meta?.table === "string" ? errorWithCode.meta.table : "";
  return (
    code === "P1001" ||
    code === "P2021" ||
    table.includes("news_topics") ||
    /Environment variable not found:\s*DATABASE_URL/i.test(error.message) ||
    /PrismaClientInitializationError/i.test(error.name) ||
    /Can't reach database server/i.test(error.message) ||
    /ECONNREFUSED/i.test(error.message) ||
    /news_topics/i.test(error.message)
  );
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeOptionalText(value: unknown) {
  const text = normalizeText(value);
  return text || null;
}

function normalizeStringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => normalizeText(item))
    .filter((item): item is string => Boolean(item));
}

function parseJsonArray(value: unknown) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeActionLinks(value: unknown): TopicActionLink[] {
  return parseJsonArray(value)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const label = normalizeText(record.label);
      const href = normalizeText(record.href);
      if (!label || !isAllowedActionHref(href)) return null;
      return { label, href };
    })
    .filter((item): item is TopicActionLink => Boolean(item));
}

function normalizeFaqs(value: unknown): TopicFaq[] {
  return parseJsonArray(value)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const question = normalizeText(record.question);
      const answer = normalizeText(record.answer);
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((item): item is TopicFaq => Boolean(item));
}

function normalizeSourceLinks(value: unknown): TopicSourceLink[] {
  return parseJsonArray(value)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const title = normalizeText(record.title);
      const url = normalizeText(record.url);
      if (!title || !/^https?:\/\//i.test(url)) return null;
      return { title, url };
    })
    .filter((item): item is TopicSourceLink => Boolean(item));
}

function isAllowedActionHref(value: string) {
  return value.startsWith("/") || /^https?:\/\//i.test(value);
}

function splitSearchTerms(value: string) {
  return value
    .split(/[\s,，、;；|]+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2);
}

function normalizeMatchText(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function dedupe(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function toTopicSlug(slug: string) {
  return slug as AiNewsTopicSlug;
}

export function normalizeAiNewsTopicRecord(record: AiNewsTopicRecord): AiNewsTopic {
  const zhActionLinks = normalizeActionLinks(record.actionLinks);
  const zhFaqs = normalizeFaqs(record.faqs);
  const enActionLinks = normalizeActionLinks(record.englishActionLinks);
  const enFaqs = normalizeFaqs(record.englishFaqs);
  const zhKeywords = normalizeStringList(record.keywords);
  const enKeywords = normalizeStringList(record.englishKeywords);
  const zhWhyItMatters = normalizeStringList(record.whyItMatters);
  const enWhyItMatters = normalizeStringList(record.englishWhyItMatters);

  return {
    slug: toTopicSlug(record.slug),
    updatedAt: new Date(record.updatedAt).toISOString(),
    sourceLinks: normalizeSourceLinks(record.sourceLinks),
    zh: {
      title: record.title,
      description: record.description,
      intro: record.intro,
      answer: record.answer,
      searchQuery: record.searchQuery,
      keywords: zhKeywords,
      whyItMatters: zhWhyItMatters,
      actionLinks: zhActionLinks,
      faqs: zhFaqs,
    },
    en: {
      title: normalizeOptionalText(record.englishTitle) ?? record.title,
      description: normalizeOptionalText(record.englishDescription) ?? record.description,
      intro: normalizeOptionalText(record.englishIntro) ?? record.intro,
      answer: normalizeOptionalText(record.englishAnswer) ?? record.answer,
      searchQuery: normalizeOptionalText(record.englishSearchQuery) ?? record.searchQuery,
      keywords: enKeywords.length ? enKeywords : zhKeywords,
      whyItMatters: enWhyItMatters.length ? enWhyItMatters : zhWhyItMatters,
      actionLinks: enActionLinks.length ? enActionLinks : zhActionLinks,
      faqs: enFaqs.length ? enFaqs : zhFaqs,
    },
  };
}

export function parseTopicDelimitedRows(value: string, kind: "faq"): TopicFaq[];
export function parseTopicDelimitedRows(value: string, kind: "source"): TopicSourceLink[];
export function parseTopicDelimitedRows(value: string, kind: "action"): TopicActionLink[];
export function parseTopicDelimitedRows(
  value: string,
  kind: TopicDelimitedRowKind,
): Array<TopicFaq | TopicSourceLink | TopicActionLink> {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split("|").map((part) => part.trim()))
    .map((parts) => {
      if (kind === "faq") {
        const [question = "", answer = ""] = parts;
        return question && answer ? { question, answer } : null;
      }
      if (kind === "source") {
        const [title = "", url = ""] = parts;
        return title && /^https?:\/\//i.test(url) ? { title, url } : null;
      }

      const [label = "", href = ""] = parts;
      return label && isAllowedActionHref(href) ? { label, href } : null;
    })
    .filter((item): item is TopicFaq | TopicSourceLink | TopicActionLink => Boolean(item));
}

export function formatTopicDelimitedRows(
  value: unknown,
  kind: TopicDelimitedRowKind,
) {
  if (kind === "faq") {
    return normalizeFaqs(value)
      .map((item) => `${item.question}|${item.answer}`)
      .join("\n");
  }
  if (kind === "source") {
    return normalizeSourceLinks(value)
      .map((item) => `${item.title}|${item.url}`)
      .join("\n");
  }
  return normalizeActionLinks(value)
    .map((item) => `${item.label}|${item.href}`)
    .join("\n");
}

export function buildAiNewsTopicSearchTerms(topic: AiNewsTopic, locale: Locale) {
  const copy = getAiNewsTopicCopy(topic, locale);
  return dedupe([
    copy.searchQuery,
    ...splitSearchTerms(copy.searchQuery),
    ...copy.keywords,
    topic.slug,
  ]);
}

export function articleMatchesAiNewsTopic(
  article: AiNewsTopicMatchableArticle,
  topic: AiNewsTopic,
  locale: Locale,
) {
  const terms = buildAiNewsTopicSearchTerms(topic, locale)
    .map(normalizeMatchText)
    .filter(Boolean);
  if (!terms.length) return false;

  const fields =
    locale === "en"
      ? [
          article.englishTitle,
          article.englishSummary,
          article.englishDescription,
          article.englishKeywords,
          article.title,
          article.summary,
          article.description,
          article.keywords,
        ]
      : [
          article.title,
          article.summary,
          article.description,
          article.keywords,
          article.englishTitle,
          article.englishSummary,
          article.englishDescription,
          article.englishKeywords,
        ];
  const tags = (article.tagLinks ?? []).map((link) => link.tag.name);
  const haystack = normalizeMatchText([...fields, ...tags].filter(Boolean).join(" "));

  return terms.some((term) => haystack.includes(term));
}

export function filterAiNewsTopicArticles<T extends AiNewsTopicMatchableArticle>(
  articles: T[],
  topic: AiNewsTopic,
  locale: Locale,
  take = articles.length,
) {
  return articles
    .filter((article) => articleMatchesAiNewsTopic(article, topic, locale))
    .slice(0, Math.max(0, take));
}

const getCachedConfiguredAiNewsTopics = unstable_cache(
  async () => {
    try {
      if (!("newsTopic" in prisma) || !prisma.newsTopic) return [];
      const rows = await prisma.newsTopic.findMany({
        where: { status: "active" },
        orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      });
      return rows.map(normalizeAiNewsTopicRecord);
    } catch (error) {
      if (isRecoverableTopicReadError(error)) return [];
      throw error;
    }
  },
  ["public-ai-news-topics"],
  { revalidate: 300, tags: ["public-news", "public-ai-news-topics"] },
);

async function readConfiguredAiNewsTopics() {
  try {
    if (!("newsTopic" in prisma) || !prisma.newsTopic) return [];
    const rows = await prisma.newsTopic.findMany({
      where: { status: "active" },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    });
    return rows.map(normalizeAiNewsTopicRecord);
  } catch (error) {
    if (isRecoverableTopicReadError(error)) return [];
    throw error;
  }
}

export async function getPublicAiNewsTopics() {
  const topics =
    process.env.NODE_ENV === "test"
      ? await readConfiguredAiNewsTopics()
      : await getCachedConfiguredAiNewsTopics();
  return topics.length ? topics : aiNewsTopics;
}

export async function getPublicAiNewsTopic(slug: string) {
  const topics = await getPublicAiNewsTopics();
  return topics.find((topic) => topic.slug === slug) ?? null;
}

export async function getPublicAiNewsTopicSlugs() {
  const topics = await getPublicAiNewsTopics();
  return dedupe([...topics.map((topic) => topic.slug), ...aiNewsTopics.map((topic) => topic.slug)]);
}
