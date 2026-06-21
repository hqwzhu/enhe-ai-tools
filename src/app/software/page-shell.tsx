import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/structured-data";
import { Container, EmptyState, SectionTitle } from "@/components/ui";
import { ToolCard } from "@/components/tool-card";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import {
  getPublicToolCategories,
  getPublicToolListing,
} from "@/lib/public-content";
import { publicPageCacheSeconds } from "@/lib/public-routes";
import { resolveLocalizedToolCategoryName } from "@/lib/tool-localization";
import {
  buildBreadcrumbSchema,
  buildListingMetaDescription,
  buildLocalePath,
  buildMetadataTitle,
  buildPageMetadata,
} from "@/lib/seo";

export const softwarePageRevalidate = publicPageCacheSeconds;

const softwareGeoSections = {
  zh: [
    {
      title: "如何选择AI软件应用",
      body: "先判断任务类型，再看部署方式、学习成本、交付结果和价格边界。适合日常高频使用的软件，应优先解决明确任务，例如文档整理、内容创作、自动化流程、本地部署或素材处理。",
    },
    {
      title: "适合哪些使用场景",
      body: "AI软件应用适合创作者、运营人员、自由职业者、中小团队和个人学习者，用来把重复工作变成可复用流程。选择工具时，建议同时查看教程和案例，确认它能真正嵌入你的工作流。",
    },
    {
      title: "下一步如何落地",
      body: "如果你还不确定方向，可以先阅读AI前沿资讯判断趋势，再进入AI技能学习补齐方法，最后选择对应的软件应用完成交付。这样能减少盲目试用，把工具选择和真实成果连接起来。",
    },
  ],
  en: [
    {
      title: "How to choose AI software apps",
      body: "Start with the task, then compare deployment needs, learning cost, output quality, and pricing boundaries. Useful AI apps should solve a clear job such as writing, automation, local deployment, content production, or asset processing.",
    },
    {
      title: "Best-fit use cases",
      body: "AI software apps are useful for creators, operators, freelancers, small teams, and learners who want repeatable workflows instead of one-off experiments. Review tutorials and examples before adopting a tool.",
    },
    {
      title: "How to turn tools into outcomes",
      body: "If the direction is unclear, read AI news to understand the trend, learn the workflow through AI skill courses, then choose the matching software app to produce a concrete deliverable.",
    },
  ],
} as const;

export async function generateSoftwarePageMetadata(
  forceLocale: Locale,
): Promise<Metadata> {
  const t = getDictionary(forceLocale);
  return buildPageMetadata({
    title: buildMetadataTitle({
      pageTitle: t.listing.softwareTitle,
      brand: t.brand,
    }),
    description: buildListingMetaDescription("software", forceLocale),
    path: "/software",
    locale: forceLocale === "en" ? "en_US" : "zh_CN",
    localeKey: forceLocale,
  });
}

export async function SoftwarePageShell({
  searchParams,
  forceLocale,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
  forceLocale: Locale;
}) {
  const params = await searchParams;
  const keyword = params.q;
  const categoryId = params.category;
  const paid = params.paid;
  const sort = params.sort;
  const t = getDictionary(forceLocale);
  const breadcrumbSchema = buildBreadcrumbSchema({
    schemaType: "BreadcrumbList",
    items: [
      { name: t.nav.home, path: forceLocale === "en" ? "/en" : "/" },
      {
        name: t.listing.softwareTitle,
        path: forceLocale === "en" ? "/en/software" : "/software",
      },
    ],
  });
  const [categories, tools] = await Promise.all([
    getPublicToolCategories("software"),
    getPublicToolListing("software", categoryId, keyword, paid, sort),
  ]);

  return (
    <main>
      <Container className="py-14">
        <StructuredData data={breadcrumbSchema} />
        <SectionTitle
          as="h1"
          title={t.listing.softwareTitle}
          intro={t.listing.softwareIntro}
        />
        <SoftwareGeoBlock forceLocale={forceLocale} />
        <FilterBar categories={categories} locale={forceLocale} />
        {tools.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} locale={forceLocale} />
            ))}
          </div>
        ) : (
          <EmptyState title={t.listing.emptyTitle} text={t.listing.emptyText} />
        )}
      </Container>
    </main>
  );
}

function SoftwareGeoBlock({ forceLocale }: { forceLocale: Locale }) {
  const sections = softwareGeoSections[forceLocale];
  const links = [
    {
      label: { zh: "学习 AI 技能教程", en: "Learn AI skill courses" },
      href: buildLocalePath("/skill-learning", forceLocale),
    },
    {
      label: { zh: "查看 AI 前沿资讯", en: "Read AI news" },
      href: buildLocalePath("/ai-news", forceLocale),
    },
    {
      label: { zh: "了解 AI 账号服务", en: "Review account services" },
      href: buildLocalePath("/account-services", forceLocale),
    },
  ];

  return (
    <section className="glass mt-8 rounded-2xl p-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {sections.map((section) => (
          <article
            key={section.title}
            className="rounded-2xl border border-white/10 bg-white/8 p-5"
          >
            <h2 className="text-lg font-black leading-snug text-[var(--marketing-text)]">
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--marketing-muted)]">
              {section.body}
            </p>
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

function FilterBar({
  categories,
  locale,
}: {
  categories: { id: string; name: string }[];
  locale: Locale;
}) {
  const t = getDictionary(locale);

  return (
    <form className="filter-surface grid gap-3 md:grid-cols-[1fr_180px_160px_140px]">
      <input
        name="q"
        placeholder={t.listing.searchPlaceholder}
        className="form-control-dark"
      />
      <select name="category" className="form-select-dark">
        <option value="">{t.listing.allCategories}</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {resolveLocalizedToolCategoryName(
              category.name,
              "software",
              locale,
            )}
          </option>
        ))}
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
      <button className="rounded-full bg-[#050505] px-5 py-3 font-bold text-white transition hover:bg-[#161616] md:col-span-4">
        {t.listing.filter}
      </button>
    </form>
  );
}
