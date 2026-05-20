import Image from "next/image";
import { ButtonLink, Container, SectionTitle } from "@/components/ui";
import { ToolCard } from "@/components/tool-card";
import { prisma } from "@/lib/db";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";

export default async function HomePage() {
  const [software, onlineTools, locale] = await Promise.all([
    prisma.tool.findMany({ where: { type: "software", status: "published" }, include: { category: true }, orderBy: { sortOrder: "asc" }, take: 3 }),
    prisma.tool.findMany({ where: { type: "online", status: "published" }, include: { category: true }, orderBy: { sortOrder: "asc" }, take: 3 }),
    getCurrentLocale()
  ]);
  const t = getDictionary(locale);

  return (
    <>
      <section className="relative overflow-hidden py-18 md:py-24">
        <Container className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-[#48F5D3]/30 bg-[#48F5D3]/10 px-4 py-2 text-sm text-[#48F5D3]">
              {t.home.eyebrow}
            </div>
            <h1 className="max-w-5xl text-4xl font-semibold tracking-normal text-white sm:text-5xl xl:text-6xl">
              {t.home.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#8B95A7]">
              {t.home.intro}
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
            <div className="relative z-10 flex size-56 items-center justify-center rounded-[2rem] bg-transparent sm:size-64">
              <Image
                src="/images/enhe-logo.svg"
                alt={t.brand}
                width={184}
                height={184}
                priority
                className="enhe-logo-float h-40 w-40 drop-shadow-[0_0_42px_rgba(72,245,211,0.36)] sm:h-48 sm:w-48"
              />
            </div>
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
