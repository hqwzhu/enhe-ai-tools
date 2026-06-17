import type { Metadata } from "next";
import { StructuredData } from "@/components/structured-data";
import { Container, EmptyState, SectionTitle } from "@/components/ui";
import { ToolCard } from "@/components/tool-card";
import { prisma } from "@/lib/db";
import { getCurrentLocale, getDictionary, type Locale } from "@/lib/i18n";
import { getPublicToolListing } from "@/lib/public-content";
import { buildBreadcrumbSchema, buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const t = getDictionary(locale);
  return buildPageMetadata({
    title: `${t.listing.softwareTitle} - ${t.brand}`,
    description: t.listing.softwareIntro,
    path: "/software",
    locale: locale === "en" ? "en_US" : "zh_CN"
  });
}

export default async function SoftwarePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const keyword = params.q;
  const categoryId = params.category;
  const paid = params.paid;
  const sort = params.sort;
  const locale = await getCurrentLocale();
  const t = getDictionary(locale);
  const breadcrumbSchema = buildBreadcrumbSchema({
    schemaType: "BreadcrumbList",
    items: [
      { name: t.nav.home, path: "/" },
      { name: t.listing.softwareTitle, path: "/software" }
    ]
  });
  const [categories, tools] = await Promise.all([
    prisma.toolCategory.findMany({ where: { type: "software", status: "active" }, orderBy: { sortOrder: "asc" } }),
    getPublicToolListing("software", categoryId, keyword, paid, sort)
  ]);

  return (
    <Container className="py-14">
      <StructuredData data={breadcrumbSchema} />
      <SectionTitle as="h1" title={t.listing.softwareTitle} intro={t.listing.softwareIntro} />
      <FilterBar categories={categories} locale={locale} />
      {tools.length ? (
        <div className="mt-8 grid gap-5 md:grid-cols-3">{tools.map((tool) => <ToolCard key={tool.id} tool={tool} locale={locale} />)}</div>
      ) : (
        <EmptyState title={t.listing.emptyTitle} text={t.listing.emptyText} />
      )}
    </Container>
  );
}

function FilterBar({ categories, locale }: { categories: { id: string; name: string }[]; locale: Locale }) {
  const t = getDictionary(locale);

  return (
    <form className="filter-surface grid gap-3 md:grid-cols-[1fr_180px_160px_140px]">
      <input name="q" placeholder={t.listing.searchPlaceholder} className="form-control-dark" />
      <select name="category" className="form-select-dark">
        <option value="">{t.listing.allCategories}</option>
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select>
      <select name="paid" className="form-select-dark">
        <option value="">{t.listing.allAccess}</option>
        <option value="paid">{t.toolCard.paidDownload}</option>
        <option value="free">{t.toolCard.free}</option>
      </select>
      <select name="sort" className="form-select-dark">
        <option value="latest">{t.listing.latest}</option>
        <option value="hot">{t.listing.hot}</option>
      </select>
      <button className="rounded-full bg-[#050505] px-5 py-3 font-bold text-white transition hover:bg-[#161616] md:col-span-4">{t.listing.filter}</button>
    </form>
  );
}
