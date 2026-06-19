import { isWeakSeoSlug, slugify } from "@/lib/admin-form";

export type NewsSort = "latest" | "hot" | "featured";

export type NewsSearchFilters = {
  q?: string;
  category?: string;
  tag?: string;
  sort: NewsSort;
  page: number;
  pageSize: number;
  skip: number;
};

export type NewsTocItem = {
  id: string;
  level: 2 | 3;
  title: string;
};

export type NewsContentBlock =
  | { type: "heading"; level: 2 | 3; id: string; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "quote"; text: string }
  | { type: "code"; language?: string; code: string };

const newsPageSize = 9;

export function resolveNewsSlug({
  title,
  slugInput,
  fallbackSeed
}: {
  title: string;
  slugInput?: string | null;
  fallbackSeed: string;
}) {
  const manualSlug = slugInput ? slugify(slugInput) : "";
  if (manualSlug) return manualSlug;

  const titleSlug = slugify(title);
  if (titleSlug) return titleSlug;

  return `news-${slugify(fallbackSeed) || "item"}`;
}

export function resolveAiNewsCanonicalSlug({
  slug,
  title,
  englishTitle
}: {
  slug: string;
  title: string;
  englishTitle?: string | null;
}) {
  const normalizedSlug = slugify(slug);
  if (!isWeakSeoSlug(normalizedSlug)) {
    return normalizedSlug;
  }

  const englishSlug = slugify(englishTitle ?? "");
  if (englishSlug && englishSlug !== normalizedSlug) {
    return englishSlug;
  }

  const titleSlug = slugify(title);
  if (titleSlug && titleSlug !== normalizedSlug) {
    return titleSlug;
  }

  return normalizedSlug;
}

function normalizeStringParam(value: string | undefined) {
  const text = String(value ?? "").trim();
  return text || undefined;
}

export function parseNewsSearchParams(params: Record<string, string | undefined>): NewsSearchFilters {
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const sort = params.sort === "hot" || params.sort === "featured" ? params.sort : "latest";

  return {
    q: normalizeStringParam(params.q),
    category: normalizeStringParam(params.category),
    tag: normalizeStringParam(params.tag),
    sort,
    page,
    pageSize: newsPageSize,
    skip: (page - 1) * newsPageSize
  };
}

export function escapeNewsText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripHeadingPrefix(line: string) {
  return line.replace(/^#{2,3}\s+/, "").trim();
}

export function extractNewsTableOfContents(content: string): NewsTocItem[] {
  let count = 0;
  return content
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(/^(##|###)\s+(.+)$/);
      if (!match) return null;
      count += 1;
      return {
        id: `section-${count}`,
        level: match[1] === "###" ? 3 : 2,
        title: stripHeadingPrefix(line)
      } satisfies NewsTocItem;
    })
    .filter((item): item is NewsTocItem => Boolean(item));
}

function pushParagraph(lines: string[], blocks: NewsContentBlock[]) {
  const text = lines.join(" ").trim();
  if (text) blocks.push({ type: "paragraph", text: escapeNewsText(text) });
  lines.length = 0;
}

function pushList(items: string[], ordered: boolean, blocks: NewsContentBlock[]) {
  if (!items.length) return;
  blocks.push({ type: "list", ordered, items: items.map(escapeNewsText) });
  items.length = 0;
}

function isHttpNewsMediaUrl(value: string) {
  return /^https?:\/\//i.test(value.trim());
}

function parseMarkdownImage(line: string) {
  const match = line.match(/^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]+)")?\)$/);
  if (!match) return null;

  const src = match[2].trim();
  if (!isHttpNewsMediaUrl(src)) return null;

  const alt = match[1].trim();
  const caption = match[3]?.trim();
  return {
    type: "image" as const,
    src,
    alt,
    ...(caption ? { caption: escapeNewsText(caption) } : {})
  };
}

export function renderNewsContentBlocks(content: string): NewsContentBlock[] {
  const blocks: NewsContentBlock[] = [];
  const paragraphLines: string[] = [];
  const listItems: string[] = [];
  let currentListOrdered = false;
  let headingCount = 0;
  let inCode = false;
  let codeLanguage = "";
  const codeLines: string[] = [];

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    const codeFence = line.match(/^```(.*)$/);
    if (codeFence) {
      if (inCode) {
        blocks.push({ type: "code", language: codeLanguage || undefined, code: codeLines.join("\n") });
        codeLines.length = 0;
        codeLanguage = "";
        inCode = false;
      } else {
        pushParagraph(paragraphLines, blocks);
        pushList(listItems, currentListOrdered, blocks);
        codeLanguage = codeFence[1].trim();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(rawLine);
      continue;
    }

    if (!line.trim()) {
      pushParagraph(paragraphLines, blocks);
      pushList(listItems, currentListOrdered, blocks);
      continue;
    }

    const heading = line.match(/^(##|###)\s+(.+)$/);
    if (heading) {
      pushParagraph(paragraphLines, blocks);
      pushList(listItems, currentListOrdered, blocks);
      headingCount += 1;
      blocks.push({
        type: "heading",
        level: heading[1] === "###" ? 3 : 2,
        id: `section-${headingCount}`,
        text: escapeNewsText(stripHeadingPrefix(line))
      });
      continue;
    }

    const image = parseMarkdownImage(line.trim());
    if (image) {
      pushParagraph(paragraphLines, blocks);
      pushList(listItems, currentListOrdered, blocks);
      blocks.push(image);
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (unordered || ordered) {
      pushParagraph(paragraphLines, blocks);
      const nextOrdered = Boolean(ordered);
      if (listItems.length && currentListOrdered !== nextOrdered) {
        pushList(listItems, currentListOrdered, blocks);
      }
      currentListOrdered = nextOrdered;
      listItems.push((unordered?.[1] ?? ordered?.[1] ?? "").trim());
      continue;
    }

    const quote = line.match(/^>\s+(.+)$/);
    if (quote) {
      pushParagraph(paragraphLines, blocks);
      pushList(listItems, currentListOrdered, blocks);
      blocks.push({ type: "quote", text: escapeNewsText(quote[1]) });
      continue;
    }

    pushList(listItems, currentListOrdered, blocks);
    paragraphLines.push(line.trim());
  }

  if (inCode) {
    blocks.push({ type: "code", language: codeLanguage || undefined, code: codeLines.join("\n") });
  }
  pushParagraph(paragraphLines, blocks);
  pushList(listItems, currentListOrdered, blocks);

  return blocks;
}

export function isEnglishNewsArticleIndexable(article: {
  englishTitle?: string | null;
  englishSummary?: string | null;
  englishContent?: string | null;
}) {
  const title = String(article.englishTitle ?? "").trim();
  const summary = String(article.englishSummary ?? "").trim();
  const content = String(article.englishContent ?? "").replace(/\s+/g, " ").trim();

  return title.length >= 12 && summary.length >= 24 && content.length >= 180;
}

function looksLikeDateOnlyDescription(value: string) {
  const text = value.trim();
  return (
    /^\d{4}[-/.年]\d{1,2}[-/.月]\d{1,2}日?$/.test(text) ||
    /^[A-Z][a-z]+ \d{1,2}, \d{4}$/.test(text) ||
    /^\d{1,2} [A-Z][a-z]+ \d{4}$/.test(text)
  );
}

function normalizeAiNewsMetaCandidate(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveAiNewsMetaDescription(
  candidates: Array<string | null | undefined>,
  fallback: string,
  minLength = 24
) {
  const validCandidate = candidates
    .map((candidate) => normalizeAiNewsMetaCandidate(candidate))
    .find((candidate) => candidate.length >= minLength && !looksLikeDateOnlyDescription(candidate));
  const normalizedFallback = normalizeAiNewsMetaCandidate(fallback);

  return validCandidate || (looksLikeDateOnlyDescription(normalizedFallback) ? "" : normalizedFallback);
}

export function parseNewsRelationIds(value: string | null | undefined) {
  const seen = new Set<string>();
  return String(value ?? "")
    .split(/[\n,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => {
      if (seen.has(item)) return false;
      seen.add(item);
      return true;
    });
}

export function resolveNewsVideo(
  article: {
    videoUrl?: string | null;
    videoTitle?: string | null;
    videoDescription?: string | null;
  },
  fallbackTitle: string
) {
  const url = String(article.videoUrl ?? "").trim();
  if (!isHttpNewsMediaUrl(url)) return null;

  const title = String(article.videoTitle ?? "").trim() || fallbackTitle;
  const description = String(article.videoDescription ?? "").trim();
  return {
    url,
    title,
    ...(description ? { description } : {})
  };
}

export function toNewsIsoDate(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
