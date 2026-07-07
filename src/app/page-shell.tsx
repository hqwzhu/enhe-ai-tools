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
        "ENHE AI 帮助用户把 AI 用到真实任务里：更快完成工作、创作内容、整理资料、学习技能、解决工具选择和使用问题。在需要处理敏感素材、长期稳定流程或隐私边界时，提供更可控的AI工具和路径。",
    },
    {
      question: "新用户应该从哪里开始使用 ENHE AI？",
      answer:
        "先从要完成的任务开始：提效、创作、整理资料、学习技能或处理敏感素材。任务明确后，再进入 AI软件应用、AI技能学习、AI前沿资讯或 AI账号服务页面选择合适路径。",
    },
    {
      question: "ENHE AI 为什么强调安全、隐私和稳定？",
      answer:
        "普通用户使用 AI 时，常会处理客户资料、创作素材、账号信息、内部文档和课程文件。ENHE AI 会把本地或更可控的 AI 路径解释成安全、隐私和稳定收益，帮助用户减少盲目上传和反复试错。",
    },
  ],
  en: [
    {
      question: "What is ENHE AI?",
      answer:
        "ENHE AI helps users apply AI to real tasks: work faster, create content, organize material, learn skills, and solve tool-selection and usage problems. When sensitive material, long-running workflows, or privacy boundaries matter, it provides more controllable AI tools and paths.",
    },
    {
      question: "Where should new users start on ENHE AI?",
      answer:
        "Start from the task: productivity, content creation, material organization, skill learning, or sensitive-material handling. Then choose AI software apps, AI skill learning, AI news, or account-service guidance as the matching path.",
    },
    {
      question: "Why does ENHE AI emphasize safety, privacy, and stability?",
      answer:
        "AI users often work with client files, creative assets, account information, internal documents, and course material. ENHE AI explains local or more controlled AI paths as safety, privacy, and stability benefits, not as abstract technical features.",
    },
  ],
} as const;

const homeProductPaths = {
  zh: [
    {
      title: "提升工作效率",
      description: "办公效率工具、文件处理工具、系统实用工具、数据分析工具、提升效率、AI电脑软件",
      href: "/product-paths/work-efficiency",
    },
    {
      title: "生成图片/视频/音频",
      description: "AI视频工具、AI图片工具、AI音频工具、视频生成、语音生成、视频/图片处理",
      href: "/product-paths/media-generation",
    },
    {
      title: "改变你未来的AI",
      description: "AI 智能体、生活实用AI工具、智能体、账号订购、升级订阅、AI 提示词、AI 副业变现",
      href: "/product-paths/future-ai",
    },
  ],
  en: [
    {
      title: "Improve work efficiency",
      description: "Office productivity tools, file processing tools, system utilities, data analysis tools, productivity, AI desktop software",
      href: "/product-paths/work-efficiency",
    },
    {
      title: "Generate image/video/audio",
      description: "AI video tools, AI image tools, AI audio tools, video generation, voice generation, video/image processing",
      href: "/product-paths/media-generation",
    },
    {
      title: "AI that changes your future",
      description: "AI agents, practical AI tools for daily life, agents, account subscriptions, subscription upgrades, AI prompts, AI side-income workflows",
      href: "/product-paths/future-ai",
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
      ? "Helping everyone use AI with confidence—turn ideas into creations and productivity into value."
      : "让每一个普通人，都能轻松用好 AI，把想法变成作品，把效率变成价值。";
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
                <ButtonLink
                  href={buildLocalePath("/software", forceLocale)}
                  variant="primary"
                  className="home-hero-cta home-hero-cta-primary"
                  data-analytics-event="home_hot_ai_tools_cta_click"
                  data-analytics-meta-target="software"
                  data-analytics-meta-placement="home-hero"
                >
                  {forceLocale === "en" ? "Popular AI Tools" : "热门AI工具"}
                </ButtonLink>
                <ButtonLink
                  href={buildLocalePath("/skill-learning", forceLocale)}
                  variant="ghost"
                  className="home-hero-cta home-hero-cta-accent"
                  data-analytics-event="home_free_claim_cta_click"
                  data-analytics-meta-target="skill-learning"
                  data-analytics-meta-placement="home-hero"
                >
                  {forceLocale === "en" ? "Claim Free" : "免费领取"}
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="home-outcome-shell" aria-labelledby="home-outcome-title">
        <Container className="home-hero-reference-frame">
          <div className="home-section-heading">
            <h2 id="home-outcome-title">{forceLocale === "en" ? "Choose by need" : "按需求选择"}</h2>
          </div>
          <div className="home-outcome-grid home-product-path-grid">
            {homeProductPaths[forceLocale].map((item) => (
              <Link key={item.title} href={buildLocalePath(item.href, forceLocale)} className="home-outcome-card">
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
                  <h2 id="home-product-demo-title">{forceLocale === "en" ? "Tool Function Demos" : "AI应用功能演示"}</h2>
                </div>
                <Link href={buildLocalePath("/product-demos", forceLocale)} className="home-preview-link rounded-full border px-4 py-2 text-sm font-semibold">
                  {forceLocale === "en" ? "View all demos" : "查看全部演示"}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </div>
              <p className="home-product-demo-intro">
                {forceLocale === "en"
                  ? "Quickly understand the real-world effect of AI tools."
                  : "快速了解 AI 应用的真实使用效果"}
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
