import type { Metadata } from "next";
import { Container, EmptyState, SectionTitle } from "@/components/ui";
import { ToolCard } from "@/components/tool-card";
import { prisma } from "@/lib/db";
import { getCurrentLocale, getDictionary, type Locale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const t = getDictionary(locale);
  return buildPageMetadata({
    title: `${t.listing.onlineTitle} - ${t.brand}`,
    description: t.listing.onlineIntro,
    path: "/online-tools"
  });
}

export default async function OnlineToolsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const keyword = params.q;
  const categoryId = params.category;
  const sort = params.sort;
  const locale = await getCurrentLocale();
  const t = getDictionary(locale);
  const [categories, tools] = await Promise.all([
    prisma.toolCategory.findMany({ where: { type: "online", status: "active" }, orderBy: { sortOrder: "asc" } }),
    prisma.tool.findMany({
      where: {
        type: "online",
        status: "published",
        ...(categoryId ? { categoryId } : {}),
        ...(keyword ? { OR: [{ name: { contains: keyword, mode: "insensitive" } }, { englishName: { contains: keyword, mode: "insensitive" } }, { shortDescription: { contains: keyword, mode: "insensitive" } }] } : {})
      },
      include: { category: true },
      orderBy: sort === "hot" ? { usageCount: "desc" } : { createdAt: "desc" }
    })
  ]);

  return (
    <Container className="py-14">
      <SectionTitle title={t.listing.onlineTitle} intro={t.listing.onlineIntro} />
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
    <form className="glass grid gap-3 rounded-2xl p-4 md:grid-cols-[1fr_180px_140px]">
      <input name="q" placeholder={t.listing.searchPlaceholder} className="rounded-xl border border-white/12 bg-white/8 px-4 py-3 outline-none" />
      <select name="category" className="rounded-xl border border-white/12 bg-[#111827] px-4 py-3">
        <option value="">{t.listing.allCategories}</option>
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select>
      <select name="sort" className="rounded-xl border border-white/12 bg-[#111827] px-4 py-3">
        <option value="latest">{t.listing.latest}</option>
        <option value="hot">{t.listing.hot}</option>
      </select>
      <button className="rounded-full bg-[#7AA7FF] px-5 py-3 font-semibold text-[#07101f] md:col-span-3">{t.listing.filter}</button>
    </form>
  );
}
