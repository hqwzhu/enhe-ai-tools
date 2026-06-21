import type { Locale } from "@/lib/i18n";
import {
  hasAccountServiceRiskTerms,
  sanitizeAccountServiceCopy,
} from "@/lib/seo";

type ToolType = "software" | "online" | "skill_learning";

type LocalizedToolInput = {
  slug: string;
  name: string;
  englishName?: string | null;
  shortDescription?: string | null;
  content?: string | null;
  type: ToolType;
  categoryName?: string | null;
};

type LocalizedFaqInput = {
  id: string;
  question: string;
  answer: string;
};

type LocalizedTutorialInput = {
  id: string;
  title: string;
  content: string;
  notes?: string | null;
  commonErrors?: string | null;
  videoUrl?: string | null;
};

type LocalizedTagInput = {
  tag: {
    id: string;
    name: string;
  };
};

const englishWordOverrides: Record<string, string> = {
  ai: "AI",
  enhe: "ENHE",
  chatgpt: "ChatGPT",
  codex: "Codex",
  dalle: "DALL-E",
  gemini: "Gemini",
  gmail: "Gmail",
  tiktok: "TikTok",
  telegram: "Telegram",
  facebook: "Facebook",
  google: "Google",
  pro: "Pro",
  plus: "Plus",
  studio: "Studio",
  video: "Video",
  audio: "Audio",
};

const generatedSlugPatterns = [
  /^tool-[a-z0-9]{12,}$/i,
  /^auto-local-tool-\d+$/i,
  /^e2e-[a-z0-9-]+$/i,
] as const;

const cjkPattern = /[\u3400-\u9fff]/;
const latinWordPattern = /[A-Za-z][A-Za-z0-9'+-]*/g;
const sentenceBreakPattern = /[。！？!?；;\n]+/;

function normalizeText(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function normalizeRichText(value: string | null | undefined) {
  return (
    value
      ?.replace(/\r\n?/g, "\n")
      .replace(/\u00a0/g, " ")
      .split("\n")
      .map((line) => line.replace(/[ \t]+/g, " ").trim())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim() ?? ""
  );
}

function sanitizeAccountServiceRichCopy(
  value: string | null | undefined,
  locale: Locale,
) {
  const richText = normalizeRichText(value);
  if (!richText) return "";

  const compactText = normalizeText(value);
  const sanitized = sanitizeAccountServiceCopy(compactText, locale);
  return sanitized === compactText ? richText : sanitized;
}

function getDefaultToolLabel(type: ToolType, locale: Locale) {
  if (locale === "en") {
    if (type === "online") return "AI Account Service";
    if (type === "skill_learning") return "AI Skill Course";
    return "AI Software App";
  }

  if (type === "online") return "AI账号服务";
  if (type === "skill_learning") return "AI技能课程";
  return "AI软件应用";
}

function getEnglishSentenceToolLabel(type: ToolType) {
  if (type === "online") return "AI account service";
  if (type === "skill_learning") return "AI skill course";
  return "AI software app";
}

function hasCjk(value: string) {
  return cjkPattern.test(value);
}

function countLatinWords(value: string) {
  return value.match(latinWordPattern)?.length ?? 0;
}

function isEnglishLike(value: string, minimumWords = 2) {
  const normalized = normalizeText(value);
  if (!normalized) return false;

  const latinWords = countLatinWords(normalized);
  if (latinWords < minimumWords) return false;

  const hasMeaningfulCjk = hasCjk(normalized);
  if (!hasMeaningfulCjk) return true;

  const cjkChars = normalized.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const latinChars = normalized.match(/[A-Za-z]/g)?.length ?? 0;
  return latinChars > cjkChars * 2;
}

function isLocalizedEnglishCopy(value: string, minimumWords = 2) {
  const normalized = normalizeText(value);
  return (
    Boolean(normalized) &&
    !hasCjk(normalized) &&
    isEnglishLike(normalized, minimumWords)
  );
}

function isPromotionalName(value: string) {
  const normalized = normalizeText(value);
  return normalized.length > 26 || /[，。,.;；!?！？]/.test(normalized);
}

function hasAccountServiceRiskCopy(value: string | null | undefined) {
  const normalized = normalizeText(value);
  return (
    Boolean(normalized) &&
    (sanitizeAccountServiceCopy(normalized, "zh") !== normalized ||
      hasAccountServiceRiskTerms(normalized))
  );
}

function hasAccountServiceCategoryRisk(value: string | null | undefined) {
  const normalized = normalizeText(value);
  return (
    /账号购买|账号代充|代充|官方代充|低价|永久可用|共享账号|破解|绕过限制|保证不封号|黑卡|免风控/i.test(
      normalized,
    ) || hasAccountServiceRiskTerms(normalized)
  );
}

function extractAccountServiceProductName(
  value: string | null | undefined,
  fallback: string,
) {
  const normalized = normalizeText(value);
  const productMatch = normalized.match(
    /(?:ChatGPT|Gemini|Claude|Midjourney|OpenAI|Google AI|Perplexity|Sora|Runway|Kling|Grok)(?:\s+(?:Plus|Pro|Team|Enterprise|API|Studio|Ultra|Max|Advanced|AI|Google AI Pro|3 Flash))*|[A-Za-z][A-Za-z0-9.+-]*(?:\s+[A-Za-z0-9.+-]+){0,3}/i,
  );
  const productName = normalizeText(productMatch?.[0] ?? "");
  return productName || fallback;
}

function sanitizeAccountServiceName(
  value: string | null | undefined,
  locale: Locale,
  fallback: string,
) {
  const normalized = normalizeText(value);
  if (!normalized) return fallback;
  if (!hasAccountServiceRiskCopy(normalized)) return normalized;

  if (locale === "en") {
    return `${extractAccountServiceProductName(normalized, "AI")} account service guidance`;
  }

  return `${extractAccountServiceProductName(normalized, "AI工具")} AI账号服务咨询`;
}

function humanizeSlugWord(word: string) {
  const lower = word.toLowerCase();
  return (
    englishWordOverrides[lower] ??
    `${lower.slice(0, 1).toUpperCase()}${lower.slice(1)}`
  );
}

function humanizeSlug(slug: string) {
  const normalized = normalizeText(slug).replace(/^\/+|\/+$/g, "");
  if (
    !normalized ||
    generatedSlugPatterns.some((pattern) => pattern.test(normalized)) ||
    /\d{8,}/.test(normalized)
  ) {
    return "";
  }

  const parts = normalized.split("-").filter(Boolean);
  if (!parts.length || parts.some((part) => part.length > 24)) return "";

  return parts.map(humanizeSlugWord).join(" ");
}

function buildEnglishCategoryFromChinese(name: string, type: ToolType) {
  if (!name) return getDefaultToolLabel(type, "en");
  if (name.includes("自动化")) return "Automation Software";
  if (name.includes("电脑软件") || name.includes("桌面"))
    return "AI Desktop Software";
  if (name.includes("在线处理")) return "Online Processing";
  if (name.includes("账号购买")) return "AI Account Service";
  if (name.includes("代充")) return "AI Account Service";
  if (name.includes("在线") && name.includes("工具")) return "Online AI Tool";
  if (name.includes("视频")) return "AI Video Tool";
  if (name.includes("音频") || name.includes("语音")) return "AI Audio Tool";
  if (name.includes("课程") || name.includes("学习")) return "AI Skill Course";
  if (name.includes("实用")) return "Everyday AI Tool";
  return getDefaultToolLabel(type, "en");
}

function buildEnglishTagFromChinese(name: string) {
  if (!name) return "";
  if (name.includes("效率") || name.includes("办公")) return "Productivity";
  if (name.includes("自动化")) return "Automation";
  if (name.includes("写作") || name.includes("文案")) return "Writing";
  if (name.includes("运营")) return "Operations";
  if (name.includes("内容")) return "Content Creation";
  if (name.includes("视频")) return "Video";
  if (name.includes("图片") || name.includes("绘图") || name.includes("设计"))
    return "Image & Design";
  if (name.includes("语音") || name.includes("音频")) return "Audio";
  if (name.includes("账号")) return "Account Service";
  if (name.includes("课程") || name.includes("学习")) return "Learning";
  if (name.includes("代码") || name.includes("编程")) return "Coding";
  return "";
}

export function resolveLocalizedToolCategoryName(
  name: string | null | undefined,
  type: ToolType,
  locale: Locale,
) {
  const normalized = normalizeText(name);
  if (!normalized) return getDefaultToolLabel(type, locale);
  if (locale === "zh") {
    if (type === "online" && hasAccountServiceCategoryRisk(normalized))
      return "AI账号服务咨询";
    if (type === "online" && hasAccountServiceRiskCopy(normalized))
      return "AI账号服务咨询";
    return normalized;
  }
  if (!hasCjk(normalized) && isEnglishLike(normalized, 1)) return normalized;
  return buildEnglishCategoryFromChinese(normalized, type);
}

export function resolveLocalizedToolTagName(
  name: string | null | undefined,
  locale: Locale,
) {
  const normalized = normalizeText(name);
  if (!normalized) return "";
  if (locale === "zh") return normalized;
  if (!hasCjk(normalized) && isEnglishLike(normalized, 1)) return normalized;
  return buildEnglishTagFromChinese(normalized);
}

export function buildLocalizedToolTagItems(
  tagLinks: LocalizedTagInput[],
  locale: Locale,
) {
  return tagLinks
    .map(({ tag }) => ({
      id: tag.id,
      name: resolveLocalizedToolTagName(tag.name, locale),
    }))
    .filter((tag) => tag.name);
}

export function resolveLocalizedToolIdentity(
  tool: Pick<LocalizedToolInput, "slug" | "name" | "englishName" | "type">,
  locale: Locale,
) {
  const localizedFallbackName = getDefaultToolLabel(tool.type, locale);
  const name = normalizeText(tool.name);
  const englishName = normalizeText(tool.englishName);

  if (locale === "zh") {
    const primaryName =
      tool.type === "online"
        ? sanitizeAccountServiceName(
            name || englishName,
            "zh",
            localizedFallbackName,
          )
        : name || englishName || localizedFallbackName;
    const secondaryCandidate =
      englishName && englishName.toLowerCase() !== primaryName.toLowerCase()
        ? englishName
        : "";
    return {
      primaryName,
      secondaryName:
        tool.type === "online" && hasAccountServiceRiskCopy(secondaryCandidate)
          ? ""
          : secondaryCandidate,
    };
  }

  if (englishName && isEnglishLike(englishName, 1)) {
    const primaryName =
      tool.type === "online"
        ? sanitizeAccountServiceName(englishName, "en", localizedFallbackName)
        : englishName;
    const secondaryCandidate =
      name && name.toLowerCase() !== primaryName.toLowerCase() ? name : "";
    return {
      primaryName,
      secondaryName:
        tool.type === "online" && hasAccountServiceRiskCopy(secondaryCandidate)
          ? ""
          : secondaryCandidate,
    };
  }

  if (name && isEnglishLike(name, 1) && !isPromotionalName(name)) {
    return {
      primaryName:
        tool.type === "online"
          ? sanitizeAccountServiceName(name, "en", localizedFallbackName)
          : name,
      secondaryName: "",
    };
  }

  const humanizedSlug = humanizeSlug(tool.slug);
  if (humanizedSlug) {
    return {
      primaryName: humanizedSlug,
      secondaryName:
        name && name.toLowerCase() !== humanizedSlug.toLowerCase() ? name : "",
    };
  }

  return {
    primaryName: localizedFallbackName,
    secondaryName:
      name && name.toLowerCase() !== localizedFallbackName.toLowerCase()
        ? name
        : "",
  };
}

function buildEnglishToolSentence(tool: LocalizedToolInput) {
  const localizedTool = resolveLocalizedToolIdentity(tool, "en");
  const categoryName = resolveLocalizedToolCategoryName(
    tool.categoryName,
    tool.type,
    "en",
  );
  const defaultLabel = getDefaultToolLabel(tool.type, "en");
  const primaryIsGeneric = localizedTool.primaryName === defaultLabel;
  const categoryIsGeneric = categoryName === defaultLabel;

  if (primaryIsGeneric && categoryIsGeneric) {
    if (tool.type === "online") {
      return "Review pricing, delivery notes, and access guidance for this AI account service on ENHE AI.";
    }

    if (tool.type === "skill_learning") {
      return "Review learning access, lesson structure, and current availability for this AI skill course on ENHE AI.";
    }

    return "Review pricing, version details, and download access for this AI software app on ENHE AI.";
  }

  if (tool.type === "online") {
    if (categoryIsGeneric) {
      return `${localizedTool.primaryName} is an AI account service. Review pricing, delivery notes, and access guidance on ENHE AI.`;
    }

    return `${localizedTool.primaryName} is an AI account service in ${categoryName.toLowerCase()}. Review pricing, delivery notes, and access guidance on ENHE AI.`;
  }

  if (tool.type === "skill_learning") {
    if (categoryIsGeneric) {
      return `${localizedTool.primaryName} is an AI skill course. Review learning access, lesson structure, and current availability on ENHE AI.`;
    }

    return `${localizedTool.primaryName} is an AI skill course for ${categoryName.toLowerCase()}. Review learning access, lesson structure, and current availability on ENHE AI.`;
  }

  if (categoryIsGeneric) {
    return `${localizedTool.primaryName} is an AI software app. Review pricing, version details, and download access on ENHE AI.`;
  }

  return `${localizedTool.primaryName} is an AI software app in ${categoryName.toLowerCase()}. Review pricing, version details, and download access on ENHE AI.`;
}

export function buildLocalizedToolSummary(
  tool: LocalizedToolInput,
  locale: Locale,
) {
  const shortDescription = normalizeText(tool.shortDescription);
  if (locale === "zh")
    return tool.type === "online"
      ? sanitizeAccountServiceCopy(shortDescription, "zh")
      : shortDescription;
  if (isLocalizedEnglishCopy(shortDescription, 4)) return shortDescription;
  return buildEnglishToolSentence(tool);
}

export function buildLocalizedToolLongContent(
  tool: LocalizedToolInput,
  locale: Locale,
) {
  const content = normalizeRichText(tool.content);
  if (locale === "zh")
    return tool.type === "online"
      ? sanitizeAccountServiceRichCopy(content || tool.shortDescription, "zh")
      : content;
  if (isLocalizedEnglishCopy(content, 8)) return content;

  const summary = buildLocalizedToolSummary(tool, locale);
  return [
    summary,
    "This English page gives readers the core overview, access guidance, workflow context, and support guidance needed to evaluate the tool quickly.",
  ].join(" ");
}

export function shouldIndexEnglishToolPage(
  tool: Pick<
    LocalizedToolInput,
    "slug" | "name" | "englishName" | "shortDescription" | "content" | "type"
  >,
) {
  const localizedIdentity = resolveLocalizedToolIdentity(tool, "en");
  const localizedSummary = buildLocalizedToolSummary(tool, "en");
  const localizedContent = buildLocalizedToolLongContent(tool, "en");
  const defaultLabel = getDefaultToolLabel(tool.type, "en");
  const englishName = normalizeText(tool.englishName);
  const hasReadableEnglishName =
    localizedIdentity.primaryName !== defaultLabel ||
    isEnglishLike(englishName, 1);

  return (
    hasReadableEnglishName &&
    Boolean(englishName) &&
    isLocalizedEnglishCopy(localizedSummary, 6) &&
    isLocalizedEnglishCopy(localizedContent, 12)
  );
}

export function isVisibleInEnglishContent(
  value: string | null | undefined,
  minimumWords = 3,
) {
  return isLocalizedEnglishCopy(value ?? "", minimumWords);
}

export function buildLocalizedToolMetaHeading(
  tool: Pick<LocalizedToolInput, "slug" | "name" | "englishName" | "type">,
  locale: Locale,
) {
  const localizedTool = resolveLocalizedToolIdentity(tool, locale);
  const defaultToolLabel = getDefaultToolLabel(tool.type, locale);

  if (locale === "en") {
    return localizedTool.primaryName === defaultToolLabel
      ? defaultToolLabel
      : `${localizedTool.primaryName} - ${defaultToolLabel}`;
  }

  return localizedTool.primaryName;
}

export function buildLocalizedToolMetaDescription(
  tool: LocalizedToolInput,
  locale: Locale,
) {
  if (locale === "zh") {
    const description =
      normalizeText(tool.shortDescription) || normalizeText(tool.content);
    return tool.type === "online"
      ? sanitizeAccountServiceCopy(description, "zh")
      : description;
  }

  return buildLocalizedToolSummary(tool, "en");
}

export function buildLocalizedToolPreviewText(
  tool: LocalizedToolInput,
  locale: Locale,
) {
  if (locale === "zh") {
    const preview = normalizeText(tool.shortDescription);
    return tool.type === "online"
      ? sanitizeAccountServiceCopy(preview, "zh")
      : preview;
  }

  const summary = buildLocalizedToolSummary(tool, "en");
  return summary.split(sentenceBreakPattern).find(Boolean)?.trim() ?? summary;
}

export function buildLocalizedToolOfferName(
  name: string | null | undefined,
  type: ToolType,
  locale: Locale,
  index: number,
) {
  const normalized = normalizeText(name);
  if (locale === "zh") {
    if (type === "online" && hasAccountServiceRiskCopy(normalized))
      return `AI账号服务咨询方案 ${index + 1}`;
    return normalized;
  }
  if (type === "online" && hasAccountServiceRiskCopy(normalized))
    return `Service option ${index + 1}`;
  if (isEnglishLike(normalized, 1) && !hasCjk(normalized)) return normalized;

  if (type === "skill_learning") return `Course option ${index + 1}`;
  if (type === "software") return `Download option ${index + 1}`;
  return `Service option ${index + 1}`;
}

function buildEnglishFaqFallback(
  tool: LocalizedToolInput,
): LocalizedFaqInput[] {
  const summary = buildLocalizedToolSummary(tool, "en");
  const typeLabel = getEnglishSentenceToolLabel(tool.type);

  return [
    {
      id: "localized-faq-overview",
      question: `What is this ${typeLabel} for?`,
      answer: summary,
    },
    {
      id: "localized-faq-access",
      question: "How do I access it after purchase?",
      answer:
        tool.type === "software"
          ? "After payment review, the related download-link content becomes available in your account center."
          : tool.type === "skill_learning"
            ? "After purchase, the course content and practical learning materials become available in your account center."
            : "After purchase, the service access details become available in your account center.",
    },
  ];
}

function buildChineseFaqFallback(
  tool: LocalizedToolInput,
): LocalizedFaqInput[] {
  if (tool.type === "online") {
    return [
      {
        id: "localized-faq-service-scope",
        question: "这项AI账号服务主要提供什么支持？",
        answer:
          "该服务主要提供AI工具订阅与账号使用支持、访问建议、交付说明和售后边界说明。使用前请遵守对应平台规则；如涉及第三方平台，请以官方政策为准。",
      },
      {
        id: "localized-faq-compliance",
        question: "使用账号服务时需要注意什么？",
        answer:
          "请按对应平台规则合规使用，不承诺绕过平台限制，也不保证第三方平台政策长期不变。遇到访问、订阅或使用问题时，可联系ENHE AI客服获取使用建议。",
      },
    ];
  }

  if (tool.type === "skill_learning") {
    return [
      {
        id: "localized-faq-course-access",
        question: "购买课程后如何学习？",
        answer:
          "完成购买并通过审核后，可在用户中心查看课程内容、学习资料和相关使用说明。",
      },
      {
        id: "localized-faq-course-fit",
        question: "课程适合什么用户？",
        answer:
          "课程适合希望系统学习AI工具、提示词、自动化流程和实战方法的用户。建议先阅读课程介绍和目录，再决定是否购买。",
      },
    ];
  }

  return [
    {
      id: "localized-faq-software-access",
      question: "购买软件后如何获取下载内容？",
      answer:
        "完成购买并通过审核后，可在用户中心查看对应软件的下载链接、版本信息和使用说明。",
    },
    {
      id: "localized-faq-software-requirements",
      question: "使用前需要确认什么？",
      answer:
        "请先查看系统要求、版本记录、工具介绍和使用教程，确认软件适合你的设备环境和工作流程。",
    },
  ];
}

export function buildLocalizedToolFaqItems(
  faqs: LocalizedFaqInput[],
  tool: LocalizedToolInput,
  locale: Locale,
) {
  if (locale === "zh") {
    if (!faqs.length) return buildChineseFaqFallback(tool);
    if (tool.type !== "online") return faqs;

    return faqs.map((faq) => ({
      ...faq,
      answer: sanitizeAccountServiceCopy(faq.answer, "zh"),
    }));
  }

  const localizedFaqs = faqs.filter(
    (faq) =>
      isVisibleInEnglishContent(faq.question, 2) &&
      isVisibleInEnglishContent(faq.answer, 5),
  );

  return localizedFaqs.length ? localizedFaqs : buildEnglishFaqFallback(tool);
}

function buildEnglishTutorialFallback(
  tool: LocalizedToolInput,
): LocalizedTutorialInput[] {
  const summary = buildLocalizedToolSummary(tool, "en");
  const accessText =
    tool.type === "software"
      ? "Check the version, system requirements, price, and download access before using it in your workflow."
      : tool.type === "skill_learning"
        ? "Check the course scope, purchase status, and lesson access before starting the learning path."
        : "Check the pricing, delivery notes, and account access details before using the service.";

  return [
    {
      id: "localized-tutorial-access",
      title: "Access and usage guide",
      content: `${summary} ${accessText}`,
      notes: null,
      commonErrors: null,
      videoUrl: null,
    },
  ];
}

export function buildLocalizedToolTutorialItems(
  tutorials: LocalizedTutorialInput[],
  tool: LocalizedToolInput,
  locale: Locale,
) {
  if (locale === "zh") return tutorials;

  const localizedTutorials = tutorials.filter(
    (tutorial) =>
      isVisibleInEnglishContent(tutorial.title, 2) &&
      isVisibleInEnglishContent(tutorial.content, 6),
  );

  return localizedTutorials.length
    ? localizedTutorials
    : buildEnglishTutorialFallback(tool);
}
