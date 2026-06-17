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
     title: `${t.listing.skillLearningTitle} - ${t.brand}`,
     description: t.listing.skillLearningIntro,
     path: "/skill-learning"
   });
 }
 
 export default async function SkillLearningPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
   const params = await searchParams;
   const keyword = params.q;
   const categoryId = params.category;
   const sort = params.sort;
   const locale = await getCurrentLocale();
   const t = getDictionary(locale);
   const [categories, tools] = await Promise.all([
     prisma.toolCategory.findMany({ where: { type: "skill_learning", status: "active" }, orderBy: { sortOrder: "asc" } }),
     prisma.tool.findMany({
       where: {
         type: "skill_learning",
         status: "published",
         ...(categoryId ? { categoryId } : {}),
         ...(keyword ? { OR: [{ name: { contains: keyword, mode: "insensitive" } }, { englishName: { contains: keyword, mode: "insensitive" } }, { shortDescription: { contains: keyword, mode: "insensitive" } }] } : {})
       },
       include: { category: true, priceSpecs: { where: { status: "active" }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
       orderBy: sort === "hot" ? { downloadCount: "desc" } : { createdAt: "desc" }
     })
   ]);
 
   return (
     <Container className="py-14">
       <SectionTitle title={t.listing.skillLearningTitle} intro={t.listing.skillLearningIntro} />
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
     <form className="filter-surface grid gap-3 md:grid-cols-[1fr_180px_140px]">
       <input name="q" placeholder={t.listing.searchPlaceholder} className="form-control-dark" />
       <select name="category" className="form-select-dark">
         <option value="">{t.listing.allCategories}</option>
         {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
       </select>
       <select name="sort" className="form-select-dark">
         <option value="latest">{t.listing.latest}</option>
         <option value="hot">{t.listing.hot}</option>
       </select>
       <button className="rounded-full bg-[#050505] px-5 py-3 font-bold text-white transition hover:bg-[#161616] md:col-span-3">{t.listing.filter}</button>
     </form>
   );
 }
