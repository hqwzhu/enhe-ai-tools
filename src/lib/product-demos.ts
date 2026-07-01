import { unstable_cache } from "next/cache";
import type { Prisma, ProductDemoCategory } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { Locale } from "@/lib/dictionaries";
import { normalizeImageSrc, normalizeMediaSrc } from "@/lib/media";
import { buildCanonicalToolPath } from "@/lib/public-slugs";
import {
  absoluteUrl,
  buildLocalePath,
  buildMetaDescription,
  buildMetadataTitle,
  siteName,
} from "@/lib/seo";

export const productDemoRevalidateSeconds = 300;

export const productDemoCategories = [
  "software",
  "skill_learning",
  "account_service",
] as const satisfies readonly ProductDemoCategory[];

export type ProductDemoFilter = (typeof productDemoCategories)[number] | "all";

export type ProductDemoFaqItem = {
  question: string;
  answer: string;
};

export type PublicProductDemo = Prisma.ProductDemoGetPayload<{
  include: {
    relatedProduct: {
      include: {
        category: true;
        priceSpecs: true;
        tutorials: true;
      };
    };
  };
}>;

function isRecoverableProductDemoReadError(error: unknown) {
  if (!(error instanceof Error)) return false;

  const errorWithCode = error as Error & { code?: unknown };
  const code = typeof errorWithCode.code === "string" ? errorWithCode.code : "";
  return (
    code === "P1001" ||
    /Can't reach database server/i.test(error.message) ||
    /ECONNREFUSED/i.test(error.message)
  );
}

export function normalizeProductDemoCategory(value?: string | null): ProductDemoFilter {
  if (value === "software" || value === "skill_learning" || value === "account_service") {
    return value;
  }
  if (value === "skill-learning") return "skill_learning";
  if (value === "account-service") return "account_service";
  return "all";
}

export function getProductDemoCategoryParam(category: ProductDemoFilter) {
  if (category === "skill_learning") return "skill-learning";
  if (category === "account_service") return "account-service";
  return category;
}

export function getProductDemoCategoryLabel(category: ProductDemoCategory, locale: Locale) {
  if (locale === "en") {
    if (category === "skill_learning") return "AI Skill Learning";
    if (category === "account_service") return "AI Account Service";
    return "AI Software App";
  }

  if (category === "skill_learning") return "AI技能学习";
  if (category === "account_service") return "AI账号服务";
  return "AI软件应用";
}

export function buildProductDemoPath(slug: string, locale: Locale) {
  return buildLocalePath(`/product-demos/${slug}`, locale);
}

export function buildProductDemoListingPath(locale: Locale, category: ProductDemoFilter = "all") {
  const basePath = buildLocalePath("/product-demos", locale);
  if (category === "all") return basePath;
  return `${basePath}?type=${getProductDemoCategoryParam(category)}`;
}

export function parseProductDemoFaq(value: unknown): ProductDemoFaqItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const question = String(record.question ?? "").trim();
      const answer = String(record.answer ?? "").trim();
      return question && answer ? { question, answer } : null;
    })
    .filter((item): item is ProductDemoFaqItem => Boolean(item));
}

export function getProductDemoCoverImage(demo: Pick<PublicProductDemo, "coverImage">) {
  return normalizeImageSrc(demo.coverImage);
}

export function getProductDemoVideoUrl(demo: Pick<PublicProductDemo, "videoUrl">) {
  return normalizeMediaSrc(demo.videoUrl);
}

export function getProductDemoRelatedProductHref(
  demo: Pick<PublicProductDemo, "relatedProductUrl" | "relatedProductSlug" | "relatedProduct">,
  locale: Locale,
) {
  if (demo.relatedProduct) return buildCanonicalToolPath(demo.relatedProduct, locale);
  if (demo.relatedProductUrl) return demo.relatedProductUrl;
  if (demo.relatedProductSlug) return buildLocalePath(`/software/${demo.relatedProductSlug}`, locale);
  return buildLocalePath("/software", locale);
}

export function getProductDemoTitle(demo: Pick<PublicProductDemo, "title">) {
  return demo.title;
}

export function getProductDemoDescription(demo: Pick<PublicProductDemo, "description" | "seoDescription">) {
  return demo.seoDescription || demo.description;
}

export function buildProductDemoMetadataTitle(demo: Pick<PublicProductDemo, "title" | "seoTitle">, locale: Locale) {
  if (demo.seoTitle) return buildMetadataTitle({ pageTitle: demo.seoTitle, brand: siteName });
  return buildMetadataTitle({
    pageTitle: locale === "en" ? `${demo.title} Demo` : `${demo.title} 视频演示`,
    brand: siteName,
  });
}

export function buildProductDemoVideoObjectSchema(demo: PublicProductDemo, locale: Locale) {
  const demoPath = buildProductDemoPath(demo.slug, locale);
  const thumbnailUrl = getProductDemoCoverImage(demo);
  const contentUrl = getProductDemoVideoUrl(demo);

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: getProductDemoTitle(demo),
    description: buildMetaDescription(getProductDemoDescription(demo)),
    thumbnailUrl: thumbnailUrl ? [absoluteUrl(thumbnailUrl)] : undefined,
    uploadDate: (demo.uploadDate ?? demo.publishedAt ?? demo.createdAt).toISOString(),
    ...(demo.videoDuration ? { duration: demo.videoDuration } : {}),
    ...(contentUrl ? { contentUrl: absoluteUrl(contentUrl) } : {}),
    publisher: {
      "@type": "Organization",
      name: "恩禾ENHE AI",
      url: absoluteUrl("/"),
    },
    url: absoluteUrl(demoPath),
    inLanguage: locale === "en" ? "en-US" : "zh-CN",
  };
}

export function buildProductDemoBreadcrumbItems(demo: PublicProductDemo, locale: Locale) {
  return [
    { name: locale === "en" ? "Home" : "首页", path: buildLocalePath("/", locale) },
    {
      name: locale === "en" ? "Product Demos" : "产品效果演示",
      path: buildLocalePath("/product-demos", locale),
    },
    { name: demo.title, path: buildProductDemoPath(demo.slug, locale) },
  ];
}

const productDemoInclude = {
  relatedProduct: {
    include: {
      category: true,
      priceSpecs: {
        where: { status: "active" },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
      tutorials: {
        where: { status: "active" },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  },
} satisfies Prisma.ProductDemoInclude;

const productDemoOrderBy = [
  { sortOrder: "asc" },
  { publishedAt: "desc" },
  { createdAt: "desc" },
] satisfies Prisma.ProductDemoOrderByWithRelationInput[];

const getCachedHomeProductDemos = unstable_cache(
  async () => {
    try {
      return await prisma.productDemo.findMany({
        where: {
          status: "published",
          isFeaturedOnHome: true,
        },
        include: productDemoInclude,
        orderBy: productDemoOrderBy,
        take: 3,
      });
    } catch (error) {
      if (isRecoverableProductDemoReadError(error)) return [];
      throw error;
    }
  },
  ["public-home-product-demos"],
  {
    revalidate: productDemoRevalidateSeconds,
    tags: ["public-product-demos", "public-home"],
  },
);

const getCachedPublicProductDemos = unstable_cache(
  async (category: ProductDemoFilter) => {
    try {
      return await prisma.productDemo.findMany({
        where: {
          status: "published",
          ...(category !== "all" ? { category } : {}),
        },
        include: productDemoInclude,
        orderBy: productDemoOrderBy,
      });
    } catch (error) {
      if (isRecoverableProductDemoReadError(error)) return [];
      throw error;
    }
  },
  ["public-product-demos-listing"],
  {
    revalidate: productDemoRevalidateSeconds,
    tags: ["public-product-demos"],
  },
);

const getCachedPublicProductDemoBySlug = unstable_cache(
  async (slug: string) => {
    try {
      return await prisma.productDemo.findFirst({
        where: { slug, status: "published" },
        include: productDemoInclude,
      });
    } catch (error) {
      if (isRecoverableProductDemoReadError(error)) return null;
      throw error;
    }
  },
  ["public-product-demo-by-slug"],
  {
    revalidate: productDemoRevalidateSeconds,
    tags: ["public-product-demos"],
  },
);

export async function getHomeProductDemos() {
  return getCachedHomeProductDemos();
}

export async function getPublicProductDemos(category: ProductDemoFilter = "all") {
  return getCachedPublicProductDemos(category);
}

export async function getPublicProductDemoBySlug(slug: string) {
  return getCachedPublicProductDemoBySlug(slug);
}
