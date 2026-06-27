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

const homeJourneyItems = {
  zh: [
    {
      title: "先判断趋势",
      body: "从 AI前沿资讯和趋势分析里看清变化，知道哪些模型、工具、政策和工作方式值得关注。",
      href: "/ai-news",
      cta: "看 AI 前沿资讯",
    },
    {
      title: "再选择工具",
      body: "进入 AI软件应用，按任务、部署方式、价格和教程支持筛选真正适合自己的工具。",
      href: "/software",
      cta: "选 AI 软件应用",
    },
    {
      title: "把方法学会",
      body: "通过 AI技能学习和使用教程，把零散试用变成可复用的提示词、流程、模板和交付物。",
      href: "/skill-learning",
      cta: "学 AI 技能",
    },
    {
      title: "需要时再咨询访问",
      body: "涉及账号、订阅和第三方平台时，先确认服务范围、交付边界和官方平台规则。",
      href: "/account-services",
      cta: "看账号服务",
    },
  ],
  en: [
    {
      title: "Read the signal first",
      body: "Use AI news and trend analysis to see which models, tools, policies, and workflows are worth attention.",
      href: "/ai-news",
      cta: "Read AI news",
    },
    {
      title: "Choose the tool",
      body: "Explore AI software by task, deployment model, pricing, and tutorial support before adopting anything.",
      href: "/software",
      cta: "Choose software",
    },
    {
      title: "Learn the method",
      body: "Turn scattered experiments into reusable prompts, steps, templates, and deliverables through skill learning.",
      href: "/skill-learning",
      cta: "Learn AI skills",
    },
    {
      title: "Check access when needed",
      body: "For accounts, subscriptions, and third-party platforms, review scope, delivery boundaries, and official rules first.",
      href: "/account-services",
      cta: "View account services",
    },
  ],
} as const;

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
              <p className="home-hero-eyebrow backdrop-blur-xl backdrop-saturate-150">{t.home.eyebrow}</p>
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

              <div className="home-hero-actions">
                <ButtonLink
                  href={forceLocale === "en" ? "/en/ai-news" : "/ai-news"}
                  className="home-hero-cta home-hero-cta-primary backdrop-blur-xl backdrop-saturate-150"
                >
                  {t.home.aiNewsButton}
                </ButtonLink>
                <ButtonLink
                  href={forceLocale === "en" ? "/en/software" : "/software"}
                  className="home-hero-cta home-hero-cta-accent backdrop-blur-xl backdrop-saturate-150"
                >
                  {t.home.softwareButton}
                </ButtonLink>
                <ButtonLink
                  href={forceLocale === "en" ? "/en/account-services" : "/account-services"}
                  className="home-hero-cta home-hero-cta-primary backdrop-blur-xl backdrop-saturate-150"
                >
                  {t.home.onlineButton}
                </ButtonLink>
                <ButtonLink
                  href={forceLocale === "en" ? "/en/skill-learning" : "/skill-learning"}
                  className="home-hero-cta home-hero-cta-accent backdrop-blur-xl backdrop-saturate-150"
                >
                  {t.home.skillLearningButton}
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="home-journey-shell" aria-label={forceLocale === "en" ? "ENHE AI user journey" : "ENHE AI 用户路径"}>
        <Container className="home-hero-reference-frame">
          <div className="home-product-preview home-journey-panel backdrop-blur-xl backdrop-saturate-150">
            <div className="home-product-preview-header">
              <div>
                <p>{forceLocale === "en" ? "How ENHE AI helps" : "如何使用 ENHE AI"}</p>
                <h2>
                  {forceLocale === "en"
                    ? "Start with the signal, finish with a usable AI workflow."
                    : "先看清变化，再把 AI 变成自己能用的工作流。"}
                </h2>
              </div>
            </div>
            <div className="home-journey-grid">
              {homeJourneyItems[forceLocale].map((item) => (
                <article key={item.href} className="home-journey-item">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <Link href={buildLocalePath(item.href, forceLocale)} className="home-journey-link">
                    {item.cta}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                </article>
              ))}
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
