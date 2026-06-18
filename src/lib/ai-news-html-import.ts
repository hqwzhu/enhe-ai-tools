import type { AiNewsImportPayload } from "@/lib/ai-news-import";

type PublishMode = "draft" | "published";

export type AiNewsHtmlImportInput = {
  html: string;
  publishMode?: PublishMode;
  importBatchId?: string;
  categoryName?: string;
  categorySlug?: string;
  tags?: string[];
};

const defaultDraftSource = {
  title: "ENHE AI",
  url: "https://www.enhe-tech.com.cn/",
  sourceType: "internal"
};

const maxHtmlChars = 80_000;

function rejectUnsafeHtml(html: string) {
  if (/<script[\s>]/i.test(html) || /<\/script\s*>/i.test(html)) {
    throw new Error("HTML cannot contain script tags.");
  }

  if (/<style[\s>]/i.test(html) || /<\/style\s*>/i.test(html)) {
    throw new Error("HTML cannot contain style tags.");
  }

  if (/<[a-z][^>]*\sstyle\s*=/i.test(html)) {
    throw new Error("HTML cannot contain style attributes.");
  }

  if (/<[a-z][^>]*\son[a-z]+\s*=/i.test(html)) {
    throw new Error("HTML cannot contain inline event handlers.");
  }
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_match, code: string) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function normalizeWhitespace(value: string) {
  return decodeHtmlEntities(value.replace(/\s+/g, " ")).trim();
}

function stripTags(value: string) {
  return normalizeWhitespace(value.replace(/<[^>]+>/g, " "));
}

function getAttribute(tag: string, name: string) {
  const pattern = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const match = tag.match(pattern);
  return normalizeWhitespace(match?.[1] ?? match?.[2] ?? match?.[3] ?? "");
}

function firstMatch(html: string, pattern: RegExp) {
  return html.match(pattern)?.[1] ?? "";
}

function extractMetaContent(html: string, name: string) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of metaTags) {
    if (getAttribute(tag, "name").toLowerCase() === name.toLowerCase()) {
      return getAttribute(tag, "content");
    }
  }
  return "";
}

function extractTitle(html: string) {
  const h1 = stripTags(firstMatch(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i));
  const title = h1 || extractMetaContent(html, "title") || stripTags(firstMatch(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i));
  if (!title) throw new Error("HTML import requires one h1 title.");
  return title.slice(0, 180);
}

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function extractCoverImage(html: string) {
  const imageTags = html.match(/<img\b[^>]*>/gi) ?? [];
  for (const tag of imageTags) {
    const src = getAttribute(tag, "src");
    if (isHttpUrl(src)) return src;
  }
  return undefined;
}

function extractPublishedAt(html: string, publishMode: PublishMode) {
  if (publishMode !== "published") return undefined;
  const timeTags = html.match(/<time\b[^>]*>/gi) ?? [];
  for (const tag of timeTags) {
    const datetime = getAttribute(tag, "datetime");
    if (!datetime) continue;
    const date = /^\d{4}-\d{2}-\d{2}$/.test(datetime) ? new Date(`${datetime}T00:00:00.000Z`) : new Date(datetime);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return undefined;
}

function splitKeywords(value: string) {
  return value
    .split(/[,，;；、\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function dedupeText(items: string[]) {
  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const item of items) {
    const normalized = item.trim();
    const key = normalized.toLowerCase();
    if (!normalized || seen.has(key)) continue;
    seen.add(key);
    deduped.push(normalized);
  }
  return deduped;
}

function extractTags(html: string, inputTags: string[] | undefined) {
  return dedupeText([...splitKeywords(extractMetaContent(html, "keywords")), ...(inputTags ?? [])]).slice(0, 20);
}

function isSourceHeading(text: string) {
  return /^(来源|消息来源|参考来源|sources?|references?)$/i.test(text.trim());
}

function extractSourceSection(html: string) {
  const headingPattern = /<h2\b[^>]*>([\s\S]*?)<\/h2>|<h3\b[^>]*>([\s\S]*?)<\/h3>/gi;
  let match: RegExpExecArray | null;
  while ((match = headingPattern.exec(html))) {
    const headingText = stripTags(match[1] ?? match[2] ?? "");
    if (!isSourceHeading(headingText)) continue;
    const start = headingPattern.lastIndex;
    const next = html.slice(start).search(/<h2\b|<h3\b/i);
    return next === -1 ? html.slice(start) : html.slice(start, start + next);
  }
  return "";
}

function extractSources(html: string, publishMode: PublishMode) {
  const sourceHtml = extractSourceSection(html) || html;
  const anchorTags = sourceHtml.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) ?? [];
  const sources = anchorTags
    .map((anchor) => {
      const openTag = anchor.match(/<a\b[^>]*>/i)?.[0] ?? "";
      const url = getAttribute(openTag, "href");
      const title = stripTags(anchor) || url;
      return isHttpUrl(url) && title ? { title: title.slice(0, 220), url, sourceType: "source" } : null;
    })
    .filter((source): source is { title: string; url: string; sourceType: string } => Boolean(source));

  const deduped = new Map<string, { title: string; url: string; sourceType: string }>();
  for (const source of sources) {
    if (!deduped.has(source.url)) deduped.set(source.url, source);
  }

  const result = Array.from(deduped.values()).slice(0, 12);
  if (publishMode === "published" && result.length === 0) {
    throw new Error("Published HTML imports require at least one source link.");
  }

  return result.length ? result : [defaultDraftSource];
}

function shouldSkipBlock(tagName: string, innerHtml: string) {
  if (tagName === "h1" || tagName === "time") return true;
  if ((tagName === "h2" || tagName === "h3") && isSourceHeading(stripTags(innerHtml))) return true;
  return false;
}

function convertInlineText(html: string) {
  return stripTags(html);
}

function convertList(innerHtml: string, ordered: boolean) {
  const items = (innerHtml.match(/<li\b[^>]*>[\s\S]*?<\/li>/gi) ?? [])
    .map((item) => stripTags(item))
    .filter(Boolean);
  return items.map((item, index) => (ordered ? `${index + 1}. ${item}` : `- ${item}`)).join("\n");
}

function convertPre(innerHtml: string) {
  const code = decodeHtmlEntities(innerHtml.replace(/<\/?code\b[^>]*>/gi, "").replace(/<[^>]+>/g, "")).trim();
  return code ? `\`\`\`\n${code}\n\`\`\`` : "";
}

function extractContent(html: string) {
  const blocks: string[] = [];
  const blockPattern = /<(h1|h2|h3|p|ul|ol|blockquote|pre)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  let skippingSources = false;

  while ((match = blockPattern.exec(html))) {
    const tagName = match[1].toLowerCase();
    const innerHtml = match[2];
    const text = convertInlineText(innerHtml);

    if (shouldSkipBlock(tagName, innerHtml)) {
      if ((tagName === "h2" || tagName === "h3") && isSourceHeading(text)) {
        skippingSources = true;
      }
      continue;
    }
    if (skippingSources) continue;

    if (!text && tagName !== "pre") continue;

    if (tagName === "h2") blocks.push(`## ${text}`);
    if (tagName === "h3") blocks.push(`### ${text}`);
    if (tagName === "p") blocks.push(text);
    if (tagName === "blockquote") blocks.push(`> ${text}`);
    if (tagName === "ul") {
      const list = convertList(innerHtml, false);
      if (list) blocks.push(list);
    }
    if (tagName === "ol") {
      const list = convertList(innerHtml, true);
      if (list) blocks.push(list);
    }
    if (tagName === "pre") {
      const pre = convertPre(innerHtml);
      if (pre) blocks.push(pre);
    }
  }

  const content = blocks.join("\n\n").trim();
  if (!content) throw new Error("HTML import requires article body content.");
  return content.slice(0, 50_000);
}

function extractSummary(html: string, content: string) {
  const metaDescription = extractMetaContent(html, "description");
  if (metaDescription) return metaDescription.slice(0, 1_200);

  const firstParagraph = stripTags(firstMatch(html, /<p\b[^>]*>([\s\S]*?)<\/p>/i));
  const summary = firstParagraph || content.split(/\r?\n/).find((line) => line.trim() && !line.startsWith("#"))?.trim() || "";
  if (!summary) throw new Error("HTML import requires a summary paragraph or meta description.");
  return summary.slice(0, 1_200);
}

export function buildAiNewsImportPayloadFromHtml(input: AiNewsHtmlImportInput): AiNewsImportPayload {
  const html = input.html.trim().replace(/^\uFEFF/, "");
  if (!html) throw new Error("HTML import requires HTML content.");
  if (html.length > maxHtmlChars) throw new Error(`HTML import cannot exceed ${maxHtmlChars} characters.`);

  rejectUnsafeHtml(html);

  const publishMode = input.publishMode ?? "draft";
  const title = extractTitle(html);
  const content = extractContent(html);
  const summary = extractSummary(html, content);
  const tags = extractTags(html, input.tags);
  const externalSources = extractSources(html, publishMode);
  const publishedAt = extractPublishedAt(html, publishMode);
  const coverImage = extractCoverImage(html);

  return {
    publishMode,
    ...(publishedAt ? { publishedAt } : {}),
    ...(input.importBatchId?.trim() ? { importBatchId: input.importBatchId.trim() } : {}),
    article: {
      title,
      summary,
      content,
      ...(coverImage ? { coverImage } : {}),
      ...(input.categoryName?.trim() ? { categoryName: input.categoryName.trim() } : {}),
      ...(input.categorySlug?.trim() ? { categorySlug: input.categorySlug.trim() } : {}),
      tags,
      keyTakeaways: [],
      relatedArticleIds: [],
      relatedToolIds: [],
      relatedTutorialIds: [],
      englishKeyTakeaways: [],
      externalSources
    }
  };
}
