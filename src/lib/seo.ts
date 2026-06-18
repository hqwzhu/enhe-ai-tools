import type { Metadata } from "next";
import type { Locale } from "@/lib/dictionaries";

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
  items: Array<{
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
  aggregateRating?:
    | {
        ratingValue: number;
        reviewCount: number;
      }
    | null;
};

export function getSiteBaseUrl() {
  return (process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? fallbackSiteBaseUrl).replace(/\/+$/, "");
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${getSiteBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function stripLocalePrefix(path: string) {
  if (!path || path === "/") return "/";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized === "/en" ? "/" : normalized.replace(/^\/en(?=\/|$)/, "") || "/";
}

export function buildLocalePath(path: string, locale: Locale) {
  const normalized = stripLocalePrefix(path);
  if (locale === "en") {
    return normalized === "/" ? "/en" : `/en${normalized}`;
  }
  return normalized;
}

const localizedPublicRoutePatterns = [
  /^\/$/,
  /^\/software$/,
  /^\/online-tools$/,
  /^\/skill-learning$/,
  /^\/ai-news$/,
  /^\/ai-news\/.+$/,
  /^\/pricing$/,
  /^\/tutorials$/,
  /^\/tools\/.+$/,
  /^\/legal\/.+$/
] as const;

export function isLocalizedPublicPath(path: string) {
  const normalized = stripLocalePrefix(path);
  return localizedPublicRoutePatterns.some((pattern) => pattern.test(normalized));
}

export function buildLanguageSwitcherHref(path: string, locale: Locale) {
  if (!isLocalizedPublicPath(path)) {
    return buildLocalePath("/", locale);
  }

  return buildLocalePath(path, locale);
}

export function buildLanguageAlternates(path = "/") {
  return {
    "x-default": absoluteUrl(stripLocalePrefix(path)),
    "zh-CN": absoluteUrl(buildLocalePath(path, "zh")),
    "en-US": absoluteUrl(buildLocalePath(path, "en"))
  } as const;
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

export function buildMetaDescription(value: string | null | undefined, fallback = defaultSiteDescription, maxLength = 160) {
  const preferred = normalizeWhitespace(value ?? "");
  const fallbackValue = normalizeWhitespace(fallback);
  return truncateDescription(preferred || fallbackValue, maxLength);
}

export function buildMetadataTitle({ pageTitle, brand = siteName, maxLength = 68 }: MetadataTitleInput) {
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
      const baseTitle = normalizedPageTitle.slice(0, normalizedPageTitle.length - separator.length - normalizedBrand.length).trim();
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
  const scope = locale === "en" ? "AI Software, Account Services & Skill Learning" : "AI软件、账号服务与技能学习";
  return buildMetadataTitle({ pageTitle: brand, brand: scope, maxLength: locale === "en" ? 72 : 64 });
}

function resolveToolTitleNames(name: string, englishName: string | null | undefined, locale: Locale) {
  const normalizedName = normalizeWhitespace(name);
  const normalizedEnglishName = normalizeWhitespace(englishName ?? "");
  const hasDistinctEnglishName =
    normalizedEnglishName &&
    normalizedEnglishName.toLowerCase() !== normalizedName.toLowerCase() &&
    !normalizedName.toLowerCase().includes(normalizedEnglishName.toLowerCase()) &&
    !normalizedEnglishName.toLowerCase().includes(normalizedName.toLowerCase());

  if (locale === "en") {
    return {
      primaryName: normalizedEnglishName || normalizedName,
      secondaryName: hasDistinctEnglishName ? normalizedName : ""
    };
  }

  return {
    primaryName: normalizedName || normalizedEnglishName,
    secondaryName: hasDistinctEnglishName ? normalizedEnglishName : ""
  };
}

function splitToolTypeFromName(name: string) {
  const normalized = normalizeWhitespace(name);
  const separatorMatch = normalized.match(/^(.+?)\s[-|]\s(AI (?:Software App|Account Service|Skill Course))$/i);

  if (!separatorMatch) {
    return {
      toolName: normalized,
      typeName: ""
    };
  }

  return {
    toolName: normalizeWhitespace(separatorMatch[1]),
    typeName: normalizeWhitespace(separatorMatch[2])
  };
}

function resolveToolTypeLabel(type: ToolMetaDescriptionInput["type"], locale: Locale) {
  if (locale === "en") {
    if (type === "online") return "AI account service";
    if (type === "skill_learning") return "AI skill course";
    return "AI software app";
  }

  if (type === "online") return "AI账号服务";
  if (type === "skill_learning") return "AI技能课程";
  return "AI软件应用";
}

export function buildToolMetadataTitle({ name, englishName, brand = siteName, maxLength = 68, locale = "zh" }: BuildTitleInput) {
  const { primaryName, secondaryName } = resolveToolTitleNames(name, englishName, locale);
  const splitTitle = locale === "en" ? splitToolTypeFromName(primaryName) : { toolName: primaryName, typeName: "" };

  if (locale === "en" && splitTitle.typeName) {
    const titleWithType = buildMetadataTitle({
      pageTitle: `${splitTitle.toolName} | ${splitTitle.typeName}`,
      brand,
      maxLength
    });
    if (titleWithType.length <= maxLength) return titleWithType;
  }

  const preferredTitle = secondaryName ? `${primaryName} (${secondaryName})` : primaryName;
  const compactTitle = buildMetadataTitle({ pageTitle: primaryName, brand, maxLength });
  const fullTitle = buildMetadataTitle({ pageTitle: preferredTitle, brand, maxLength });

  if (secondaryName && fullTitle !== compactTitle && preferredTitle.length + ` | ${brand}`.length > maxLength) {
    return compactTitle;
  }

  if (fullTitle.length <= maxLength) return fullTitle;
  if (compactTitle.length <= maxLength) return compactTitle;

  const reservedLength = ` | ${brand}`.length;
  return `${truncateText(primaryName, Math.max(12, maxLength - reservedLength))} | ${brand}`;
}

export function buildToolMetaDescription({
  name,
  englishName,
  description,
  brand = siteName,
  locale = "zh",
  type = "software",
  maxLength = 160
}: ToolMetaDescriptionInput) {
  const normalizedDescription = normalizeWhitespace(description ?? "");
  const { primaryName } = resolveToolTitleNames(name, englishName, locale);
  const typeLabel = resolveToolTypeLabel(type, locale);

  if (locale === "en") {
    if (normalizedDescription) return buildMetaDescription(normalizedDescription, defaultSiteDescription, Math.min(maxLength, 140));

    return buildMetaDescription(`${primaryName}: ${typeLabel} on ${brand}. Review features, pricing, tutorials, and access.`, defaultSiteDescription, Math.min(maxLength, 140));
  }

  const preferredDescription =
    normalizedDescription || `在${brand}查看${primaryName}的功能亮点、价格、教程与使用方式，快速了解这款${typeLabel}。`;

  return buildMetaDescription(
    `${preferredDescription} 在${brand}查看功能亮点、价格、教程与使用方式。`,
    defaultSiteDescription,
    maxLength
  );
}

export function buildPageMetadata({
  title,
  description,
  path = "/",
  image,
  locale = "zh_CN",
  type = "website",
  localeKey = locale === "en_US" ? "en" : "zh"
}: PageMetadataInput): Metadata {
  const finalDescription = buildMetaDescription(description);
  const canonicalPath = buildLocalePath(path, localeKey);
  const canonical = absoluteUrl(canonicalPath);
  const imageUrl = absoluteUrl(image ?? defaultOgImage);

  return {
    title,
    description: finalDescription,
    other: {
      "content-language": locale === "en_US" ? "en-US" : "zh-CN"
    },
    alternates: {
      canonical,
      languages: buildLanguageAlternates(path)
    },
    openGraph: {
      title,
      description: finalDescription,
      url: canonical,
      siteName,
      images: [
        {
          url: imageUrl,
          alt: title
        }
      ],
      locale,
      type
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: finalDescription,
      images: [imageUrl]
    }
  };
}

export function buildOrganizationSchema({
  name,
  logo,
  url = absoluteUrl("/"),
  schemaType = "Organization"
}: OrganizationSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    name,
    url,
    ...(logo ? { logo: absoluteUrl(logo) } : {})
  };
}

export function buildWebsiteSchema({
  name,
  description,
  url = absoluteUrl("/"),
  inLanguage = "zh-CN",
  searchPathTemplate = null,
  schemaType = "WebSite"
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
      name
    },
    ...(searchPathTemplate
      ? {
          potentialAction: {
            "@type": "SearchAction",
            target: absoluteUrl(searchPathTemplate),
            "query-input": "required name=search_term_string"
          }
        }
      : {})
  };
}

export function buildBreadcrumbSchema({ items, schemaType = "BreadcrumbList" }: BreadcrumbSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

export function buildFaqSchema({ items, schemaType = "FAQPage" }: FaqSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

function buildOfferData(url: string, currency: string, priceSpecs: OfferSpecInput[]) {
  const normalizedSpecs = priceSpecs
    .map((spec) => ({
      ...spec,
      price: Number(spec.price)
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
        url: absoluteUrl(url)
      }
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
      url: absoluteUrl(url)
    }
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
  aggregateRating = null
}: ToolStructuredDataInput) {
  const normalizedPriceSpecs = priceSpecs
    .map((spec) => ({
      name: normalizeWhitespace(spec.name),
      price: Number(spec.price)
    }))
    .filter((spec) => spec.name && Number.isFinite(spec.price) && spec.price > 0);
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
            reviewCount: String(aggregateRating.reviewCount)
          }
        }
      : {})
  };

  const offer =
    typeof price === "number"
      ? {
          offers: {
            "@type": "Offer",
            price: price.toFixed(2),
            priceCurrency: currency,
            availability: "https://schema.org/InStock",
            url: absoluteUrl(url)
          }
        }
      : {};
  const structuredOffers = normalizedPriceSpecs.length ? buildOfferData(url, currency, normalizedPriceSpecs) : offer;

  if (schemaType === "SoftwareApplication") {
    return {
      ...baseSchema,
      applicationCategory: category ?? "BusinessApplication",
      operatingSystem: operatingSystem ?? "Web",
      ...(softwareVersion ? { softwareVersion } : {}),
      brand: {
        "@type": "Brand",
        name: brand
      },
      ...structuredOffers
    };
  }

  if (schemaType === "Service") {
    return {
      ...baseSchema,
      serviceType: category ?? "AI account service",
      provider: {
        "@type": "Organization",
        name: brand
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
                url: absoluteUrl(url)
              }))
            }
          }
        : {}),
      ...structuredOffers
    };
  }

  return {
    ...baseSchema,
    provider: {
      "@type": "Organization",
      name: brand
    },
    educationalLevel: category ?? "Professional",
    courseMode: "online",
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      inLanguage: locale,
      ...structuredOffers
    },
    ...structuredOffers
  };
}

export function stringifyStructuredData(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
