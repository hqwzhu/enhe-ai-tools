import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StructuredData } from "@/components/structured-data";
import DecryptedText from "@/components/home/decrypted-text";
import { HomeParticlesBackground } from "@/components/home/home-particles-background";
import { ProductDemoCard } from "@/components/product-demo-card";
import { ButtonLink, Container } from "@/components/ui";
import { ToolCard } from "@/components/tool-card";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { getHomeRecommendedTools } from "@/lib/public-content";
import { getHomeProductDemos } from "@/lib/product-demos";
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
import { getEffectiveLocalizedHomeHeroIntro, getSettingsMap } from "@/lib/settings";

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

const homeProductPaths = {
  zh: [
    {
      title: "AI 软件应用",
      description: "本地部署、内容创作、效率工具和自动化软件，先按任务筛选。",
      href: "/software",
      action: "进入软件货架",
    },
    {
      title: "AI 技能学习",
      description: "提示词、工作流、课程和项目路线，把工具变成可复用能力。",
      href: "/skill-learning",
      action: "选择课程",
    },
    {
      title: "AI 账号服务",
      description: "购买前确认访问方式、服务边界、价格说明和平台规则。",
      href: "/account-services",
      action: "查看服务",
    },
  ],
  en: [
    {
      title: "AI Software Apps",
      description: "Local AI, creator tools, productivity apps, and automation software by task.",
      href: "/software",
      action: "Open software shelf",
    },
    {
      title: "AI Skill Learning",
      description: "Prompts, workflows, courses, and project routes for reusable AI skills.",
      href: "/skill-learning",
      action: "Choose courses",
    },
    {
      title: "AI Account Services",
      description: "Review access paths, service scope, pricing notes, and platform rules before purchase.",
      href: "/account-services",
      action: "View services",
    },
  ],
} as const;

const homeSupportLinks = {
  zh: [
    { label: "价格与购买说明", href: "/pricing" },
    { label: "使用教程", href: "/tutorials" },
    { label: "AI 前沿资讯", href: "/ai-news" },
    { label: "AI 趋势分析", href: "/ai-trends" },
    { label: "AI 主题路径", href: "/ai-topics" },
    { label: "Build Your Own X", href: "/build-your-own-x" },
  ],
  en: [
    { label: "Pricing and purchase notes", href: "/pricing" },
    { label: "Tutorials", href: "/tutorials" },
    { label: "AI News", href: "/ai-news" },
    { label: "AI Trends", href: "/ai-trends" },
    { label: "AI topic paths", href: "/ai-topics" },
    { label: "Build Your Own X", href: "/build-your-own-x" },
  ],
} as const;

const homeTopicGrowthLinks = {
  zh: [
    {
      title: "AI 内容创作工具",
      description: "写作、视频、图片和发布工具路径。",
      href: "/ai-topics/ai-content-creation-tools",
    },
    {
      title: "本地 AI 部署",
      description: "适合重视隐私、离线和稳定工作流的用户。",
      href: "/ai-topics/local-ai-deployment",
    },
    {
      title: "AI 账号服务合规",
      description: "购买前先确认平台规则、交付边界和风险提示。",
      href: "/ai-topics/ai-account-service-compliance",
    },
    {
      title: "AI 技能学习路线",
      description: "把课程、工具和项目练习连接成可复用能力。",
      href: "/ai-topics/ai-skill-learning-path",
    },
  ],
  en: [
    {
      title: "AI content creation tools",
      description: "Writing, video, image, and publishing tool paths.",
      href: "/ai-topics/ai-content-creation-tools",
    },
    {
      title: "Local AI deployment",
      description: "For privacy, offline use, and stable workflows.",
      href: "/ai-topics/local-ai-deployment",
    },
    {
      title: "AI account service compliance",
      description: "Check platform rules, delivery scope, and risk notes before purchase.",
      href: "/ai-topics/ai-account-service-compliance",
    },
    {
      title: "AI skill learning path",
      description: "Connect courses, tools, and projects into reusable capability.",
      href: "/ai-topics/ai-skill-learning-path",
    },
  ],
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
  const [recommendedTools, homeProductDemos] = await Promise.all([
    getHomeRecommendedTools(),
    getHomeProductDemos(),
  ]);
  const t = getDictionary(forceLocale);
  const heroTitle =
    forceLocale === "en"
      ? "ENHE AI"
      : "ENHE AI";
  const heroIntro =
    forceLocale === "en"
      ? "Explore AI agents, AI tools, and AI skills. Make AI your productivity partner and reshape your future."
      : "探索 AI 智能体、AI 工具与AI 技能，让 AI 成为你的效率伙伴，重塑你的未来。";
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
        <div className="home-hero-liquid-layer" aria-hidden="true">
          <HomeParticlesBackground />
        </div>
        <div className="home-hero-liquid-overlay" aria-hidden="true" />
        <div className="home-hero-liquid-vignette" aria-hidden="true" />
        <Container className="home-hero-reference-frame">
          <div className="home-hero-stage">
            <div className="home-hero-centered">
              <h1 className="home-hero-title home-hero-title-simple">{heroTitle}</h1>
              <p className="home-hero-positioning">
                <DecryptedText
                  text={heroIntro}
                  speed={34}
                  maxIterations={12}
                  sequential
                  revealDirection="center"
                  useOriginalCharsOnly
                  animateOn="view"
                  className="home-hero-decrypted-letter"
                  parentClassName="home-hero-decrypted-text"
                  encryptedClassName="home-hero-encrypted-letter"
                />
              </p>

              <div className="home-hero-actions">
                <ButtonLink href={buildLocalePath("/software", forceLocale)} variant="primary" className="home-hero-cta home-hero-cta-primary">
                  {forceLocale === "en" ? "Browse products" : "浏览产品"}
                </ButtonLink>
                <ButtonLink href={buildLocalePath("/ai-news", forceLocale)} variant="ghost" className="home-hero-cta home-hero-cta-accent">
                  {forceLocale === "en" ? "View news" : "查看资讯"}
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="home-outcome-shell" aria-labelledby="home-outcome-title">
        <Container className="home-hero-reference-frame">
          <div className="home-section-heading">
            <h2 id="home-outcome-title">{forceLocale === "en" ? "Choose by product type" : "按产品类型选择"}</h2>
          </div>
          <div className="home-outcome-grid home-product-path-grid">
            {homeProductPaths[forceLocale].map((item) => (
              <Link key={item.title} href={buildLocalePath(item.href, forceLocale)} className="home-outcome-card">
                <span>{item.action}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {homeProductDemos.length ? (
        <section className="home-product-demo-shell" aria-labelledby="home-product-demo-title">
          <Container className="home-hero-reference-frame">
            <div className="home-product-preview home-product-demo-panel backdrop-blur-xl backdrop-saturate-150">
              <div className="home-product-preview-header">
                <div>
                  <p>{forceLocale === "en" ? "Product workflow videos" : "产品工作流视频"}</p>
                  <h2 id="home-product-demo-title">{forceLocale === "en" ? "Product Effect Demos" : "产品效果演示"}</h2>
                </div>
                <Link href={buildLocalePath("/product-demos", forceLocale)} className="home-preview-link rounded-full border px-4 py-2 text-sm font-semibold">
                  {forceLocale === "en" ? "View all demos" : "查看全部演示"}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </div>
              <p className="home-product-demo-intro">
                {forceLocale === "en"
                  ? "Use videos to quickly understand the real effect of AI tools: view the workflow first, then choose the right product."
                  : "用视频快速了解 AI 工具的真实使用效果，先看工作流，再选择适合自己的产品。"}
              </p>
              <div className="home-product-demo-grid">
                {homeProductDemos.map((demo) => (
                  <ProductDemoCard key={demo.id} demo={demo} locale={forceLocale} variant="home" />
                ))}
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      <section id="updates" className="home-featured-shell" aria-label="ENHE AI recommended content preview">
        <Container className="home-hero-reference-frame">
          <div className="home-product-preview backdrop-blur-xl backdrop-saturate-150">
            <div className="home-product-preview-header">
              <div>
                <h2>{t.home.featuredContentTitle}</h2>
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

      <section className="home-support-shell" aria-label={forceLocale === "en" ? "Supporting ENHE AI paths" : "ENHE AI 支撑路径"}>
        <Container className="home-hero-reference-frame">
          <details className="home-seo-disclosure">
            <summary>{forceLocale === "en" ? "More paths for research, tutorials, and project practice" : "查看更多资讯、教程和项目练习路径"}</summary>
            <div className="home-support-link-grid">
              {homeSupportLinks[forceLocale].map((item) => (
                <Link key={item.href} href={buildLocalePath(item.href, forceLocale)} className="home-support-link">
                  {item.label}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              ))}
            </div>
            <div
              className="home-topic-growth-grid"
              aria-label={forceLocale === "en" ? "AI topic growth paths" : "AI 主题增长路径"}
            >
              {homeTopicGrowthLinks[forceLocale].map((item) => (
                <Link key={item.href} href={buildLocalePath(item.href, forceLocale)} className="home-topic-growth-link">
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </Link>
              ))}
            </div>
          </details>
        </Container>
      </section>
    </main>
  );
}
