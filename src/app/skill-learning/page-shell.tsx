import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/structured-data";
import { Container, EmptyState, SectionTitle } from "@/components/ui";
import { ToolCard } from "@/components/tool-card";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { getPublicToolCategories, getPublicToolListing } from "@/lib/public-content";
import { publicPageCacheSeconds } from "@/lib/public-routes";
import { resolveLocalizedToolCategoryName } from "@/lib/tool-localization";
import { buildBreadcrumbSchema, buildListingMetaDescription, buildLocalePath, buildMetadataTitle, buildPageMetadata } from "@/lib/seo";

export const skillLearningPageRevalidate = publicPageCacheSeconds;

const skillLearningGeoSections = {
  zh: [
    {
      title: "AI技能学习路径",
      body: "从提示词基础、AI工具实战、本地部署、自动化流程到内容创作，先建立可复用方法，再把方法迁移到写作、运营、设计、编程和日常办公任务中。"
    },
    {
      title: "适合谁学习",
      body: "适合希望系统提升 AI 使用能力的创作者、运营人员、自由职业者、中小企业团队和个人学习者，尤其适合想把零散工具变成稳定工作流的人。"
    },
    {
      title: "如何把课程转化为工作成果",
      body: "建议围绕一个真实任务学习：先看趋势和案例，再选择对应软件或账号服务，最后用课程步骤完成交付物，让学习结果变成文档、素材、自动化流程或可复用模板。"
    }
  ],
  en: [
    {
      title: "AI skill learning path",
      body: "Start with prompt basics, AI tool workflows, local deployment, automation, and content creation, then turn each method into repeatable work habits."
    },
    {
      title: "Who should learn here",
      body: "These courses are for creators, operators, freelancers, small teams, and individual learners who want to convert scattered AI tools into practical workflows."
    },
    {
      title: "How to turn lessons into outcomes",
      body: "Learn around a real task: review trends, choose related software or account support, then follow the course steps to create a document, asset, workflow, or reusable template."
    }
  ]
} as const;

export async function generateSkillLearningPageMetadata(forceLocale: Locale): Promise<Metadata> {
  const t = getDictionary(forceLocale);
  return buildPageMetadata({
    title: buildMetadataTitle({ pageTitle: t.listing.skillLearningTitle, brand: t.brand }),
    description: buildListingMetaDescription("skill-learning", forceLocale),
    path: "/skill-learning",
    locale: forceLocale === "en" ? "en_US" : "zh_CN",
    localeKey: forceLocale
  });
}

export async function SkillLearningPageShell({
  searchParams,
  forceLocale
}: {
  searchParams: Promise<Record<string, string | undefined>>;
  forceLocale: Locale;
}) {
  const params = await searchParams;
  const keyword = params.q;
  const categoryId = params.category;
  const sort = params.sort;
  const t = getDictionary(forceLocale);
  const breadcrumbSchema = buildBreadcrumbSchema({
    items: [
      { name: t.nav.home, path: forceLocale === "en" ? "/en" : "/" },
      { name: t.listing.skillLearningTitle, path: forceLocale === "en" ? "/en/skill-learning" : "/skill-learning" }
    ]
  });
  const [categories, tools] = await Promise.all([
    getPublicToolCategories("skill_learning"),
    getPublicToolListing("skill_learning", categoryId, keyword, undefined, sort)
  ]);

  return (
    <Container className="py-14">
      <StructuredData data={breadcrumbSchema} />
      <SectionTitle as="h1" title={t.listing.skillLearningTitle} intro={t.listing.skillLearningIntro} />
      <SkillLearningGeoBlock forceLocale={forceLocale} />
      <FilterBar categories={categories} locale={forceLocale} />
      {tools.length ? (
        <div className="mt-8 grid gap-5 md:grid-cols-3">{tools.map((tool) => <ToolCard key={tool.id} tool={tool} locale={forceLocale} />)}</div>
      ) : (
        <EmptyState title={t.listing.emptyTitle} text={t.listing.emptyText} />
      )}
    </Container>
  );
}

function SkillLearningGeoBlock({ forceLocale }: { forceLocale: Locale }) {
  const sections = skillLearningGeoSections[forceLocale];
  const links = [
    { label: { zh: "先看 AI 前沿趋势", en: "Read AI trends first" }, href: buildLocalePath("/ai-news", forceLocale) },
    { label: { zh: "选择 AI 软件应用", en: "Choose AI software apps" }, href: buildLocalePath("/software", forceLocale) },
    { label: { zh: "了解 AI 账号服务", en: "Review account service guidance" }, href: buildLocalePath("/account-services", forceLocale) }
  ];

  return (
    <section className="glass mt-8 rounded-2xl p-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {sections.map((section) => (
          <article key={section.title} className="rounded-2xl border border-white/10 bg-white/8 p-5">
            <h2 className="text-lg font-black leading-snug text-[var(--marketing-text)]">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--marketing-muted)]">{section.body}</p>
          </article>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full border border-white/14 bg-white/7 px-4 py-2 text-sm font-bold text-[var(--marketing-text)] transition hover:border-[var(--marketing-accent)] hover:text-[var(--marketing-accent)]"
          >
            {item.label[forceLocale]}
          </Link>
        ))}
      </div>
    </section>
  );
}

function FilterBar({ categories, locale }: { categories: { id: string; name: string }[]; locale: Locale }) {
  const t = getDictionary(locale);

  return (
    <form className="filter-surface grid gap-3 md:grid-cols-[1fr_180px_140px]">
      <input name="q" placeholder={t.listing.searchPlaceholder} className="form-control-dark" />
      <select name="category" className="form-select-dark">
        <option value="">{t.listing.allCategories}</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {resolveLocalizedToolCategoryName(category.name, "skill_learning", locale)}
          </option>
        ))}
      </select>
      <select name="sort" className="form-select-dark">
        <option value="latest">{t.listing.latest}</option>
        <option value="hot">{t.listing.hot}</option>
      </select>
      <button className="rounded-full bg-[#050505] px-5 py-3 font-bold text-white transition hover:bg-[#161616] md:col-span-3">{t.listing.filter}</button>
    </form>
  );
}
