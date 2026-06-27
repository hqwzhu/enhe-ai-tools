import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ScrollVelocity } from "@/components/scroll-velocity";
import { StructuredData } from "@/components/structured-data";
import { ButtonLink, Container } from "@/components/ui";
import { ToolCard } from "@/components/tool-card";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { getHomeRecommendedTools } from "@/lib/public-content";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildHomeMetaDescription,
  buildHomeMetadataTitle,
  buildLocalePath,
  buildPageMetadata,
  absoluteUrl,
} from "@/lib/seo";
import { publicPageCacheSeconds } from "@/lib/public-routes";
import { getEffectiveLocalizedHomeHeroIntro, getEffectiveHomeHeroTitle, getSettingsMap } from "@/lib/settings";

export const publicPageRevalidate = publicPageCacheSeconds;

const homeFaqItems = {
  zh: [
    {
      question: "恩禾 ENHE AI 是什么？",
      answer:
        "恩禾 ENHE AI 是面向中文用户的 AI 工具与技能学习平台，聚合 AI前沿资讯、AI趋势分析、AI软件应用、AI账号服务、AI技能学习和使用教程，帮助用户把 AI 信息转化为可执行成果。",
    },
    {
      question: "新用户应该从哪里开始使用 ENHE AI？",
      answer:
        "如果还不确定方向，建议先看 AI前沿资讯和趋势分析；如果已有明确任务，可以直接进入 AI软件应用或 AI技能学习，再根据访问和订阅需求查看 AI账号服务。",
    },
    {
      question: "ENHE AI 如何帮助用户提升 AI 工具转化率？",
      answer:
        "ENHE AI 把趋势、工具、教程、课程和账号服务连接起来，让用户从判断需求开始，逐步完成工具选择、方法学习、实际交付和合规使用确认。",
    },
  ],
  en: [
    {
      question: "What is ENHE AI?",
      answer:
        "ENHE AI is an AI tools and skill-learning platform for Chinese users. It brings together AI news, trend analysis, software apps, account service guidance, skill courses, and tutorials so users can turn AI information into practical outcomes.",
    },
    {
      question: "Where should new users start on ENHE AI?",
      answer:
        "If the direction is unclear, start with AI news and trend analysis. If the task is already clear, go to AI software apps or AI skill learning, then review account-service guidance when access or subscription support is needed.",
    },
    {
      question: "How does ENHE AI help users convert AI tools into results?",
      answer:
        "ENHE AI connects trends, tools, tutorials, courses, and account guidance so users can move from demand judgment to tool choice, skill learning, practical delivery, and compliant usage.",
    },
  ],
} as const;

const creatorOutcomeCards = {
  zh: [
    {
      title: "写作与内容发布",
      description: "从选题、资料、脚本到发布，先找到能直接进入产出的 AI 工具。",
      href: "/software",
      action: "找内容工具",
    },
    {
      title: "视频与图像创作",
      description: "为短视频、封面、素材处理和视觉生产选择合适的 AI 工作流。",
      href: "/software",
      action: "看创作工具",
    },
    {
      title: "本地部署与开发",
      description: "用项目路线补齐工程能力，把 AI 学习落到可展示作品里。",
      href: "/build-your-own-x",
      action: "选项目路线",
    },
    {
      title: "自动化与 Agent",
      description: "学习提示词、自动化流程和实战课程，把重复任务交给 AI。",
      href: "/skill-learning",
      action: "学工作流",
    },
    {
      title: "效率工具与账号访问",
      description: "确认工具价格、访问方式、服务边界和使用前注意事项。",
      href: "/account-services",
      action: "查服务说明",
    },
  ],
  en: [
    {
      title: "Writing and publishing",
      description: "Move from idea, research, script, and publishing with AI tools that reach output faster.",
      href: "/software",
      action: "Find content tools",
    },
    {
      title: "Video and image creation",
      description: "Choose practical AI workflows for short video, covers, assets, and visual production.",
      href: "/software",
      action: "Explore creator tools",
    },
    {
      title: "Local AI and development",
      description: "Use project routes to build engineering skill and turn AI learning into portfolio work.",
      href: "/build-your-own-x",
      action: "Choose a project route",
    },
    {
      title: "Automation and agents",
      description: "Learn prompts, automation flows, and practical courses for repetitive AI-powered work.",
      href: "/skill-learning",
      action: "Learn workflows",
    },
    {
      title: "Productivity and access",
      description: "Review pricing, access paths, service boundaries, and usage notes before choosing tools.",
      href: "/account-services",
      action: "Check service notes",
    },
  ],
} as const;

const creatorWorkflowSteps = {
  zh: [
    { title: "先看趋势", description: "用 AI 资讯和趋势日报判断机会窗口。", href: "/ai-news", action: "看 AI 资讯" },
    { title: "再选工具", description: "按任务选择软件、插件和本地部署工具。", href: "/software", action: "选 AI 工具" },
    { title: "学习方法", description: "用课程和教程把工具变成稳定流程。", href: "/skill-learning", action: "学 AI 技能" },
    { title: "确认访问", description: "购买前检查账号服务、价格和交付规则。", href: "/pricing", action: "看价格说明" },
    { title: "动手构建", description: "从 Build Your Own X 选择项目，做成可展示作品。", href: "/build-your-own-x", action: "开始构建" },
    { title: "复盘教程", description: "用实用教程解决配置、下载、使用和复盘问题。", href: "/tutorials", action: "读教程" },
    { title: "跟踪趋势", description: "用 AI 趋势页持续观察新模型、产品和需求变化。", href: "/ai-trends", action: "看趋势" },
  ],
  en: [
    { title: "Read the signal", description: "Use AI news and trend briefings to find useful timing.", href: "/ai-news", action: "Read AI news" },
    { title: "Choose tools", description: "Pick software, plugins, and local AI tools by task.", href: "/software", action: "Choose AI tools" },
    { title: "Learn methods", description: "Turn tools into repeatable workflows with courses and tutorials.", href: "/skill-learning", action: "Learn AI skills" },
    { title: "Check access", description: "Review account services, pricing, delivery, and purchase rules first.", href: "/pricing", action: "Review pricing" },
    { title: "Build projects", description: "Use Build Your Own X to choose a project and create portfolio proof.", href: "/build-your-own-x", action: "Start building" },
    { title: "Review guides", description: "Use tutorials to solve setup, download, usage, and review questions.", href: "/tutorials", action: "Read tutorials" },
    { title: "Track trends", description: "Follow AI Trends for new model, product, and demand changes.", href: "/ai-trends", action: "View trends" },
  ],
} as const;

const buildYourOwnXSpotlight = {
  zh: {
    title: "免费项目导航：Build Your Own X",
    description: "从 300+ 开源项目教程里筛选适合你的路线，用 AI 生成学习计划，把收藏变成可执行任务。",
    primary: "打开项目导航器",
    secondary: "继续看实用教程",
  },
  en: {
    title: "Free project navigator: Build Your Own X",
    description: "Filter 300+ open-source project tutorials, generate an AI learning plan, and turn bookmarks into executable tasks.",
    primary: "Open navigator",
    secondary: "Read tutorials",
  },
} as const;

export async function generateHomePageMetadata(forceLocale: Locale): Promise<Metadata> {
  const settings = await getSettingsMap();
  const t = getDictionary(forceLocale);
  return buildPageMetadata({
    title: buildHomeMetadataTitle(forceLocale, t.brand),
    description: buildHomeMetaDescription(forceLocale, getEffectiveLocalizedHomeHeroIntro(settings, forceLocale, t.home.intro)),
    path: "/",
    locale: forceLocale === "en" ? "en_US" : "zh_CN",
    localeKey: forceLocale
  });
}

export async function HomePageShell({ forceLocale }: { forceLocale: Locale }) {
  const [recommendedTools, settings] = await Promise.all([getHomeRecommendedTools(), getSettingsMap()]);
  const t = getDictionary(forceLocale);
  const heroTitle = getEffectiveHomeHeroTitle(settings, t.home.title);
  const heroTitleWordmark = /^ENHE\s+AI$/i.test(heroTitle.trim());
  const heroVelocityTexts =
    forceLocale === "en"
      ? [t.home.titleSecondLineEn]
      : [t.home.titleSecondLine, t.home.titleSecondLineEn];
  const breadcrumbSchema = buildBreadcrumbSchema({
    items: [{ name: t.nav.home, path: buildLocalePath("/", forceLocale) }],
  });
  const faqSchema = buildFaqSchema({ items: homeFaqItems[forceLocale] });
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t.brand,
    description: t.home.positioning,
    url: absoluteUrl(buildLocalePath("/", forceLocale)),
    inLanguage: forceLocale === "en" ? "en-US" : "zh-CN",
    mainEntity: {
      "@type": "Organization",
      name: "ENHE AI",
      description: t.home.positioning,
      url: absoluteUrl(buildLocalePath("/", forceLocale)),
    },
  };

  return (
    <main className="home-page-shell">
      <StructuredData data={[breadcrumbSchema, webPageSchema, faqSchema]} />
      <section className="home-hero-shell">
        <Container className="home-hero-reference-frame">
          <div className="home-hero-stage">
            <div className="home-hero-centered">
              <h1 className="home-hero-title">
                <span
                  className={`home-hero-title-glitch${heroTitleWordmark ? " home-hero-title-glitch-wordmark" : ""}`}
                  data-text={heroTitle}
                >
                  {heroTitleWordmark ? (
                    <>
                      <span className="home-hero-title-wordmark-accent">E</span>
                      <span className="home-hero-title-wordmark-letter">N</span>
                      <span className="home-hero-title-wordmark-letter home-hero-title-wordmark-slice">H</span>
                      <span className="home-hero-title-wordmark-letter">E</span>{" "}
                      <span className="home-hero-title-wordmark-accent">A</span>
                      <span className="home-hero-title-wordmark-letter">I</span>
                    </>
                  ) : (
                    heroTitle
                  )}
                </span>
                <span className="sr-only"> {heroVelocityTexts.join(" ")}</span>
              </h1>
              <div className="home-hero-title-emphasis" aria-hidden="true">
                <ScrollVelocity
                  texts={heroVelocityTexts}
                  className="home-hero-velocity-copy"
                  parallaxClassName="home-hero-velocity-parallax"
                  scrollerClassName="home-hero-velocity-scroller"
                />
              </div>

              <p className="home-hero-positioning">{t.home.positioning}</p>

              <div className="home-hero-actions">
                <ButtonLink href={buildLocalePath("/software", forceLocale)} variant="primary" className="home-hero-cta home-hero-cta-primary">
                  {t.home.softwareButton}
                </ButtonLink>
                <ButtonLink href={buildLocalePath("/build-your-own-x", forceLocale)} variant="ghost" className="home-hero-cta home-hero-cta-accent">
                  {forceLocale === "en" ? "Choose a creator path" : "选择创作路径"}
                </ButtonLink>
              </div>

              <div className="home-hero-path-strip" aria-label={forceLocale === "en" ? "ENHE AI section guide" : "ENHE AI 栏目导航"}>
                {[
                  { label: t.home.aiNewsButton, note: forceLocale === "en" ? "Read the signal" : "先看趋势", href: "/ai-news" },
                  { label: t.home.softwareButton, note: forceLocale === "en" ? "Choose tools" : "再选工具", href: "/software" },
                  { label: t.home.skillLearningButton, note: forceLocale === "en" ? "Learn workflows" : "学习方法", href: "/skill-learning" },
                  { label: t.home.onlineButton, note: forceLocale === "en" ? "Check access" : "确认访问", href: "/account-services" },
                ].map((item) => (
                  <Link key={item.href} href={buildLocalePath(item.href, forceLocale)} className="home-hero-path-link">
                    <span>{item.note}</span>
                    <strong>{item.label}</strong>
                  </Link>
                ))}
              </div>

            </div>
          </div>
        </Container>
      </section>

      <section className="home-outcome-shell" aria-labelledby="home-outcome-title">
        <Container className="home-hero-reference-frame">
          <div className="home-section-heading">
            <h2 id="home-outcome-title">{forceLocale === "en" ? "Start by outcome" : "按目标开始"}</h2>
            <p>
              {forceLocale === "en"
                ? "Choose the job you want AI to help with, then enter the right ENHE AI path."
                : "先选你想完成的任务，再进入对应的 ENHE AI 路径。"}
            </p>
          </div>
          <div className="home-outcome-grid">
            {creatorOutcomeCards[forceLocale].map((item) => (
              <Link key={item.title} href={buildLocalePath(item.href, forceLocale)} className="home-outcome-card">
                <span>{item.action}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="home-workflow-shell" aria-labelledby="home-workflow-title">
        <Container className="home-hero-reference-frame">
          <div className="home-workflow-panel">
            <div className="home-section-heading">
              <h2 id="home-workflow-title">{forceLocale === "en" ? "From signal to shipped work" : "从趋势信号到交付成果"}</h2>
              <p>
                {forceLocale === "en"
                  ? "ENHE AI connects discovery, selection, learning, access checks, and practice into one creator workflow."
                  : "ENHE AI 把趋势发现、工具选择、方法学习、访问确认和项目练习连成一条创作者工作流。"}
              </p>
            </div>
            <div className="home-workflow-grid">
              {creatorWorkflowSteps[forceLocale].map((item) => (
                <Link key={item.title} href={buildLocalePath(item.href, forceLocale)} className="home-workflow-step">
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                  <em>{item.action}</em>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="home-byox-shell" aria-labelledby="home-byox-title">
        <Container className="home-hero-reference-frame">
          <div className="home-byox-spotlight">
            <div>
              <h2 id="home-byox-title">{buildYourOwnXSpotlight[forceLocale].title}</h2>
              <p>{buildYourOwnXSpotlight[forceLocale].description}</p>
            </div>
            <div className="home-byox-actions">
              <ButtonLink href={buildLocalePath("/build-your-own-x", forceLocale)} variant="primary">
                {buildYourOwnXSpotlight[forceLocale].primary}
              </ButtonLink>
              <ButtonLink href={buildLocalePath("/tutorials", forceLocale)} variant="ghost">
                {buildYourOwnXSpotlight[forceLocale].secondary}
                <ArrowUpRight size={16} />
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section id="updates" className="home-featured-shell" aria-label="ENHE AI recommended content preview">
        <Container className="home-hero-reference-frame">
          <div className="home-product-preview backdrop-blur-xl backdrop-saturate-150">
            <div className="home-product-preview-header">
              <div>
                <p>{t.home.featuredContentTitle}</p>
                <h2>{t.home.featuredContentIntro}</h2>
              </div>
            </div>
            {recommendedTools.length > 0 ? (
              <div className="home-recommended-tool-grid">
                {recommendedTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} locale={forceLocale} variant="homeFeatured" />
                ))}
              </div>
            ) : (
              <div className="home-fallback-link-grid">
                {[
                  { label: t.home.aiNewsButton, href: forceLocale === "en" ? "/en/ai-news" : "/ai-news" },
                  { label: t.home.softwareButton, href: forceLocale === "en" ? "/en/software" : "/software" },
                  { label: t.home.onlineButton, href: forceLocale === "en" ? "/en/account-services" : "/account-services" },
                  { label: t.home.skillLearningButton, href: forceLocale === "en" ? "/en/skill-learning" : "/skill-learning" }
                ].map((item) => (
                  <ButtonLink key={item.href} href={item.href} variant="ghost" className="home-fallback-link">
                    {item.label}
                    <ArrowUpRight size={16} />
                  </ButtonLink>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>
    </main>
  );
}
