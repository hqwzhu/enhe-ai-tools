import type { Metadata } from "next";
import { ChevronRight, Cloud, MonitorDown } from "lucide-react";
import { ButtonLink, Container } from "@/components/ui";
import { HeroLogoMark } from "@/components/hero-logo-mark";
import { ToolCard } from "@/components/tool-card";
import { prisma } from "@/lib/db";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import {
  getEffectiveLocalizedHomeHeroIntro,
  getEffectiveLocalizedHomeHeroSubtitle,
  getEffectiveHomeHeroTitle,
  getSettingsMap
} from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, settings] = await Promise.all([getCurrentLocale(), getSettingsMap()]);
  const t = getDictionary(locale);
  return buildPageMetadata({
    title: `${getEffectiveHomeHeroTitle(settings, t.home.title)} - ${t.brand}`,
    description: getEffectiveLocalizedHomeHeroIntro(settings, locale, t.home.intro),
    path: "/"
  });
}

export default async function HomePage() {
  const [recommendedTools, locale, settings] = await Promise.all([
    prisma.tool.findMany({
      where: { status: "published", isHomeRecommended: true },
      include: { category: true, priceSpecs: { where: { status: "active" }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 40
    }),
    getCurrentLocale(),
    getSettingsMap()
  ]);
  const t = getDictionary(locale);
  const heroTitle = getEffectiveHomeHeroTitle(settings, t.home.title);
  const heroSubtitle = getEffectiveLocalizedHomeHeroSubtitle(settings, locale, t.home.eyebrow);
  const heroIntro = getEffectiveLocalizedHomeHeroIntro(settings, locale, t.home.intro);
  const heroTitleParts = heroTitle === "ENHE AI Tools" ? ["ENHE AI", "Tools"] : [heroTitle, null];

  return (
    <>
      <section className="home-hero-shell relative min-h-[calc(100dvh-4rem)] overflow-hidden">
        <Container className="home-hero-reference-frame home-hero-grid grid min-h-[calc(100dvh-4rem)] max-w-none items-center gap-12 py-12 lg:grid-cols-[0.92fr_1.08fr] xl:gap-16">
          <div className="home-hero-copy">
            <div className="hud-pill mb-7 inline-flex px-4 py-2 text-sm font-semibold">
              {heroSubtitle}
            </div>
            <h1 className="max-w-5xl text-5xl font-semibold tracking-normal text-[#F6FAFF] sm:text-6xl xl:text-7xl">
              {heroTitleParts[0]}
              {heroTitleParts[1] ? <span className="home-hero-title-accent"> {heroTitleParts[1]}</span> : null}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#8F9DB2]">
              {heroIntro}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/software" className="home-hero-cta"><MonitorDown size={23} />{t.home.softwareButton}<ChevronRight size={18} /></ButtonLink>
              <ButtonLink href="/online-tools" variant="ghost" className="home-hero-cta"><Cloud size={24} />{t.home.onlineButton}<ChevronRight size={18} /></ButtonLink>
            </div>
          </div>
          <div className="enhe-hero-mark relative mx-auto flex min-h-[520px] w-full max-w-[860px] items-center justify-center">
            <div className="enhe-orbital-system" aria-hidden="true">
              <span className="enhe-orbit-ring enhe-orbit-ring-a" />
              <span className="enhe-orbit-ring enhe-orbit-ring-b" />
              <span className="enhe-orbit-ring enhe-orbit-ring-c" />
              <span className="enhe-circuit-line enhe-circuit-line-a" />
              <span className="enhe-circuit-line enhe-circuit-line-b" />
              <span className="enhe-circuit-line enhe-circuit-line-c" />
              <span className="enhe-circuit-line enhe-circuit-line-d" />
              <span className="enhe-circuit-node enhe-circuit-node-a" />
              <span className="enhe-circuit-node enhe-circuit-node-b" />
              <span className="enhe-circuit-node enhe-circuit-node-c" />
              <span className="enhe-circuit-cross enhe-circuit-cross-a" />
              <span className="enhe-circuit-cross enhe-circuit-cross-b" />
            </div>
            <HeroLogoMark label={t.brand} />
            <span className="enhe-signal enhe-signal-1" aria-hidden="true" />
            <span className="enhe-signal enhe-signal-2" aria-hidden="true" />
            <span className="enhe-signal enhe-signal-3" aria-hidden="true" />
          </div>
        </Container>
        <div className="home-hero-scroll-cue" aria-hidden="true" />
      </section>

      {recommendedTools.length > 0 ? (
        <Container className="home-feature-sections pb-24 pt-24 md:pt-32">
          <div className="home-recommended-tool-grid grid gap-6 lg:grid-cols-2">
            {recommendedTools.map((tool) => <ToolCard key={tool.id} tool={tool} locale={locale} />)}
          </div>
        </Container>
      ) : null}
    </>
  );
}
