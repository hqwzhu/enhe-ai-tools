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
