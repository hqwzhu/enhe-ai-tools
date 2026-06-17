import type { Metadata } from "next";
import { ButtonLink, Container } from "@/components/ui";
import { ToolCard } from "@/components/tool-card";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { getHomeRecommendedTools } from "@/lib/public-content";
import { buildMetadataTitle, buildPageMetadata } from "@/lib/seo";
import { publicPageCacheSeconds } from "@/lib/public-routes";
import { getEffectiveLocalizedHomeHeroIntro, getEffectiveHomeHeroTitle, getSettingsMap } from "@/lib/settings";

export const publicPageRevalidate = publicPageCacheSeconds;

export async function generateHomePageMetadata(forceLocale: Locale): Promise<Metadata> {
  const settings = await getSettingsMap();
  const t = getDictionary(forceLocale);
  return buildPageMetadata({
    title: buildMetadataTitle({
      pageTitle: getEffectiveHomeHeroTitle(settings, t.home.title),
      brand: t.brand
    }),
    description: getEffectiveLocalizedHomeHeroIntro(settings, forceLocale, t.home.intro),
    path: "/",
    locale: forceLocale === "en" ? "en_US" : "zh_CN",
    localeKey: forceLocale
  });
}

export async function HomePageShell({ forceLocale }: { forceLocale: Locale }) {
  const [recommendedTools, settings] = await Promise.all([getHomeRecommendedTools(), getSettingsMap()]);
  const t = getDictionary(forceLocale);
  const heroIntro = getEffectiveLocalizedHomeHeroIntro(settings, forceLocale, t.home.intro);
  const heroTitle = getEffectiveHomeHeroTitle(settings, t.home.title);

  return (
    <main className="home-page-shell">
      <section className="home-hero-shell">
        <Container className="home-hero-reference-frame">
          <div className="home-hero-stage">
            <div className="home-hero-centered">
              <p className="home-hero-eyebrow">{t.home.eyebrow}</p>
              <h1 className="home-hero-title">
                <span>{heroTitle}</span>
                <span>{t.home.titleSecondLine}</span>
              </h1>
              <p className="home-hero-intro">{heroIntro}</p>

              <div className="home-hero-metrics" aria-label={t.home.metricsAriaLabel}>
                <div>
                  <strong>{t.home.metricsExploreTitle}</strong>
                  <span>{t.home.metricsExplore}</span>
                </div>
                <div>
                  <strong>{t.home.metricsOutcomeTitle}</strong>
                  <span>{t.home.metricsOutcome}</span>
                </div>
              </div>

              <div className="home-hero-actions">
                <ButtonLink href={forceLocale === "en" ? "/en/software" : "/software"} className="home-hero-cta home-hero-cta-primary">
                  {t.home.softwareButton}
                </ButtonLink>
                <ButtonLink href={forceLocale === "en" ? "/en/online-tools" : "/online-tools"} className="home-hero-cta home-hero-cta-accent">
                  {t.home.onlineButton}
                </ButtonLink>
                <ButtonLink href={forceLocale === "en" ? "/en/skill-learning" : "/skill-learning"} className="home-hero-cta home-hero-cta-primary">
                  {t.home.skillLearningButton}
                </ButtonLink>
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
                  <ToolCard key={tool.id} tool={tool} locale={forceLocale} />
                ))}
              </div>
            ) : (
              <div className="home-product-preview-empty">{t.home.featuredContentEmpty}</div>
            )}
          </div>
        </Container>
      </section>
    </main>
  );
}
