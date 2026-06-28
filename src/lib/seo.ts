import type { Metadata } from "next";
import type { Locale } from "@/lib/dictionaries";
import { localeSwitchQueryName } from "@/lib/locale-routing";

export const fallbackSiteBaseUrl = "https://www.enhe-tech.com.cn";
export const siteName = "ENHE AI";
export const defaultSiteDescription =
  "Live in symbiosis with AI, awaken in this era, and define the future through creation.";
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

  return withLocaleSwitch(buildLocalePath(path, locale));
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

export function buildHomeMetadataTitle(locale: Locale, brand = siteName) {
  const scope =
    locale === "en"
      ? "AI News, Apps, Accounts & Courses"
      : "AI前沿资讯、软件应用、账号服务与技能学习";
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
    return "ENHE AI helps young AI users and creators track AI news, compare software apps, review account services, learn courses, and choose tools faster.";
  }

  return "恩禾 ENHE AI 面向年轻AI用户与创作者，聚合AI前沿资讯、AI软件应用、账号服务、技能课程、价格说明与实用教程，提供工具对比、购买指引和实战内容，帮助你快速理解趋势、选择工具、提升效率并把创意落地。";
}

export function buildListingMetaDescription(
  kind:
    | "software"
    | "account-services"
    | "skill-learning"
    | "ai-news"
    | "pricing"
    | "tutorials",
  locale: Locale,
) {
  const zhDescriptions = {
    software:
      "精选AI软件应用、本地部署工具、桌面效率软件和创作辅助工具，覆盖内容生产、运营自动化、音视频处理与日常工作流，提供价格、教程、下载线索、适用场景和工具对比，帮助你更快完成实际任务。",
    "account-services":
      "浏览AI账号服务咨询、AI工具订阅与账号使用支持，查看服务范围、交付说明、合规使用建议、价格线索、售后边界、适合人群和使用前检查项。使用第三方平台前，请以对应平台官方政策为准。",
    "skill-learning":
      "学习AI提示词、AI工具实战、本地部署、自动化流程和内容创作课程，查看课程报价、适合人群、学习路径、教程内容、实战案例和工具组合建议，把AI能力转化为可复用的工作技能。",
    "ai-news":
      "关注全球AI智能体、开源模型、本地部署AI应用、AI工具、技能教程与行业趋势，快速获取创作者和AI用户需要的前沿信号，把AI变化转化为实际生产力。",
    pricing:
      "查看ENHE AI软件、课程与账号服务报价结构、购买流程、权益说明、支付审核、交付方式、售后边界、退款规则、适合人群和服务范围，购买前先确认价格与使用方式。",
    tutorials:
      "阅读ENHE AI工具教程、软件使用指南、AI技能实战步骤、常见问题和工作流案例，快速掌握下载、配置、使用和复盘方法，把工具能力转化为可执行成果。",
  } as const;
  const enDescriptions = {
    software:
      "Explore AI software apps for creators, local deployment, automation, audio, video, and daily work. Compare features, pricing, tutorials, and access.",
    "account-services":
      "Browse AI account service guidance for subscriptions, access notes, compliance reminders, delivery boundaries, support scope, and pricing context.",
    "skill-learning":
      "Learn prompt engineering, AI tool workflows, local AI deployment, automation, and content creation with practical ENHE AI courses and tutorials.",
    "ai-news":
      "Follow global AI agents, open models, local deployment, AI tools, tutorials, and industry trends so creators can turn AI changes into productivity.",
    pricing:
      "Review ENHE AI software, course, and account service pricing, payment review, delivery boundaries, support scope, and refund rules before purchase.",
    tutorials:
      "Read ENHE AI tutorials, software guides, workflow steps, setup notes, and troubleshooting tips to turn AI tools into repeatable creator outcomes.",
  } as const;

  return locale === "en" ? enDescriptions[kind] : zhDescriptions[kind];
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

  return `${primaryName} AI\u8d26\u53f7\u670d\u52a1\u54a8\u8be2\uff1a\u63d0\u4f9bAI\u5de5\u5177\u8ba2\u9605\u4e0e\u8d26\u53f7\u4f7f\u7528\u652f\u6301\uff0c\u5305\u542b\u8bbf\u95ee\u8def\u5f84\u3001\u4ea4\u4ed8\u8bf4\u660e\u3001\u552e\u540e\u8fb9\u754c\u4e0e\u5e73\u53f0\u89c4\u5219\u63d0\u9192\u3002`;
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
  const shortDescriptionLimit = locale === "en" ? 95 : 58;
  const shouldNameGenericAccountServiceCopy =
    type === "online" &&
    normalizedDescription &&
    isGenericAccountServiceMetaDescription(normalizedDescription, locale);

  if (locale === "en") {
    if (normalizedDescription) {
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

    const brandLower = normalizeWhitespace(brand).toLowerCase();
    const descriptionLower = normalizedDescription.toLowerCase();
    const compactDescription =
      normalizedDescription.length < shortDescriptionLimit
        ? `${normalizedDescription} 在 ${brand} 查看${primaryName}的功能亮点、价格、教程、访问方式与适用场景，判断是否适合你的AI创作或效率工作流。`
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
    `在 ${brand} 查看 ${primaryName} 的功能亮点、价格、教程与使用方式，快速了解这款${typeLabel}。`,
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
