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
  absoluteUrl,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildListingMetaDescription,
  buildLocalePath,
  buildMetadataTitle,
  buildPageMetadata,
} from "@/lib/seo";

export const accountServicesPageRevalidate = publicPageCacheSeconds;

const accountServicesGeoSections = {
  zh: [
    {
      title: "AI账号服务如何合规使用",
      body: "AI账号服务应围绕订阅咨询、账号使用支持、访问说明和平台规则提醒展开。使用第三方平台前，请以对应平台官方政策为准，避免把账号服务理解为绕过规则或替代官方授权。",
    },
    {
      title: "适合哪些用户咨询",
      body: "适合需要了解AI工具订阅、访问方式、使用边界、交付说明和售后范围的用户。对于企业、团队或长期使用者，建议先确认工具是否适合自己的工作流，再决定是否需要账号使用支持。",
    },
    {
      title: "如何与工具和课程配合",
      body: "账号服务不是孤立入口。更稳妥的路径是先选择AI软件应用，学习对应AI技能课程，再根据实际访问和订阅需求咨询账号服务，让工具、方法和合规使用形成闭环。",
    },
  ],
  en: [
    {
      title: "How to use AI account services compliantly",
      body: "AI account services should focus on subscription guidance, account usage support, access notes, and platform policy reminders. For third-party platforms, users should follow the official platform rules.",
    },
    {
      title: "Who should request guidance",
      body: "This section is for users who need clarity on AI tool subscriptions, access methods, delivery notes, after-sales boundaries, and usage constraints before adopting a tool.",
    },
    {
      title: "How services connect to tools and courses",
      body: "Account guidance works best after users choose the right AI software app and learn the workflow. The goal is to connect tools, skills, access support, and compliant usage.",
    },
  ],
} as const;

const accountServicesFaqItems = {
  zh: [
    {
      question: "AI账号服务适合解决什么问题？",
      answer:
        "AI账号服务适合在购买或使用 AI 工具前确认订阅方式、访问路径、交付说明、售后边界和平台规则提醒。它应该帮助用户合规理解工具使用，而不是替代官方授权或绕过平台限制。",
    },
    {
      question: "使用第三方 AI 平台账号服务要注意什么？",
      answer:
        "涉及第三方平台时，应以对应平台官方政策为准。用户需要确认服务范围、交付材料、退款规则、账号安全和数据边界，不应依赖共享账号、破解或保证不封号等高风险承诺。",
    },
    {
      question: "账号服务如何和软件、课程一起使用？",
      answer:
        "更稳妥的路径是先明确任务，再选择 AI 软件应用或 AI 技能课程，最后根据实际访问和订阅需求咨询账号服务。这样能把工具、学习和合规使用连接成完整工作流。",
    },
  ],
  en: [
    {
      question: "What does AI account service guidance help with?",
      answer:
        "AI account service guidance helps users understand subscription options, access paths, delivery notes, support boundaries, and platform policy reminders before adopting an AI tool.",
    },
    {
      question: "What should users check for third-party AI platforms?",
      answer:
        "For third-party AI platforms, the official platform policy should prevail. Users should review service scope, delivery notes, refund rules, account security, and data boundaries before purchase or use.",
    },
    {
      question: "How should account services connect with software and courses?",
      answer:
        "Users should first define the task, then choose suitable AI software or skill courses, and only then request account service guidance when access or subscription support is needed.",
    },
  ],
} as const;

const accountServicesDecisionBlock = {
  zh: {
    eyebrow: "咨询前先确认",
    title: "账号服务不是捷径，而是帮你把访问、订阅和平台规则先看清楚。",
    body:
      "在咨询 AI账号服务前，建议先确认你要使用哪个工具、需要完成什么任务、是否涉及第三方平台规则，以及是否已经阅读对应软件或课程页面。这样沟通会更快，也能减少不必要的试错。",
    checks: ["确认真实任务", "查看官方规则", "看清交付边界", "再决定是否咨询"],
  },
  en: {
    eyebrow: "Before asking for access",
    title: "Account guidance is not a shortcut. It helps you understand access, subscriptions, and platform rules first.",
    body:
      "Before requesting AI account service guidance, confirm the tool, the task, the third-party platform rules, and whether the related software or course page already answers your question.",
    checks: ["Confirm the task", "Review official rules", "Check delivery scope", "Then request guidance"],
  },
} as const;

function buildAccountServicesCollectionSchema(forceLocale: Locale) {
  const isEnglish = forceLocale === "en";
  const url = absoluteUrl(buildLocalePath("/account-services", forceLocale));

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: isEnglish ? "AI Account Services" : "AI账号服务",
    description: buildListingMetaDescription("account-services", forceLocale),
    url,
    inLanguage: isEnglish ? "en-US" : "zh-CN",
    mainEntity: {
      "@type": "Service",
      name: isEnglish
        ? "AI account service guidance"
        : "AI账号服务咨询",
      serviceType: isEnglish
        ? "AI account subscription and usage guidance"
        : "AI工具订阅与账号使用支持",
      provider: {
        "@type": "Organization",
        name: "ENHE AI",
      },
      areaServed: "CN",
      url,
    },
  };
}

export async function generateAccountServicesPageMetadata(
  forceLocale: Locale,
): Promise<Metadata> {
  const t = getDictionary(forceLocale);
  return buildPageMetadata({
    title: buildMetadataTitle({
      pageTitle: t.listing.onlineTitle,
      brand: t.brand,
    }),
    description: buildListingMetaDescription("account-services", forceLocale),
    path: "/account-services",
    locale: forceLocale === "en" ? "en_US" : "zh_CN",
    localeKey: forceLocale,
  });
}

export async function AccountServicesPageShell({
  searchParams,
  forceLocale,
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
      {
        name: t.listing.onlineTitle,
        path:
          forceLocale === "en" ? "/en/account-services" : "/account-services",
      },
    ],
  });
  const faqSchema = buildFaqSchema({
    items: accountServicesFaqItems[forceLocale],
  });
  const collectionSchema = buildAccountServicesCollectionSchema(forceLocale);
  const [categories, tools] = await Promise.all([
    getPublicToolCategories("online"),
    getPublicToolListing("online", categoryId, keyword, undefined, sort),
  ]);

  return (
    <main>
      <Container className="py-14">
        <StructuredData data={[breadcrumbSchema, collectionSchema, faqSchema]} />
        <SectionTitle
          as="h1"
          title={t.listing.onlineTitle}
          intro={t.listing.onlineIntro}
        />
        <ListingDecisionStrip forceLocale={forceLocale} />
        <ListingTrustNote forceLocale={forceLocale} />
        <FilterBar categories={categories} locale={forceLocale} />
        {tools.length ? (
          <div className="listing-grid mt-8 grid gap-5 md:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} locale={forceLocale} />
            ))}
          </div>
        ) : (
          <EmptyState title={t.listing.emptyTitle} text={t.listing.emptyText} />
        )}
        <ProductSeoDisclosure
          summary={
            forceLocale === "en"
              ? "Account service compliance guide and FAQ"
              : "账号服务合规说明与常见问题"
          }
        >
          <AccountServicesGeoBlock forceLocale={forceLocale} />
        </ProductSeoDisclosure>
      </Container>
    </main>
  );
}

function ListingDecisionStrip({ forceLocale }: { forceLocale: Locale }) {
  const items =
    forceLocale === "en"
      ? [
          {
            label: "Rules first",
            title: "Confirm platform policy",
            body: "Treat official platform rules as the final source before requesting service guidance.",
          },
          {
            label: "Delivery scope",
            title: "Check the boundary",
            body: "Review what is included, what is not, and how support is delivered.",
          },
          {
            label: "Then consult",
            title: "Ask with context",
            body: "Send the tool, task, and access need so the response can be precise.",
          },
        ]
      : [
          {
            label: "确认平台规则",
            title: "官方规则优先",
            body: "涉及第三方平台时，先以官方政策和使用边界为准。",
          },
          {
            label: "看交付边界",
            title: "明确服务范围",
            body: "先确认包含内容、排除事项、交付方式和售后规则。",
          },
          {
            label: "再咨询服务",
            title: "带着任务沟通",
            body: "说明工具、任务和访问需求，咨询效率会更高。",
          },
        ];

  return (
    <section
      className="listing-decision-strip"
      aria-label={
        forceLocale === "en"
          ? "Account service decision guide"
          : "账号服务决策提示"
      }
    >
      {items.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <strong>{item.title}</strong>
          <p>{item.body}</p>
        </div>
      ))}
    </section>
  );
}

function ListingTrustNote({ forceLocale }: { forceLocale: Locale }) {
  return (
    <p className="listing-trust-note">
      {forceLocale === "en"
        ? "Official platform rules remain the final source. Use service notes to confirm scope, delivery, and support boundaries."
        : "第三方平台以官方规则为准；服务说明只用于确认范围、交付和售后边界。"}
      <Link href={buildLocalePath("/ai-topics/ai-account-service-compliance", forceLocale)}>
        {forceLocale === "en" ? "Read compliance guide" : "查看合规指南"}
      </Link>
    </p>
  );
}

function ProductSeoDisclosure({
  summary,
  children,
}: React.PropsWithChildren<{ summary: string }>) {
  return (
    <details className="product-seo-disclosure">
      <summary>{summary}</summary>
      <div className="product-seo-disclosure-body">{children}</div>
    </details>
  );
}

function AccountServicesGeoBlock({ forceLocale }: { forceLocale: Locale }) {
  const sections = accountServicesGeoSections[forceLocale];
  const faqs = accountServicesFaqItems[forceLocale];
  const decision = accountServicesDecisionBlock[forceLocale];
  const links = [
    {
      label: { zh: "选择 AI 软件应用", en: "Choose AI software apps" },
      href: buildLocalePath("/software", forceLocale),
    },
    {
      label: { zh: "学习 AI 技能课程", en: "Learn AI skill courses" },
      href: buildLocalePath("/skill-learning", forceLocale),
    },
    {
      label: { zh: "阅读 AI 前沿资讯", en: "Read AI news" },
      href: buildLocalePath("/ai-news", forceLocale),
    },
    {
      label: { zh: "账号服务合规指南", en: "Account compliance guide" },
      href: buildLocalePath(
        "/ai-topics/ai-account-service-compliance",
        forceLocale,
      ),
    },
  ];

  return (
    <section className="glass rounded-2xl p-6">
      <div className="mb-5 rounded-2xl border border-[var(--marketing-accent)]/28 bg-[var(--marketing-accent)]/10 p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--marketing-accent)]">
          {decision.eyebrow}
        </p>
        <h2 className="mt-3 max-w-4xl text-2xl font-black leading-snug text-[var(--marketing-text)]">
          {decision.title}
        </h2>
        <p className="mt-3 max-w-4xl text-sm font-semibold leading-7 text-[var(--marketing-muted)]">
          {decision.body}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {decision.checks.map((check) => (
            <span key={check} className="rounded-full border border-white/14 bg-white/8 px-3 py-1 text-xs font-bold text-[var(--marketing-text)]">
              {check}
            </span>
          ))}
        </div>
      </div>
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
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {faqs.map((item) => (
          <article
            key={item.question}
            className="rounded-2xl border border-white/10 bg-white/7 p-5"
          >
            <h2 className="text-base font-black leading-snug text-[var(--marketing-text)]">
              {item.question}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--marketing-muted)]">
              {item.answer}
            </p>
          </article>
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
    <form className="filter-surface grid gap-3 md:grid-cols-[1fr_180px_140px]">
      <label className="sr-only" htmlFor="account-services-search">
        {t.listing.searchPlaceholder}
      </label>
      <input
        id="account-services-search"
        name="q"
        aria-label={t.listing.searchPlaceholder}
        placeholder={t.listing.searchPlaceholder}
        title={t.listing.searchPlaceholder}
        className="form-control-dark"
      />
      <label className="sr-only" htmlFor="account-services-category">
        {t.listing.allCategories}
      </label>
      <select
        id="account-services-category"
        name="category"
        aria-label={t.listing.allCategories}
        title={t.listing.allCategories}
        className="form-select-dark"
      >
        <option value="">{t.listing.allCategories}</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {resolveLocalizedToolCategoryName(category.name, "online", locale)}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor="account-services-sort">
        {t.listing.latest}
      </label>
      <select
        id="account-services-sort"
        name="sort"
        aria-label={t.listing.latest}
        title={t.listing.latest}
        className="form-select-dark"
      >
        <option value="latest">{t.listing.latest}</option>
        <option value="hot">{t.listing.hot}</option>
      </select>
      <button className="rounded-full bg-[#050505] px-5 py-3 font-bold text-white transition hover:bg-[#161616] md:col-span-3">
        {t.listing.filter}
      </button>
    </form>
  );
}
