import type { Metadata } from "next";
import { ButtonLink, Container } from "@/components/ui";
import { ToolCard } from "@/components/tool-card";
import { prisma } from "@/lib/db";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import {
  getEffectiveLocalizedHomeHeroIntro,
  getEffectiveHomeHeroTitle,
  getSettingsMap
} from "@/lib/settings";

const defaultHeroTitle = "ENHE AI";
const defaultHeroTitleSecondLine = "重塑你的人生";
const defaultHeroIntro = "与 AI 共生，在时代中觉醒，用创造定义未来。";

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
  const heroIntro = getEffectiveLocalizedHomeHeroIntro(settings, locale, defaultHeroIntro);
  const previewTools = recommendedTools.slice(0, 3);
  const heroLines = [defaultHeroTitle, defaultHeroTitleSecondLine];

  return (
    <>
      <section className="home-hero-shell">
        <Container className="home-hero-reference-frame">
          <div className="home-hero-centered">
            <p className="home-hero-eyebrow">Symbiosis · Awakening · Creation</p>
            <h1 className="home-hero-title">
              {heroLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <p className="home-hero-intro">{heroIntro}</p>

            <div className="home-hero-metrics" aria-label="ENHE AI platform metrics">
              <div>
                <strong>30+</strong>
                <span>精选工具与课程</span>
              </div>
              <div>
                <strong>灵感落地</strong>
                <span>把想法变成看得见的成果</span>
              </div>
            </div>

            <div className="home-hero-actions">
              <ButtonLink href="/software" className="home-hero-cta home-hero-cta-primary">
                AI软件应用
              </ButtonLink>
              <ButtonLink href="/skill-learning" className="home-hero-cta home-hero-cta-accent">
                AI技能学习
              </ButtonLink>
            </div>
          </div>

          <div id="updates" className="home-product-preview backdrop-blur-xl backdrop-saturate-150" aria-label="ENHE AI recommended content preview">
            <div className="home-product-preview-header">
              <div>
                <p>精选内容</p>
                <h2>从软件、账号服务到课程，一站式进入 AI 工作流。</h2>
              </div>
              <ButtonLink href="/online-tools" variant="ghost" className="home-preview-link">
                AI账号服务
              </ButtonLink>
            </div>
            {previewTools.length > 0 ? (
              <div className="home-recommended-tool-grid">
                {previewTools.map((tool) => <ToolCard key={tool.id} tool={tool} locale={locale} />)}
              </div>
            ) : (
              <div className="home-product-preview-empty">
                推荐工具将在后台设置后显示在这里。
              </div>
            )}
          </div>
        </Container>
      </section>

      {recommendedTools.length > previewTools.length ? (
        <Container className="home-feature-sections">
          <div className="home-recommended-tool-grid home-recommended-tool-grid-wide">
            {recommendedTools.slice(previewTools.length).map((tool) => <ToolCard key={tool.id} tool={tool} locale={locale} />)}
          </div>
        </Container>
      ) : null}
    </>
  );
}
