import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StructuredData } from "@/components/structured-data";
import { ToolCard } from "@/components/tool-card";
import { Badge, Container, EmptyState, SectionTitle } from "@/components/ui";
import type { Locale } from "@/lib/dictionaries";
import { getPublicToolsByCategoryNames } from "@/lib/public-content";
import {
  getProductPathConfig,
  productPathSlugs,
} from "@/lib/product-paths";
import { buildCanonicalToolPath } from "@/lib/public-slugs";
import {
  absoluteUrl,
  buildBreadcrumbSchema,
  buildLocalePath,
  buildPageMetadata,
} from "@/lib/seo";

export function generateProductPathStaticParams() {
  return productPathSlugs.map((slug) => ({ slug }));
}

export async function generateProductPathMetadata(
  slug: string,
  forceLocale: Locale,
): Promise<Metadata> {
  const config = getProductPathConfig(slug);
  const copy = config?.[forceLocale];

  return buildPageMetadata({
    title: copy
      ? `${copy.title} - ${forceLocale === "en" ? "ENHE AI" : "恩禾ENHE AI"}`
      : forceLocale === "en"
        ? "Product path - ENHE AI"
        : "产品路径 - 恩禾ENHE AI",
    description: copy?.metaDescription ?? copy?.intro,
    path: `/product-paths/${slug}`,
    locale: forceLocale === "en" ? "en_US" : "zh_CN",
    localeKey: forceLocale,
  });
}

export async function ProductPathPageShell({
  slug,
  forceLocale,
}: {
  slug: string;
  forceLocale: Locale;
}) {
  const config = getProductPathConfig(slug);
  if (!config) notFound();

  const copy = config[forceLocale];
  const tools = await getPublicToolsByCategoryNames(config.categoryNames);
  const pagePath = `/product-paths/${config.slug}`;
  const breadcrumbSchema = buildBreadcrumbSchema({
    items: [
      {
        name: forceLocale === "en" ? "Home" : "首页",
        path: buildLocalePath("/", forceLocale),
      },
      { name: copy.title, path: buildLocalePath(pagePath, forceLocale) },
    ],
  });
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: copy.title,
    description: copy.metaDescription,
    url: absoluteUrl(buildLocalePath(pagePath, forceLocale)),
    inLanguage: forceLocale === "en" ? "en-US" : "zh-CN",
    about: copy.categories,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: tools.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: forceLocale === "en" ? tool.englishName || tool.name : tool.name,
        url: absoluteUrl(buildCanonicalToolPath(tool, forceLocale)),
      })),
    },
  };

  return (
    <main>
      <Container className="py-14">
        <StructuredData data={[breadcrumbSchema, collectionSchema]} />
        <SectionTitle as="h1" title={copy.title} intro={copy.intro} />
        <div
          className="mb-8 flex flex-wrap gap-2"
          aria-label={forceLocale === "en" ? "Product categories" : "产品分类"}
        >
          {copy.categories.map((category) => (
            <Badge key={category}>{category}</Badge>
          ))}
        </div>
        {tools.length ? (
          <div className="listing-grid mt-8 grid gap-5 md:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} locale={forceLocale} />
            ))}
          </div>
        ) : (
          <EmptyState title={copy.emptyTitle} text={copy.emptyText} />
        )}
      </Container>
    </main>
  );
}
