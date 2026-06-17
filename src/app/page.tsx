import type { Metadata } from "next";
import { ButtonLink, Container } from "@/components/ui";
import { ToolCard } from "@/components/tool-card";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { getHomeRecommendedTools } from "@/lib/public-content";
import { getEffectiveLocalizedHomeHeroIntro, getEffectiveHomeHeroTitle, getSettingsMap } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, settings] = await Promise.all([getCurrentLocale(), getSettingsMap()]);
  const t = getDictionary(locale);
  return buildPageMetadata({
    title: `${getEffectiveHomeHeroTitle(settings, t.home.title)} - ${t.brand}`,
    description: getEffectiveLocalizedHomeHeroIntro(settings, locale, t.home.intro),
    path: "/",
    locale: locale === "en" ? "en_US" : "zh_CN"
  });
}

export default async function HomePage() {
  const [recommendedTools, locale, settings] = await Promise.all([
    getHomeRecommendedTools(),
    getCurrentLocale(),
    getSettingsMap()
  ]);
  const t = getDictionary(locale);
  const heroIntro = getEffectiveLocalizedHomeHeroIntro(settings, locale, t.home.intro);
  const heroTitle = getEffectiveHomeHeroTitle(settings, t.home.title);

  return (
    <section className="home-hero-shell">
      <Container className="home-hero-reference-frame">
        <div className="home-hero-centered">
          <p className="home-hero-eyebrow">{t.home.eyebrow}</p>
          <h1 className="home-hero-title">
            <span>{heroTitle}</span>
            <span>{t.home.titleSecondLine}</span>
          </h1>
          <p className="home-hero-intro">{heroIntro}</p>

          <div className="home-hero-metrics" aria-label={t.home.metricsAriaLabel}>
            <div>
              <strong>30+</strong>
              <span>{t.home.metricsTools}</span>
            </div>
            <div>
              <strong>{t.home.metricsOutcomeTitle}</strong>
              <span>{t.home.metricsOutcome}</span>
            </div>
          </div>

          <div className="home-hero-actions">
            <ButtonLink href="/software" className="home-hero-cta home-hero-cta-primary">
              {t.home.softwareButton}
            </ButtonLink>
            <ButtonLink href="/online-tools" className="home-hero-cta home-hero-cta-accent">
              {t.home.onlineButton}
            </ButtonLink>
            <ButtonLink href="/skill-learning" className="home-hero-cta home-hero-cta-accent">
              {t.home.skillLearningButton}
            </ButtonLink>
          </div>
        </div>

        <div id="updates" className="home-product-preview backdrop-blur-xl backdrop-saturate-150" aria-label="ENHE AI recommended content preview">
          <div className="home-product-preview-header">
            <div>
              <p>{t.home.featuredContentTitle}</p>
              <h2>{t.home.featuredContentIntro}</h2>
            </div>
          </div>
          {recommendedTools.length > 0 ? (
            <div className="home-recommended-tool-grid">
              {recommendedTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="home-product-preview-empty">{t.home.featuredContentEmpty}</div>
          )}
        </div>
      </Container>
    </section>
  );
}
