import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("homepage SaaS redesign source", () => {
  it("uses localized homepage copy, keeps the hero isolated to the first viewport, and keeps all six recommended tools inside the featured content card", () => {
    const page = readFileSync(new URL("../app/page-shell.tsx", import.meta.url), "utf8");
    const header = readFileSync(new URL("../components/site-header.tsx", import.meta.url), "utf8");
    const dictionaries = readFileSync(new URL("../lib/dictionaries.ts", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

    expect(page).toContain('className="home-page-shell"');
    expect(page).toContain("home-hero-shell");
    expect(page).toContain("home-hero-stage");
    expect(page).toContain("home-hero-centered");
    expect(page).toContain('id="updates" className="home-featured-shell"');
    expect(page.indexOf("home-featured-shell")).toBeGreaterThan(page.indexOf("home-hero-actions"));
    expect(page).toContain("t.home.eyebrow");
    expect(page).toContain("t.home.title");
    expect(page).toContain("t.home.titleSecondLine");
    expect(page).toContain("t.home.metricsExploreTitle");
    expect(page).toContain("t.home.metricsExplore");
    expect(page).toContain("t.home.metricsOutcome");
    expect(page).toContain("t.home.softwareButton");
    expect(page).toContain("t.home.onlineButton");
    expect(page).toContain("t.home.aiNewsButton");
    expect(page).toContain("t.home.skillLearningButton");
    expect(page).toContain('href={forceLocale === "en" ? "/en/online-tools" : "/online-tools"}');
    expect(page).toContain('href={forceLocale === "en" ? "/en/ai-news" : "/ai-news"}');
    expect(page).toContain('href={forceLocale === "en" ? "/en/skill-learning" : "/skill-learning"}');
    expect(page).toContain("t.home.featuredContentTitle");
    expect(page).toContain("t.home.featuredContentIntro");
    expect(page).not.toContain("take: 40");
    expect(page).not.toContain("recommendedTools.slice(previewTools.length)");
    expect(page).toContain("getHomeRecommendedTools");
    expect(page).not.toContain('href="/online-tools" variant="ghost" className="home-preview-link"');
    expect(page).toContain('href={forceLocale === "en" ? "/en/software" : "/software"}');
    expect(page).toContain('href={forceLocale === "en" ? "/en/online-tools" : "/online-tools"}');
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
    expect(css).toContain("Microsoft YaHei UI");
    expect(css).toContain("MiSans");
    expect(css).toContain("HarmonyOS Sans SC");
    expect(css).toContain(".home-page-shell");
    expect(css).toContain(".home-hero-stage");
    expect(css).toContain(".home-hero-centered");
    expect(css).toContain(".home-hero-metrics");
    expect(css).toContain(".home-featured-shell");
    expect(css).toContain("scroll-margin-top: 96px");
    expect(css).toContain(".home-hero-actions {\n    width: 100%;\n    flex-wrap: wrap;");
    expect(css).toContain(".home-hero-cta {\n    flex: 1 1 42%;");
    expect(css).toContain("white-space: pre-line");
    expect(css).toContain(".home-product-preview {\n  width: min(100%, 1040px);\n  margin: 0 auto;");
    expect(css).not.toContain(".enhe-orbital-system");
    expect(css).not.toContain(".home-hero-scroll-cue");
  });
});
