import type { Metadata } from "next";
import type { Locale } from "@/lib/dictionaries";
import { localeSwitchQueryName } from "@/lib/locale-routing";

export const fallbackSiteBaseUrl = "https://www.enhe-tech.com.cn";
export const siteName = "ENHE AI";
export const defaultSiteDescription =
  "ENHE AI helps users apply AI to real tasks: work faster, create content, organize material, learn skills, and choose safer AI paths.";
export const defaultBrandIcon = "/images/brand/enhe-icon-gradient-white-bg-cropped.png";
export const defaultOgImage = "/images/brand/enhe-icon-gradient-transparent-cropped.png";

type PageMetadataInput = {
  title: string;
  description?: string | null;
  path?: string;
  image?: string | null;
  locale?: "zh_CN" | "en_US";
  type?: "website" | "article";
  localeKey?: Locale;
  languageAlternates?: Record<string, string>;
};

type MetadataTitleInput = {
  pageTitle: string;
  brand?: string;
  maxLength?: number;
};

type BuildTitleInput = {
  name: string;
  englishName?: string | null;
  brand?: string;
  maxLength?: number;
  locale?: Locale;
};

type ToolMetaDescriptionInput = {
  name: string;
  englishName?: string | null;
  description?: string | null;
  brand?: string;
  locale?: Locale;
  type?: "software" | "online" | "skill_learning";
  maxLength?: number;
};

export type ListingMetadataKind =
  | "software"
  | "account-services"
  | "skill-learning"
  | "ai-news"
  | "pricing"
  | "tutorials";

type TopicMetaDescriptionInput = {
  title: string;
  description?: string | null;
  locale: Locale;
  kind?: "ai-topic" | "ai-news-topic";
  maxLength?: number;
};

type OrganizationSchemaInput = {
  name: string;
  logo?: string | null;
  url?: string;
  description?: string | null;
  sameAs?: string[];
  contactPoint?: {
    email: string;
    contactType?: string;
    availableLanguage?: string[];
  } | null;
  schemaType?: "Organization";
};

type WebSiteSchemaInput = {
  name: string;
  description?: string | null;
  url?: string;
  inLanguage?: string;
  searchPathTemplate?: string | null;
  schemaType?: "WebSite";
};

export type BreadcrumbItem = {
  name: string;
  path: string;
};

type BreadcrumbSchemaInput = {
  items: BreadcrumbItem[];
  schemaType?: "BreadcrumbList";
};

type FaqSchemaInput = {
  items: ReadonlyArray<{
    question: string;
    answer: string;
  }>;
  schemaType?: "FAQPage";
};

type OfferSpecInput = {
  name: string;
  price: number;
};

type ToolStructuredDataInput = {
  schemaType: "SoftwareApplication" | "Service" | "Course";
  name: string;
  description?: string | null;
  url: string;
  image?: string | null;
  brand?: string;
  category?: string | null;
  operatingSystem?: string | null;
  locale?: string;
  price?: number | null;
  currency?: string;
  softwareVersion?: string | null;
  priceSpecs?: OfferSpecInput[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  } | null;
};

type ProductStructuredDataInput = {
  name: string;
  description?: string | null;
  url: string;
  image?: string | null;
  brand?: string;
  category?: string | null;
  price?: number | null;
  currency?: string;
  priceSpecs?: OfferSpecInput[];
};

export function getSiteBaseUrl() {
  return (
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    fallbackSiteBaseUrl
  ).replace(/\/+$/, "");
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${getSiteBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function stripLocalePrefix(path: string) {
  if (!path || path === "/") return "/";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized === "/en"
    ? "/"
    : normalized.replace(/^\/en(?=\/|$)/, "") || "/";
}

export function buildLocalePath(path: string, locale: Locale) {
  const normalized = stripLocalePrefix(path);
  if (/^\/(?:admin|orders)(?:\/|$)/.test(normalized)) {
    return normalized;
  }
  if (locale === "en") {
    return normalized === "/" ? "/en" : `/en${normalized}`;
  }
  return normalized;
}

const localizedPublicRoutePatterns = [
  /^\/$/,
  /^\/login$/,
  /^\/register$/,
  /^\/user$/,
  /^\/about$/,
  /^\/build-your-own-x$/,
  /^\/ai-topics$/,
  /^\/ai-topics\/.+$/,
  /^\/software$/,
  /^\/software\/.+$/,
  /^\/account-services$/,
  /^\/account-services\/.+$/,
  /^\/skill-learning$/,
  /^\/skill-learning\/.+$/,
  /^\/product-paths\/.+$/,
  /^\/product-demos$/,
  /^\/product-demos\/.+$/,
  /^\/ai-news$/,
  /^\/ai-news\/.+$/,
  /^\/ai-news\/topics\/.+$/,
  /^\/ai-trends$/,
  /^\/ai-trends\/daily$/,
  /^\/ai-trends\/daily\/.+$/,
  /^\/pricing$/,
  /^\/tutorials$/,
  /^\/tools\/.+$/,
  /^\/legal\/.+$/,
] as const;

export function isLocalizedPublicPath(path: string) {
  const normalized = stripLocalePrefix(path);
  return localizedPublicRoutePatterns.some((pattern) =>
    pattern.test(normalized),
  );
}

export function buildLanguageSwitcherHref(path: string, locale: Locale) {
  const normalized = stripLocalePrefix(path);
  const withLocaleSwitch = (href: string) =>
    `${href}${href.includes("?") ? "&" : "?"}${localeSwitchQueryName}=${locale}`;

  if (/^\/(?:admin|orders)(?:\/|$)/.test(normalized)) {
    return withLocaleSwitch(normalized);
  }

  if (!isLocalizedPublicPath(path)) {
    return withLocaleSwitch(buildLocalePath("/", locale));
  }

  return buildLocalePath(path, locale);
}

export function buildLanguageAlternates(path = "/") {
  return {
    "x-default": absoluteUrl(stripLocalePrefix(path)),
    "zh-CN": absoluteUrl(buildLocalePath(path, "zh")),
    "en-US": absoluteUrl(buildLocalePath(path, "en")),
  } as const;
}

export function buildAvailableLanguageAlternates(
  path = "/",
  locales: Locale[] = ["zh", "en"],
) {
  const normalized = stripLocalePrefix(path);
  return {
    "x-default": absoluteUrl(normalized),
    ...(locales.includes("zh")
      ? { "zh-CN": absoluteUrl(buildLocalePath(normalized, "zh")) }
      : {}),
    ...(locales.includes("en")
      ? { "en-US": absoluteUrl(buildLocalePath(normalized, "en")) }
      : {}),
  };
}

export function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function truncateText(value: string, maxLength: number) {
  const normalized = normalizeWhitespace(value);
  if (normalized.length <= maxLength) return normalized;
  if (maxLength <= 3) return ".".repeat(Math.max(1, maxLength));
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

export function truncateDescription(value: string, maxLength = 160) {
  return truncateText(value, maxLength);
}

export function buildMetaDescription(
  value: string | null | undefined,
  fallback = defaultSiteDescription,
  maxLength = 160,
) {
  const preferred = normalizeWhitespace(value ?? "");
  const fallbackValue = normalizeWhitespace(fallback);
  return truncateDescription(preferred || fallbackValue, maxLength);
}

export function buildMetadataTitle({
  pageTitle,
  brand = siteName,
  maxLength = 68,
}: MetadataTitleInput) {
  const normalizedPageTitle = normalizeWhitespace(pageTitle);
  const normalizedBrand = normalizeWhitespace(brand);
  const pageTitleLower = normalizedPageTitle.toLowerCase();
  const brandLower = normalizedBrand.toLowerCase();

  if (!normalizedPageTitle) return normalizedBrand;
  if (pageTitleLower === brandLower) return normalizedBrand;
  if (brandLower.includes(pageTitleLower)) return normalizedBrand;

  for (const separator of [" | ", " - ", " — ", " – "]) {
    const brandSuffix = `${separator}${normalizedBrand}`.toLowerCase();
    if (pageTitleLower.endsWith(brandSuffix)) {
      const baseTitle = normalizedPageTitle
        .slice(
          0,
          normalizedPageTitle.length -
            separator.length -
            normalizedBrand.length,
        )
        .trim();
      return baseTitle ? `${baseTitle} | ${normalizedBrand}` : normalizedBrand;
    }
  }

  if (pageTitleLower.includes(brandLower)) {
    return normalizedPageTitle;
  }

  const fullTitle = `${normalizedPageTitle} | ${normalizedBrand}`;
  if (fullTitle.length <= maxLength) return fullTitle;

  const reservedLength = ` | ${normalizedBrand}`.length;
  return `${truncateText(normalizedPageTitle, Math.max(12, maxLength - reservedLength))} | ${normalizedBrand}`;
}

export function buildListingMetadataTitle(
  kind: ListingMetadataKind,
  locale: Locale,
  brand = siteName,
) {
  const zhTitles: Record<ListingMetadataKind, string> = {
    software: "提升工作效率产品、办公效率工具与AI电脑软件",
    "account-services": "生成图片/视频/音频产品、AI视频图片音频工具",
    "skill-learning": "改变你未来的AI产品、智能体提示词与副业变现",
    "ai-news": "AI资讯、趋势解读与工具落地指南",
    pricing: "AI工具报价、购买流程与交付说明",
    tutorials: "AI工具教程、软件配置与使用指南",
  };
  const enTitles: Record<ListingMetadataKind, string> = {
    software: "Boost Productivity Products And AI Desktop Tools",
    "account-services": "Generate Images Video Audio And AI Media Tools",
    "skill-learning": "Change Your AI Future Products And AI Agents",
    "ai-news": "AI News, Trend Insights, and Tool Decisions",
    pricing: "AI Tool Pricing, Purchase, and Delivery Guide",
    tutorials: "AI Tool Tutorials, Setup, and Workflow Guides",
  };

  return buildMetadataTitle({
    pageTitle: locale === "en" ? enTitles[kind] : zhTitles[kind],
    brand,
    maxLength: 68,
  });
}

export function buildHomeMetadataTitle(locale: Locale, brand = siteName) {
  const scope =
    locale === "en"
      ? "Real Tasks, Safer AI Workflows"
      : "让 AI 真正为每个人所用，把复杂变简单，把效率变价值。";
  return truncateText(
    `${normalizeWhitespace(brand)} | ${scope}`,
    locale === "en" ? 62 : 64,
  );
}

export function buildHomeMetaDescription(
  locale: Locale,
  customIntro?: string | null,
) {
  const intro = normalizeWhitespace(customIntro ?? "");
  const defaultBrandSentence = normalizeWhitespace(defaultSiteDescription);
  const shouldUseTemplate =
    !intro ||
    intro === defaultBrandSentence ||
    intro.length < (locale === "en" ? 100 : 50);

  if (!shouldUseTemplate) {
    return buildMetaDescription(
      intro,
      defaultSiteDescription,
      locale === "en" ? 155 : 150,
    );
  }

  if (locale === "en") {
    return "ENHE AI helps users apply AI to real tasks: work faster, create content, organize material, learn skills, choose tools, and keep privacy clearer.";
  }

  return "ENHE AI 帮助用户把 AI 用到真实任务里：更快完成工作、创作内容、整理资料、学习技能和解决工具选择问题；需要处理敏感素材、长期流程或隐私边界时，优先提供安全、隐私和稳定的可控 AI 路径。";
}

export function buildListingMetaDescription(
  kind: ListingMetadataKind,
  locale: Locale,
) {
  const zhDescriptions = {
    software:
      "按办公效率工具、文件处理工具、系统实用工具、数据分析工具、提升效率和AI电脑软件分类查找产品，比较价格、教程、交付方式和适用场景，先确认能否提升日常工作效率再下载或购买，减少重复步骤和试错时间。",
    "account-services":
      "按AI视频工具、AI图片工具、AI音频工具、视频生成、语音生成和视频/图片处理分类查找产品，比较输出质量、导出格式、处理速度、价格边界和教程，先确认适合你的多媒体内容流程再使用，并确认商用边界。",
    "skill-learning":
      "按AI智能体、生活实用AI工具、智能体、账号订购、升级订阅、AI提示词和AI副业变现分类查找产品，比较交付价值、风险边界、复用能力和教程说明，把AI能力沉淀为长期机会，持续复用成果。",
    "ai-news":
      "阅读AI前沿资讯和趋势解读，理解工具、模型和平台变化对工作效率、内容创作、资料整理、学习技能和安全使用的实际影响。结合来源、时间、相关工具和下一步行动，判断这条信息是否值得普通AI用户跟进。",
    pricing:
      "查看ENHE AI软件、课程与账号服务报价结构、购买流程、权益说明、支付审核、交付方式、售后边界、退款规则、适合人群和服务范围，购买前先确认价格、使用方式、交付条件、风险提醒和是否适合当前任务。",
    tutorials:
      "阅读ENHE AI工具教程、软件使用指南、AI技能实战步骤、常见问题和工作流案例，快速掌握下载、配置、使用和复盘方法，把工具能力转化为可执行成果，减少购买、部署或学习前的试错时间成本。",
  } as const;
  const enDescriptions = {
    software:
      "Find AI software for office productivity, file processing, system utilities, data analysis, productivity gains, and AI desktop workflows. Compare fit.",
    "account-services":
      "Find AI video, image, and audio tools for video generation, voice generation, and media processing. Compare output quality, exports, price, and fit.",
    "skill-learning":
      "Find AI agents, everyday AI tools, subscriptions, upgrade plans, AI prompts, and AI side-income products. Compare value, risk, reuse, and tutorials.",
    "ai-news":
      "Follow global AI agents, open models, local deployment, AI tools, tutorials, and industry trends so creators can turn AI changes into productivity.",
    pricing:
      "Review ENHE AI software, course, and account service pricing, payment review, delivery boundaries, support scope, and refund rules before purchase.",
    tutorials:
      "Read ENHE AI tutorials, software guides, workflow steps, setup notes, and troubleshooting tips to turn AI tools into repeatable creator outcomes.",
  } as const;

  return locale === "en" ? enDescriptions[kind] : zhDescriptions[kind];
}

export function buildTopicMetaDescription({
  title,
  description,
  locale,
  kind = "ai-topic",
  maxLength = 150,
}: TopicMetaDescriptionInput) {
  const normalizedDescription = normalizeWhitespace(description ?? "");
  const normalizedTitle = normalizeWhitespace(title);
  const minLength = locale === "en" ? 110 : 80;

  if (normalizedDescription.length >= minLength) {
    return buildMetaDescription(normalizedDescription, defaultSiteDescription, maxLength);
  }

  const fallbackSource =
    normalizedDescription ||
    (locale === "en"
      ? `${normalizedTitle || "AI topic"} guide.`
      : `${normalizedTitle || "AI主题"}指南。`);

  if (locale === "en") {
    const suffix =
      kind === "ai-news-topic"
        ? "On ENHE AI, review sources, dates, related news, tools, tutorials, and next steps so everyday AI users can judge the practical impact."
        : "On ENHE AI, review use cases, decision criteria, FAQs, related tools, courses, and next steps before choosing a practical AI workflow.";

    return buildMetaDescription(`${fallbackSource} ${suffix}`, defaultSiteDescription, maxLength);
  }

  const suffix =
    kind === "ai-news-topic"
      ? "在 ENHE AI 查看来源、时间、相关资讯、工具、教程和下一步行动建议，判断它对工作效率、内容创作、学习或账号合规是否有影响。"
      : "在 ENHE AI 查看适用场景、对比维度、常见问题、相关工具、课程和下一步路径，先判断它是否能解决当前工作、创作或学习任务。";

  return buildMetaDescription(`${fallbackSource} ${suffix}`, defaultSiteDescription, maxLength);
}

const accountServiceRiskWords =
  /(账号购买|账号代充|代充需求|官方代充|低价稳定|永久可用|共享账号|破解|绕过限制|保证不封号|黑卡|免风控)/i;

const accountServiceRiskTermPatterns = [
  /\u5b98\u65b9\u4ee3\u5145/i,
  /\u4ee3\u5145(?:\u9700\u6c42|\u670d\u52a1|\u5957\u9910)?/i,
  /\u5145\u503c/i,
  /\u4f4e\u4ef7(?:\u7a33\u5b9a)?/i,
  /\u7a33\u5b9a(?:\u6536\u53d1|\u4f7f\u7528|\u53ef\u7528|\u4f1a\u5458)?/i,
  /\u6c38\u4e45\u53ef\u7528/i,
  /\u5171\u4eab\u8d26\u53f7/i,
  /\u5171\u4eab/i,
  /\u72ec\u4eab\u8d26\u53f7/i,
  /\u72ec\u4eab/i,
  /\u7834\u89e3/i,
  /\u7ed5\u8fc7\u9650\u5236/i,
  /\u4fdd\u8bc1\u4e0d\u5c01\u53f7/i,
  /\u4e0d\u5c01\u53f7/i,
  /\u9ed1\u5361/i,
  /\u514d\u98ce\u63a7/i,
  /\u8d28\u4fdd/i,
  /\u6210\u54c1\u53f7/i,
  /\u5b66\u751f\u53f7/i,
  /\u975e\u5b66\u751f/i,
  /\u4fdd\u53f7/i,
  /\u5b98\u65b9\s*(?:Gemini|ChatGPT|Claude|OpenAI|Google|Gmail|Perplexity|Sora|Midjourney|AI|\u8d26\u53f7)/i,
  /official\s+(?:account|recharge|top[-\s]?up|subscription)/i,
  /exclusive\s+account/i,
  /shared\s+account/i,
  /cracked|bypass|black\s*card|no\s*ban|guaranteed|warranty\s+included|stable\s+membership/i,
  /top[-\s]?up|recharge/i,
] as const;

const safeZhAccountServiceCopy =
  "AI\u5de5\u5177\u8ba2\u9605\u4e0e\u8d26\u53f7\u4f7f\u7528\u652f\u6301\uff0c\u63d0\u4f9b\u8ba2\u9605\u54a8\u8be2\u3001\u8d26\u53f7\u4f7f\u7528\u5efa\u8bae\u3001\u4ea4\u4ed8\u8bf4\u660e\u4e0e\u552e\u540e\u8fb9\u754c\u3002\u4f7f\u7528\u524d\u8bf7\u9075\u5b88\u5bf9\u5e94\u5e73\u53f0\u89c4\u5219\uff1b\u5982\u6d89\u53ca\u7b2c\u4e09\u65b9\u5e73\u53f0\uff0c\u8bf7\u4ee5\u5b98\u65b9\u653f\u7b56\u4e3a\u51c6\u3002";
const safeEnAccountServiceCopy =
  "AI tool subscription and account usage support with access guidance, delivery notes, and compliance reminders. Please follow the rules of each platform; for third-party services, the official policy should prevail.";

export function hasAccountServiceRiskTerms(value: string | null | undefined) {
  const normalized = normalizeWhitespace(value ?? "");
  return (
    Boolean(normalized) &&
    accountServiceRiskTermPatterns.some((pattern) => pattern.test(normalized))
  );
}

export function sanitizeAccountServiceCopy(
  value: string | null | undefined,
  locale: Locale = "zh",
) {
  const normalized = normalizeWhitespace(value ?? "");
  const riskyPattern =
    /(官方代充|代充需求|代充|低价稳定|永久可用|共享账号|破解|绕过限制|保证不封号|黑卡|免风控|无封号|掉订阅|账号\s*\+\s*密码|提供账号|充值|recharge|shared account|cracked|bypass|black card|no ban|guaranteed|质保|成品号|非学生|学生号|学生|保号|售后保障|membership access|warranty included|stable membership)/i;

  if (!normalized) return "";
  if (
    !riskyPattern.test(normalized) &&
    !accountServiceRiskWords.test(normalized) &&
    !hasAccountServiceRiskTerms(normalized)
  )
    return normalized;

  if (locale === "en") {
    return safeEnAccountServiceCopy;
  }

  return safeZhAccountServiceCopy;
}

function isGenericAccountServiceMetaDescription(
  value: string,
  locale: Locale,
) {
  if (locale === "en") {
    return (
      value === safeEnAccountServiceCopy ||
      /^AI tool subscription and account usage support\b/i.test(value)
    );
  }

  return (
    value === safeZhAccountServiceCopy ||
    (value.includes("\u8ba2\u9605\u54a8\u8be2") &&
      value.includes("\u5e73\u53f0\u89c4\u5219"))
  );
}

function buildUniqueAccountServiceMetaDescription(
  primaryName: string,
  locale: Locale,
) {
  if (locale === "en") {
    return `${primaryName} account service guidance: review access paths, delivery notes, support boundaries, pricing context, and platform-policy reminders before use.`;
  }

  return `${primaryName} AI\u8d26\u53f7\u670d\u52a1\u54a8\u8be2\uff1a\u63d0\u4f9bAI\u5de5\u5177\u8ba2\u9605\u4e0e\u8d26\u53f7\u4f7f\u7528\u652f\u6301\uff0c\u5305\u542b\u8bbf\u95ee\u8def\u5f84\u3001\u4ea4\u4ed8\u8bf4\u660e\u3001\u4ef7\u683c\u8303\u56f4\u3001\u552e\u540e\u8fb9\u754c\u3001\u5e73\u53f0\u89c4\u5219\u548c\u5408\u89c4\u63d0\u9192\uff0c\u8d2d\u4e70\u6216\u54a8\u8be2\u524d\u5148\u5224\u65ad\u662f\u5426\u9002\u5408\u5f53\u524d\u4efb\u52a1\u3002`;
}

function resolveToolTitleNames(
  name: string,
  englishName: string | null | undefined,
  locale: Locale,
) {
  const normalizedName = normalizeWhitespace(name);
  const normalizedEnglishName = normalizeWhitespace(englishName ?? "");
  const hasDistinctEnglishName =
    normalizedEnglishName &&
    normalizedEnglishName.toLowerCase() !== normalizedName.toLowerCase() &&
    !normalizedName
      .toLowerCase()
      .includes(normalizedEnglishName.toLowerCase()) &&
    !normalizedEnglishName.toLowerCase().includes(normalizedName.toLowerCase());

  if (locale === "en") {
    return {
      primaryName: normalizedEnglishName || normalizedName,
      secondaryName: hasDistinctEnglishName ? normalizedName : "",
    };
  }

  return {
    primaryName: normalizedName || normalizedEnglishName,
    secondaryName: hasDistinctEnglishName ? normalizedEnglishName : "",
  };
}

function splitToolTypeFromName(name: string) {
  const normalized = normalizeWhitespace(name);
  const separatorMatch = normalized.match(
    /^(.+?)\s[-|]\s(AI (?:Software App|Account Service|Skill Course))$/i,
  );

  if (!separatorMatch) {
    return {
      toolName: normalized,
      typeName: "",
    };
  }

  return {
    toolName: normalizeWhitespace(separatorMatch[1]),
    typeName: normalizeWhitespace(separatorMatch[2]),
  };
}

function resolveToolTypeLabel(
  type: ToolMetaDescriptionInput["type"],
  locale: Locale,
) {
  if (locale === "en") {
    if (type === "online") return "AI account service";
    if (type === "skill_learning") return "AI skill course";
    return "AI software app";
  }

  if (type === "online") return "AI账号服务";
  if (type === "skill_learning") return "AI技能课程";
  return "AI软件应用";
}

function hasControlledAiWorkflowCue(value: string) {
  return /本地部署|私有化|不受限制|无限制|随心所欲|随时所欲|离线|隐私|敏感素材|private|local deployment|unrestricted/i.test(
    value,
  );
}

function buildControlledAiWorkflowDescription(
  primaryName: string,
  brand: string,
  locale: Locale,
) {
  if (locale === "en") {
    return `${primaryName} helps users build safer, more private, stable, and controlled AI workflows. Review pricing, tutorials, delivery scope, and system requirements on ${brand} before use.`;
  }

  return `${primaryName}适合需要安全、隐私、稳定、可控 AI 流程的用户。购买前在 ${brand} 确认价格、教程、交付方式、设备要求和隐私边界。`;
}

export function buildToolMetadataTitle({
  name,
  englishName,
  brand = siteName,
  maxLength,
  locale = "zh",
}: BuildTitleInput) {
  const targetMaxLength = maxLength ?? (locale === "en" ? 58 : 62);
  const { primaryName, secondaryName } = resolveToolTitleNames(
    name,
    englishName,
    locale,
  );
  const splitTitle =
    locale === "en"
      ? splitToolTypeFromName(primaryName)
      : { toolName: primaryName, typeName: "" };

  if (locale === "en" && splitTitle.typeName) {
    const titleWithType = buildMetadataTitle({
      pageTitle: `${splitTitle.toolName} | ${splitTitle.typeName}`,
      brand,
      maxLength: targetMaxLength,
    });
    if (titleWithType.length <= targetMaxLength) return titleWithType;
  }

  const preferredTitle = secondaryName
    ? `${primaryName} (${secondaryName})`
    : primaryName;
  const compactTitle = buildMetadataTitle({
    pageTitle: primaryName,
    brand,
    maxLength: targetMaxLength,
  });
  const fullTitle = buildMetadataTitle({
    pageTitle: preferredTitle,
    brand,
    maxLength: targetMaxLength,
  });

  if (
    secondaryName &&
    fullTitle !== compactTitle &&
    preferredTitle.length + ` | ${brand}`.length > targetMaxLength
  ) {
    return compactTitle;
  }

  if (fullTitle.length <= targetMaxLength) return fullTitle;
  if (compactTitle.length <= targetMaxLength) return compactTitle;

  const reservedLength = ` | ${brand}`.length;
  return `${truncateText(primaryName, Math.max(12, targetMaxLength - reservedLength))} | ${brand}`;
}

export function buildToolMetaDescription({
  name,
  englishName,
  description,
  brand = siteName,
  locale = "zh",
  type = "software",
  maxLength = 150,
}: ToolMetaDescriptionInput) {
  const normalizedDescription =
    type === "online"
      ? sanitizeAccountServiceCopy(description, locale)
      : normalizeWhitespace(description ?? "");
  const { primaryName } = resolveToolTitleNames(name, englishName, locale);
  const typeLabel = resolveToolTypeLabel(type, locale);
  const targetMaxLength = Math.min(maxLength, locale === "en" ? 135 : 145);
  const shortDescriptionLimit = locale === "en" ? 95 : 90;
  const shouldNameGenericAccountServiceCopy =
    type === "online" &&
    normalizedDescription &&
    isGenericAccountServiceMetaDescription(normalizedDescription, locale);

  if (locale === "en") {
    if (normalizedDescription) {
      if (hasControlledAiWorkflowCue(normalizedDescription)) {
        return buildMetaDescription(
          buildControlledAiWorkflowDescription(primaryName, brand, locale),
          defaultSiteDescription,
          targetMaxLength,
        );
      }

      if (
        !shouldNameGenericAccountServiceCopy &&
        normalizedDescription.length < shortDescriptionLimit
      ) {
        return buildMetaDescription(
          `${normalizedDescription} On ${brand}, review ${primaryName} features, pricing, tutorials, access notes, and creator workflow fit before use.`,
          defaultSiteDescription,
          targetMaxLength,
        );
      }

      return buildMetaDescription(
        shouldNameGenericAccountServiceCopy
          ? buildUniqueAccountServiceMetaDescription(primaryName, locale)
          : normalizedDescription,
        defaultSiteDescription,
        targetMaxLength,
      );
    }

    return buildMetaDescription(
      `${primaryName}: ${typeLabel} on ${brand}. Review features, pricing, tutorials, and access.`,
      defaultSiteDescription,
      targetMaxLength,
    );
  }

  if (normalizedDescription) {
    if (shouldNameGenericAccountServiceCopy) {
      return buildMetaDescription(
        buildUniqueAccountServiceMetaDescription(primaryName, locale),
        defaultSiteDescription,
        targetMaxLength,
      );
    }

    if (hasControlledAiWorkflowCue(normalizedDescription)) {
      return buildMetaDescription(
        buildControlledAiWorkflowDescription(primaryName, brand, locale),
        defaultSiteDescription,
        targetMaxLength,
      );
    }

    const brandLower = normalizeWhitespace(brand).toLowerCase();
    const descriptionLower = normalizedDescription.toLowerCase();
    const compactDescription =
      normalizedDescription.length < shortDescriptionLimit
        ? `${normalizedDescription} 在 ${brand} 查看${primaryName}价格、教程、交付方式、隐私边界和适用任务，判断是否适合当前创作或效率工作流。`
        : descriptionLower.includes(brandLower)
          ? normalizedDescription
          : `${normalizedDescription} 在 ${brand} 查看使用建议。`;

    return buildMetaDescription(
      compactDescription,
      defaultSiteDescription,
      targetMaxLength,
    );
  }

  return buildMetaDescription(
    `在 ${brand} 查看 ${primaryName} 的价格、教程、交付方式、使用边界和适用任务，判断这款${typeLabel}是否值得使用。`,
    defaultSiteDescription,
    targetMaxLength,
  );
}

export function buildPageMetadata({
  title,
  description,
  path = "/",
  image,
  locale = "zh_CN",
  type = "website",
  localeKey = locale === "en_US" ? "en" : "zh",
  languageAlternates,
}: PageMetadataInput): Metadata {
  const finalDescription = buildMetaDescription(
    description,
    defaultSiteDescription,
    150,
  );
  const canonicalPath = buildLocalePath(path, localeKey);
  const canonical = absoluteUrl(canonicalPath);
  const imageUrl = absoluteUrl(image ?? defaultOgImage);

  return {
    title,
    description: finalDescription,
    other: {
      "content-language": locale === "en_US" ? "en-US" : "zh-CN",
    },
    alternates: {
      canonical,
      languages: languageAlternates ?? buildLanguageAlternates(path),
    },
    openGraph: {
      title,
      description: finalDescription,
      url: canonical,
      siteName,
      images: [
        {
          url: imageUrl,
          alt: title,
        },
      ],
      locale,
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: finalDescription,
      images: [imageUrl],
    },
  };
}

export function buildOrganizationSchema({
  name,
  logo,
  url = absoluteUrl("/"),
  description,
  sameAs = [],
  contactPoint,
  schemaType = "Organization",
}: OrganizationSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    name,
    url,
    ...(description ? { description: buildMetaDescription(description) } : {}),
    ...(logo ? { logo: absoluteUrl(logo) } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(contactPoint?.email
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            email: contactPoint.email,
            contactType: contactPoint.contactType ?? "customer support",
            availableLanguage: contactPoint.availableLanguage ?? [
              "zh-CN",
              "en-US",
            ],
          },
        }
      : {}),
  };
}

export function buildWebsiteSchema({
  name,
  description,
  url = absoluteUrl("/"),
  inLanguage = "zh-CN",
  searchPathTemplate = null,
  schemaType = "WebSite",
}: WebSiteSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    name,
    url,
    description: buildMetaDescription(description),
    inLanguage,
    publisher: {
      "@type": "Organization",
      name,
    },
    ...(searchPathTemplate
      ? {
          potentialAction: {
            "@type": "SearchAction",
            target: absoluteUrl(searchPathTemplate),
            "query-input": "required name=search_term_string",
          },
        }
      : {}),
  };
}

export function buildBreadcrumbSchema({
  items,
  schemaType = "BreadcrumbList",
}: BreadcrumbSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildFaqSchema({
  items,
  schemaType = "FAQPage",
}: FaqSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function buildOfferData(
  url: string,
  currency: string,
  priceSpecs: OfferSpecInput[],
) {
  const normalizedSpecs = priceSpecs
    .map((spec) => ({
      ...spec,
      price: Number(spec.price),
    }))
    .filter((spec) => Number.isFinite(spec.price) && spec.price > 0);

  if (!normalizedSpecs.length) return {};

  if (normalizedSpecs.length === 1) {
    return {
      offers: {
        "@type": "Offer",
        name: normalizedSpecs[0].name,
        price: normalizedSpecs[0].price.toFixed(2),
        priceCurrency: currency,
        availability: "https://schema.org/InStock",
        url: absoluteUrl(url),
      },
    };
  }

  const prices = normalizedSpecs.map((spec) => spec.price);

  return {
    offers: {
      "@type": "AggregateOffer",
      lowPrice: Math.min(...prices).toFixed(2),
      highPrice: Math.max(...prices).toFixed(2),
      offerCount: String(normalizedSpecs.length),
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
      url: absoluteUrl(url),
    },
  };
}

export function buildToolStructuredData({
  schemaType,
  name,
  description,
  url,
  image,
  brand = siteName,
  category,
  operatingSystem,
  locale = "zh-CN",
  price,
  currency = "CNY",
  softwareVersion,
  priceSpecs = [],
  aggregateRating = null,
}: ToolStructuredDataInput) {
  const normalizedPriceSpecs = priceSpecs
    .map((spec) => ({
      name: normalizeWhitespace(spec.name),
      price: Number(spec.price),
    }))
    .filter(
      (spec) => spec.name && Number.isFinite(spec.price) && spec.price > 0,
    );
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name,
    description: buildMetaDescription(description),
    url: absoluteUrl(url),
    inLanguage: locale,
    ...(image ? { image: absoluteUrl(image) } : {}),
    ...(aggregateRating &&
    Number.isFinite(aggregateRating.ratingValue) &&
    Number.isFinite(aggregateRating.reviewCount) &&
    aggregateRating.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: aggregateRating.ratingValue.toFixed(1),
            reviewCount: String(aggregateRating.reviewCount),
          },
        }
      : {}),
  };

  const offer =
    typeof price === "number"
      ? {
          offers: {
            "@type": "Offer",
            price: price.toFixed(2),
            priceCurrency: currency,
            availability: "https://schema.org/InStock",
            url: absoluteUrl(url),
          },
        }
      : {};
  const structuredOffers = normalizedPriceSpecs.length
    ? buildOfferData(url, currency, normalizedPriceSpecs)
    : offer;

  if (schemaType === "SoftwareApplication") {
    return {
      ...baseSchema,
      applicationCategory: category ?? "BusinessApplication",
      operatingSystem: operatingSystem ?? "Web",
      ...(softwareVersion ? { softwareVersion } : {}),
      brand: {
        "@type": "Brand",
        name: brand,
      },
      ...structuredOffers,
    };
  }

  if (schemaType === "Service") {
    return {
      ...baseSchema,
      serviceType: category ?? "AI account service",
      provider: {
        "@type": "Organization",
        name: brand,
      },
      areaServed: "CN",
      ...(normalizedPriceSpecs.length
        ? {
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: `${name} offers`,
              itemListElement: normalizedPriceSpecs.map((spec) => ({
                "@type": "Offer",
                name: spec.name,
                price: spec.price.toFixed(2),
                priceCurrency: currency,
                availability: "https://schema.org/InStock",
                url: absoluteUrl(url),
              })),
            },
          }
        : {}),
      ...structuredOffers,
    };
  }

  return {
    ...baseSchema,
    provider: {
      "@type": "Organization",
      name: brand,
    },
    educationalLevel: category ?? "Professional",
    courseMode: "online",
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      inLanguage: locale,
      ...structuredOffers,
    },
    ...structuredOffers,
  };
}

export function buildProductStructuredData({
  name,
  description,
  url,
  image,
  brand = siteName,
  category,
  price,
  currency = "CNY",
  priceSpecs = [],
}: ProductStructuredDataInput) {
  const normalizedPriceSpecs = priceSpecs
    .map((spec) => ({
      name: normalizeWhitespace(spec.name),
      price: Number(spec.price),
    }))
    .filter(
      (spec) => spec.name && Number.isFinite(spec.price) && spec.price > 0,
    );
  const offer =
    typeof price === "number" && Number.isFinite(price) && price > 0
      ? {
          offers: {
            "@type": "Offer",
            price: price.toFixed(2),
            priceCurrency: currency,
            availability: "https://schema.org/InStock",
            url: absoluteUrl(url),
          },
        }
      : {};

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: buildMetaDescription(description),
    url: absoluteUrl(url),
    ...(image ? { image: absoluteUrl(image) } : {}),
    ...(category ? { category } : {}),
    brand: {
      "@type": "Brand",
      name: brand,
    },
    ...(normalizedPriceSpecs.length
      ? buildOfferData(url, currency, normalizedPriceSpecs)
      : offer),
  };
}

export function stringifyStructuredData(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
