import type { Metadata } from "next";
import Link from "next/link";
import { BuildYourOwnXNavigator } from "@/components/build-your-own-x-navigator";
import { StructuredData } from "@/components/structured-data";
import { Container } from "@/components/ui";
import type { Locale } from "@/lib/dictionaries";
import {
  buildYourOwnXCategories,
  buildYourOwnXJsonLd,
  buildYourOwnXProjects,
  buildYourOwnXRoutes,
  buildYourOwnXSource,
  getBuildYourOwnXStats,
  getBuildYourOwnXTopLanguages,
} from "@/lib/build-your-own-x";
import {
  absoluteUrl,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildLocalePath,
  buildMetadataTitle,
  buildPageMetadata,
} from "@/lib/seo";

const pageText = {
  zh: {
    title: "Build Your Own X 项目导航器",
    metaTitle: "Build Your Own X 项目导航器",
    description:
      "免费开发者项目导航工具，按目标、语言、难度和时间筛选从零实现类开源教程，并生成可复制的 AI 学习计划 Prompt。",
    eyebrow: "免费开发者工具",
    heroTitle: "把 300+ 个硬核项目教程，变成可执行的学习路线。",
    heroIntro:
      "不是再收藏一堆链接，而是先确定目标、时间和技术栈，再选择最值得动手的项目。适合准备面试、补齐 CS 基础、做作品集，或者把 AI 与工程能力真正落到代码里。",
    start: "开始筛选项目",
    source: "查看开源仓库",
    stats: {
      projects: "项目链接",
      categories: "技术分类",
      languages: "语言筛选",
      routes: "推荐路线",
    },
    answerTitle: "这个免费工具能解决什么问题？",
    answer:
      "Build Your Own X 项目导航器会把 codecrafters-io/build-your-own-x 仓库里的公开教程链接整理成可筛选索引。你可以按学习目标、编程语言、难度、时间预算和项目路线快速缩小范围，再复制一段 AI Prompt，让 AI 帮你生成个人项目计划。本站只做导航和学习规划，不复制第三方教程正文，也不向用户收费。",
    routeTitle: "先选路线，再选项目",
    routeIntro:
      "路线不是课程，而是减少选择成本的入口。每条路线都对应一组更适合连续学习的项目类型。",
    faqTitle: "常见问题",
    sourceTitle: "来源和合规说明",
    sourceIntro:
      "本页索引来自公开 GitHub 仓库，只保留项目标题、分类、语言、链接和本站原创的筛选标签。具体教程内容、授权和更新以原始链接为准。",
    relatedTitle: "下一步可以继续看",
    related: [
      { href: "/skill-learning", label: "AI 技能学习" },
      { href: "/tutorials", label: "实用教程" },
      { href: "/ai-news", label: "AI 前沿资讯" },
    ],
  },
  en: {
    title: "Build Your Own X Navigator",
    metaTitle: "Build Your Own X Navigator",
    description:
      "A free developer project navigator that filters Build Your Own X tutorials by goal, language, difficulty, time budget, and route, then generates an AI learning-plan prompt.",
    eyebrow: "Free developer tool",
    heroTitle: "Turn 300+ hard-core project tutorials into an executable learning route.",
    heroIntro:
      "Instead of bookmarking another list, define your goal, time budget, and stack first. Use it for interviews, CS fundamentals, portfolio projects, or practical AI engineering growth.",
    start: "Start filtering",
    source: "View source repository",
    stats: {
      projects: "Project links",
      categories: "Tech categories",
      languages: "Language filters",
      routes: "Curated routes",
    },
    answerTitle: "What does this free tool solve?",
    answer:
      "Build Your Own X Navigator turns the public codecrafters-io/build-your-own-x repository into a searchable project index. You can filter by learning goal, programming language, difficulty, time budget, and route, then copy an AI prompt for a personal project plan. ENHE AI indexes links and adds original planning metadata. It does not republish third-party tutorial bodies or charge users.",
    routeTitle: "Choose a route before choosing a project",
    routeIntro:
      "Routes are not courses. They reduce choice cost by grouping project types that work well as a continuous learning path.",
    faqTitle: "FAQ",
    sourceTitle: "Source and compliance note",
    sourceIntro:
      "This page indexes public GitHub links and stores only titles, categories, languages, URLs, and ENHE AI planning labels. Tutorial content, licenses, and updates remain with the original source links.",
    relatedTitle: "Useful next pages",
    related: [
      { href: "/skill-learning", label: "AI skill learning" },
      { href: "/tutorials", label: "Tutorials" },
      { href: "/ai-news", label: "AI news" },
    ],
  },
} as const;

const faqItems = {
  zh: [
    {
      question: "Build Your Own X 项目导航器是免费的吗？",
      answer:
        "是。这个工具完全免费，不需要登录、订阅或付费。它的目标是帮助开发者更快找到适合自己的开源项目教程，同时为 ENHE AI 带来自然搜索流量。",
    },
    {
      question: "它和原始 GitHub 仓库是什么关系？",
      answer:
        "本页基于 codecrafters-io/build-your-own-x 的公开链接做导航索引，并保留原始教程链接。本站不复制教程正文，具体内容和授权以原仓库及教程来源为准。",
    },
    {
      question: "我应该怎么选择第一个项目？",
      answer:
        "先选学习目标，再选熟悉的语言和可投入时间。如果是补基础，优先选 Shell、数据库、Web Server 或解释器；如果是作品集，优先选能展示完整交付结果的项目。",
    },
    {
      question: "AI Prompt 生成器有什么用？",
      answer:
        "它会把你的筛选条件和候选项目整理成一段提示词。复制到常用 AI 助手后，可以生成个人学习计划、每日任务、简历描述和面试讲解思路。",
    },
  ],
  en: [
    {
      question: "Is Build Your Own X Navigator free?",
      answer:
        "Yes. It is free, does not require login, and does not sell a subscription. The goal is to help developers find suitable open-source project tutorials while bringing organic traffic to ENHE AI.",
    },
    {
      question: "How is it related to the original GitHub repository?",
      answer:
        "This page indexes public links from codecrafters-io/build-your-own-x and keeps users going to original tutorials. ENHE AI does not copy tutorial bodies. Content and licenses remain with each original source.",
    },
    {
      question: "How should I choose my first project?",
      answer:
        "Start with your learning goal, then choose a familiar language and realistic time budget. For fundamentals, start with Shell, Database, Web Server, or Interpreter. For portfolio work, choose projects with a clear final deliverable.",
    },
    {
      question: "What is the AI prompt generator for?",
      answer:
        "It converts your filters and candidate projects into a prompt you can paste into an AI assistant to get a personal learning plan, daily tasks, resume bullet, and interview explanation.",
    },
  ],
} as const;

export async function generateBuildYourOwnXPageMetadata(
  forceLocale: Locale,
): Promise<Metadata> {
  const text = pageText[forceLocale];
  return buildPageMetadata({
    title: buildMetadataTitle({
      pageTitle: text.metaTitle,
    }),
    description: text.description,
    path: "/build-your-own-x",
    locale: forceLocale === "en" ? "en_US" : "zh_CN",
    localeKey: forceLocale,
  });
}

export function BuildYourOwnXPageShell({ forceLocale }: { forceLocale: Locale }) {
  const text = pageText[forceLocale];
  const stats = getBuildYourOwnXStats();
  const jsonLd = buildYourOwnXJsonLd();
  const breadcrumbSchema = buildBreadcrumbSchema({
    items: [
      { name: forceLocale === "en" ? "Home" : "首页", path: buildLocalePath("/", forceLocale) },
      { name: text.title, path: buildLocalePath("/build-your-own-x", forceLocale) },
    ],
  });
  const faqSchema = buildFaqSchema({ items: faqItems[forceLocale] });
  const routeListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: text.title,
    description: text.description,
    url: absoluteUrl(buildLocalePath("/build-your-own-x", forceLocale)),
    inLanguage: forceLocale === "en" ? "en-US" : "zh-CN",
    isAccessibleForFree: true,
    about: [
      "Build Your Own X",
      "developer projects",
      "computer science projects",
      "AI learning plan",
      "open source tutorials",
    ],
    citation: {
      "@type": "CreativeWork",
      name: buildYourOwnXSource.repository,
      url: buildYourOwnXSource.url,
    },
  };

  const statItems = [
    { value: stats.projectCount, label: text.stats.projects },
    { value: stats.categoryCount, label: text.stats.categories },
    { value: stats.languageCount, label: text.stats.languages },
    { value: stats.routeCount, label: text.stats.routes },
  ];

  return (
    <main className="byox-page">
      <StructuredData data={[breadcrumbSchema, jsonLd.webApplication, jsonLd.itemList, routeListSchema, faqSchema]} />
      <Container className="byox-container">
        <section className="byox-hero">
          <div className="byox-hero-copy">
            <p className="byox-eyebrow">{text.eyebrow}</p>
            <h1>{text.heroTitle}</h1>
            <p>{text.heroIntro}</p>
            <div className="byox-hero-actions">
              <a href="#navigator" className="byox-primary-link">
                {text.start}
              </a>
              <a href={buildYourOwnXSource.url} target="_blank" rel="noreferrer" className="byox-secondary-link">
                {text.source}
              </a>
            </div>
          </div>
          <div className="byox-stat-grid" aria-label={forceLocale === "en" ? "Navigator stats" : "导航器数据"}>
            {statItems.map((item) => (
              <div key={item.label} className="byox-stat-card">
                <strong>{item.value}+</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="byox-answer surface-panel">
          <h2>{text.answerTitle}</h2>
          <p>{text.answer}</p>
        </section>

        <BuildYourOwnXNavigator
          locale={forceLocale}
          projects={buildYourOwnXProjects}
          routes={buildYourOwnXRoutes}
          categories={buildYourOwnXCategories}
          languages={getBuildYourOwnXTopLanguages()}
        />

        <section className="byox-route-section">
          <div className="byox-section-heading">
            <h2>{text.routeTitle}</h2>
            <p>{text.routeIntro}</p>
          </div>
          <div className="byox-route-grid">
            {buildYourOwnXRoutes.map((route) => (
              <article key={route.slug} className="byox-route-card">
                <h3>{forceLocale === "en" ? route.titleEn : route.title}</h3>
                <p>{forceLocale === "en" ? route.summaryEn : route.summary}</p>
                <a href={`#route-${route.slug}`}>
                  {forceLocale === "en" ? "Use this route" : "使用这条路线"}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="byox-support-grid">
          <div className="byox-support-card surface-panel">
            <h2>{text.faqTitle}</h2>
            <div className="byox-faq-list">
              {faqItems[forceLocale].map((item) => (
                <article key={item.question}>
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
          <aside className="byox-support-card surface-panel-soft">
            <h2>{text.sourceTitle}</h2>
            <p>{text.sourceIntro}</p>
            <dl className="byox-source-list">
              <div>
                <dt>Repository</dt>
                <dd>
                  <a href={buildYourOwnXSource.url} target="_blank" rel="noreferrer">
                    {buildYourOwnXSource.repository}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Snapshot</dt>
                <dd>{buildYourOwnXSource.snapshotDate}</dd>
              </div>
              <div>
                <dt>Scope</dt>
                <dd>{buildYourOwnXSource.licenseNote}</dd>
              </div>
            </dl>
            <h3>{text.relatedTitle}</h3>
            <div className="byox-related-links">
              {text.related.map((item) => (
                <Link key={item.href} href={buildLocalePath(item.href, forceLocale)}>
                  {item.label}
                </Link>
              ))}
            </div>
          </aside>
        </section>
      </Container>
    </main>
  );
}
