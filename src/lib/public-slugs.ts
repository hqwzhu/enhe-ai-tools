import type { Locale } from "@/lib/dictionaries";
import { buildSeoFriendlySlug } from "@/lib/admin-form";
import { resolveAiNewsCanonicalSlug } from "@/lib/ai-news";
import { buildLocalePath } from "@/lib/seo";

export function getCanonicalToolSlug(tool: {
  slug: string;
  name: string;
  englishName?: string | null;
}) {
  return buildSeoFriendlySlug({
    currentSlug: tool.slug,
    name: tool.name,
    englishName: tool.englishName
  });
}

export function buildCanonicalToolPath(
  tool: {
    slug: string;
    name: string;
    englishName?: string | null;
    type?: "software" | "online" | "skill_learning";
  },
  locale: Locale
) {
  return buildLocalePath(`${getCanonicalToolBasePath(tool)}/${getCanonicalToolSlug(tool)}`, locale);
}

export function getCanonicalToolBasePath(tool: { type?: "software" | "online" | "skill_learning" }) {
  if (tool.type === "online") return "/account-services";
  if (tool.type === "skill_learning") return "/skill-learning";
  return "/software";
}

export function getCanonicalAiNewsSlug(article: {
  slug: string;
  title: string;
  englishTitle?: string | null;
}) {
  return resolveAiNewsCanonicalSlug({
    slug: article.slug,
    title: article.title,
    englishTitle: article.englishTitle
  });
}

export function buildCanonicalAiNewsPath(
  article: {
    slug: string;
    title: string;
    englishTitle?: string | null;
  },
  locale: Locale
) {
  return buildLocalePath(`/ai-news/${getCanonicalAiNewsSlug(article)}`, locale);
}
