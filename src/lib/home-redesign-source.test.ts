import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("homepage SaaS redesign source", () => {
  it("uses localized homepage copy, keeps the hero isolated to the first viewport, and keeps all six recommended tools inside the featured content card", () => {
    const page = readFileSync(new URL("../app/page-shell.tsx", import.meta.url), "utf8");
    const header = readFileSync(new URL("../components/site-header.tsx", import.meta.url), "utf8");
    const dictionaries = readFileSync(new URL("../lib/dictionaries.ts", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8").replace(/\r\n/g, "\n");

    expect(page).toContain('className="home-page-shell"');
    expect(page).toContain("home-hero-shell");
    expect(page).toContain("home-hero-stage");
    expect(page).toContain("home-hero-centered");
    expect(page).not.toContain("home-hero-background");
    expect(page).not.toContain("home-hero-unicorn-remix");
    expect(page).toContain('id="updates" className="home-featured-shell"');
    expect(page.indexOf("home-featured-shell")).toBeGreaterThan(page.indexOf("home-hero-actions"));
    expect(page).toContain("t.home.eyebrow");
    expect(page).toContain("t.home.title");
    expect(page).toContain("t.home.titleSecondLine");
    expect(page).not.toContain("home-hero-metrics");
    expect(page).not.toContain("t.home.metricsExploreTitle");
    expect(page).not.toContain("t.home.metricsExplore");
    expect(page).not.toContain("t.home.metricsOutcome");
    expect(page).toContain("t.home.softwareButton");
    expect(page).toContain("t.home.onlineButton");
    expect(page).toContain("t.home.aiNewsButton");
    expect(page).toContain("t.home.skillLearningButton");
    expect(page).toContain('href={forceLocale === "en" ? "/en/account-services" : "/account-services"}');
    expect(page).toContain('href={forceLocale === "en" ? "/en/ai-news" : "/ai-news"}');
    expect(page).toContain('href={forceLocale === "en" ? "/en/skill-learning" : "/skill-learning"}');
    expect(page).toContain("t.home.featuredContentTitle");
    expect(page).toContain("t.home.featuredContentIntro");
    expect(page).not.toContain("take: 40");
    expect(page).not.toContain("recommendedTools.slice(previewTools.length)");
    expect(page).toContain("getHomeRecommendedTools");
    expect(page).not.toContain('href="/account-services" variant="ghost" className="home-preview-link"');
    expect(page).toContain('href={forceLocale === "en" ? "/en/software" : "/software"}');
    expect(page).toContain('href={forceLocale === "en" ? "/en/account-services" : "/account-services"}');
    expect(page).toContain('href={forceLocale === "en" ? "/en/ai-news" : "/ai-news"}');
    expect(page).toContain('href={forceLocale === "en" ? "/en/skill-learning" : "/skill-learning"}');
    expect(page).toContain("home-product-preview backdrop-blur-xl backdrop-saturate-150");
    expect(page).not.toContain("HeroLogoMark");
    expect(page).not.toContain("enhe-orbital-system");
    expect(page).not.toContain("enhe-circuit-line");
    expect(page).not.toContain("enhe-signal");
    expect(page).not.toContain("home-hero-scroll-cue");

    expect(header).toContain("t.nav.home");
    expect(header).toContain("t.nav.login");
    expect(header).toContain("{t.nav.user}");

    expect(dictionaries).toContain('titleSecondLine: "Reshape Your Life"');
    expect(dictionaries).toContain('metricsExploreTitle: "Explore Freely"');
    expect(dictionaries).toContain('metricsExplore: "Open More Possibilities with AI"');
    expect(dictionaries).toContain('featuredContentTitle: "Featured Content"');

    expect(css).toContain("color-scheme: dark");
    expect(css).toContain("--marketing-bg: #22242a");
    expect(css).not.toContain("color-scheme: light");
    expect(css).not.toContain("--marketing-bg: #ffffff");
    expect(css).not.toContain(".site-brand-logo-light");
    expect(css).toContain("--marketing-accent: #f05a35");
    expect(css).toContain("--font-sans: 'Montserrat', 'MiSans'");
    expect(css).not.toContain("Microsoft YaHei UI");
    expect(css).toContain("MiSans");
    expect(css).toContain("HarmonyOS Sans SC");
    expect(css).toContain(".home-page-shell");
    expect(css).toContain(".home-hero-stage");
    expect(css).toContain(".home-hero-centered");
    expect(css).not.toContain(".home-hero-metrics");
    expect(css).toContain(".home-featured-shell");
    expect(css).toContain("scroll-margin-top: 96px");
    expect(css).toContain(".home-hero-actions {\n    width: 100%;\n    flex-wrap: wrap;");
    expect(css).toContain(".home-hero-cta {\n    flex: 1 1 42%;");
    expect(css).toContain("white-space: pre-line");
    expect(css).toContain(".home-product-preview {\n  width: min(100%, 1040px);\n  margin: 0 auto;");
    expect(css).not.toContain(".enhe-orbital-system");
    expect(css).not.toContain(".home-hero-scroll-cue");
  });

  it("emphasizes the Chinese hero promise with the ENHE orange breathing glow", () => {
    const page = readFileSync(new URL("../app/page-shell.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8").replace(/\r\n/g, "\n");

    expect(page).toContain('<span className="home-hero-title-emphasis">{t.home.titleSecondLine}</span>');
    expect(css).toContain(".home-hero-title-emphasis");
    expect(css).toContain("color: var(--marketing-accent)");
    expect(css).toContain("animation: hero-title-breathe");
    expect(css).toContain("@keyframes hero-title-breathe");
    expect(css).toContain("text-shadow:");
    expect(css).toContain(".home-hero-title-emphasis {\n    animation: none");
  });

  it("applies the new Chinese display font to the homepage header, call-to-action buttons, and slogan copy while keeping the header text white", () => {
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8").replace(/\r\n/g, "\n");

    expect(css).toContain("html[lang='zh-CN'] :is(");
    expect(css).toContain(".site-brand-wordmark");
    expect(css).toContain(".site-nav-link");
    expect(css).toContain(".site-login-link");
    expect(css).toContain(".site-admin-link");
    expect(css).toContain(".site-user-chip");
    expect(css).toContain(".site-user-center-cta");
    expect(css).toContain(".site-language-switcher a");
    expect(css).toContain(".home-hero-eyebrow");
    expect(css).toContain(".home-hero-intro");
    expect(css).not.toContain(".home-hero-metrics strong");
    expect(css).not.toContain(".home-hero-metrics span");
    expect(css).toContain(".home-hero-cta");
    expect(css).toContain("font-family: var(--font-heading-zh)");
    expect(css).toContain(".site-nav-link,\n.site-login-link,\n.site-admin-link {\n  align-items: center;\n  border-radius: 999px;\n  color: var(--marketing-text);");
    expect(css).toContain(".site-language-switcher a {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 999px;\n  background: transparent;\n  color: var(--marketing-text);");
  });

  it("adds more breathing room between the two hero title lines", () => {
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8").replace(/\r\n/g, "\n");

    expect(css).toContain(".home-hero-title {\n  display: grid;\n  gap: 0.448em;");
  });

  it("polishes the hero label, CTA contrast, and footer while preserving SEO and GEO source contracts", () => {
    const footer = readFileSync(new URL("../components/site-footer.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8").replace(/\r\n/g, "\n");
    const page = readFileSync(new URL("../app/page-shell.tsx", import.meta.url), "utf8");
    const publicChrome = readFileSync(new URL("../components/public-site-chrome.tsx", import.meta.url), "utf8");

    expect(css).toContain(".home-hero-eyebrow {\n  display: inline-flex;");
    expect(css).toContain("border: 1px solid rgba(255, 255, 255, 0.24)");
    expect(css).toContain("backdrop-filter: blur(18px) saturate(150%)");
    expect(css).toContain(".home-hero-cta-primary {\n  background: #ffffff");
    expect(css).toContain("color: #050505");
    expect(css).toContain(".home-hero-cta-accent {\n  background: var(--marketing-accent)");
    expect(css).toContain("color: #ffffff");

    expect(footer).toContain("footerGroups");
    expect(footer).toContain("footerSocialLinks");
    expect(footer).toContain('label: "Gmail"');
    expect(footer).toContain('label: "小红书"');
    expect(footer).toContain('label: "抖音"');
    expect(footer).toContain('label: "YouTube"');
    expect(footer).toContain("site-footer-gradient-mark");
    expect(footer).toContain("buildLocalePath");
    expect(footer).toContain("legalPages.map");

    expect(page).toContain("generateHomePageMetadata");
    expect(publicChrome).toContain("buildWebsiteSchema");
    expect(publicChrome).toContain("buildOrganizationSchema");
    expect(css).not.toContain(".home-hero-background");
    expect(css).not.toContain("home-hero-unicorn-remix");
  });
});
