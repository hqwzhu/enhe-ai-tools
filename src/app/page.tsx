import type { Metadata } from "next";
import { Cloud, MonitorDown } from "lucide-react";
import { ButtonLink, Container, SectionTitle } from "@/components/ui";
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
  const [software, onlineTools, locale, settings] = await Promise.all([
    prisma.tool.findMany({ where: { type: "software", status: "published" }, include: { category: true }, orderBy: { sortOrder: "asc" }, take: 3 }),
    prisma.tool.findMany({ where: { type: "online", status: "published" }, include: { category: true }, orderBy: { sortOrder: "asc" }, take: 3 }),
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
        <Container className="home-hero-grid grid min-h-[calc(100dvh-4rem)] items-center gap-12 py-12 lg:grid-cols-[1.02fr_0.98fr]">
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
              <ButtonLink href="/software"><MonitorDown size={17} />{t.home.softwareButton}</ButtonLink>
              <ButtonLink href="/online-tools" variant="ghost"><Cloud size={17} />{t.home.onlineButton}</ButtonLink>
            </div>
          </div>
          <div className="enhe-hero-mark relative mx-auto flex min-h-[420px] w-full max-w-[620px] items-center justify-center">
            <div className="enhe-mark-plane enhe-mark-plane-a" aria-hidden="true" />
            <div className="enhe-mark-plane enhe-mark-plane-b" aria-hidden="true" />
            <div className="enhe-mark-scanfield" aria-hidden="true" />
            <HeroLogoMark label={t.brand} />
            <span className="enhe-signal enhe-signal-1" aria-hidden="true" />
            <span className="enhe-signal enhe-signal-2" aria-hidden="true" />
            <span className="enhe-signal enhe-signal-3" aria-hidden="true" />
          </div>
        </Container>
        <div className="home-hero-scroll-cue" aria-hidden="true" />
      </section>

      <Container className="home-feature-sections space-y-20 pb-24 pt-24 md:pt-32">
        <div className="grid gap-10 lg:grid-cols-2">
          <section>
            <SectionTitle eyebrow={t.home.featuredSoftwareEyebrow} title={t.home.featuredSoftwareTitle} intro={t.home.featuredSoftwareIntro} />
            <div className="grid gap-5">{software.map((tool) => <ToolCard key={tool.id} tool={tool} locale={locale} />)}</div>
          </section>
          <section>
            <SectionTitle eyebrow={t.home.onlineToolsEyebrow} title={t.home.onlineToolsTitle} intro={t.home.onlineToolsIntro} />
            <div className="grid gap-5">{onlineTools.map((tool) => <ToolCard key={tool.id} tool={tool} locale={locale} />)}</div>
          </section>
        </div>
      </Container>
    </>
  );
}
