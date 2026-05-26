import { ButtonLink, Container, SectionTitle } from "@/components/ui";
import { HeroLogoMark } from "@/components/hero-logo-mark";
import { ToolCard } from "@/components/tool-card";
import { prisma } from "@/lib/db";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import {
  getEffectiveLocalizedHomeHeroIntro,
  getEffectiveLocalizedHomeHeroSubtitle,
  getEffectiveHomeHeroTitle,
  getSettingsMap
} from "@/lib/settings";

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

  return (
    <>
      <section className="relative overflow-hidden py-18 md:py-24">
        <Container className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="hud-pill mb-6 inline-flex px-4 py-2 text-sm font-semibold">
              {heroSubtitle}
            </div>
            <h1 className="max-w-5xl text-4xl font-semibold tracking-normal text-[#F6FAFF] sm:text-5xl xl:text-6xl">
              {heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#8F9DB2]">
              {heroIntro}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/software">{t.home.softwareButton}</ButtonLink>
              <ButtonLink href="/online-tools" variant="ghost">{t.home.onlineButton}</ButtonLink>
            </div>
          </div>
          <div className="enhe-hero-mark relative mx-auto flex min-h-[460px] w-full max-w-[600px] items-center justify-center">
            <div className="enhe-holo-ring enhe-holo-ring-a" />
            <div className="enhe-holo-ring enhe-holo-ring-b" />
            <div className="enhe-holo-panel enhe-holo-panel-a" />
            <div className="enhe-holo-panel enhe-holo-panel-b" />
            <div className="enhe-orbit enhe-orbit-a" />
            <div className="enhe-orbit enhe-orbit-b" />
            <div className="enhe-orbit enhe-orbit-c" />
            <div className="enhe-logo-aura" />
            <HeroLogoMark label={t.brand} />
            <span className="enhe-signal enhe-signal-1" />
            <span className="enhe-signal enhe-signal-2" />
            <span className="enhe-signal enhe-signal-3" />
          </div>
        </Container>
      </section>

      <Container className="space-y-20 pb-24">
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
