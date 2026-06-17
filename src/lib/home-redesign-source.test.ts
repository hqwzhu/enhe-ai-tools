import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("homepage SaaS redesign source", () => {
  it("uses localized homepage copy, three hero entry buttons, and keeps all six recommended tools inside the featured content card", () => {
    const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
    const header = readFileSync(new URL("../components/site-header.tsx", import.meta.url), "utf8");
    const i18n = readFileSync(new URL("../lib/i18n.ts", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

    expect(page).toContain("home-hero-shell");
    expect(page).toContain("home-hero-centered");
    expect(page).toContain("t.home.eyebrow");
    expect(page).toContain("t.home.title");
    expect(page).toContain("t.home.titleSecondLine");
    expect(page).toContain("t.home.metricsTools");
    expect(page).toContain("t.home.metricsOutcome");
    expect(page).toContain("t.home.softwareButton");
    expect(page).toContain("t.home.onlineButton");
    expect(page).toContain("t.home.skillLearningButton");
    expect(page).toContain("t.home.featuredContentTitle");
    expect(page).toContain("t.home.featuredContentIntro");
    expect(page).not.toContain("take: 40");
    expect(page).not.toContain("recommendedTools.slice(previewTools.length)");
    expect(page).toContain("getHomeRecommendedTools");
    expect(page).not.toContain('href="/online-tools" variant="ghost" className="home-preview-link"');
    expect(page).toContain('href="/software"');
    expect(page).toContain('href="/online-tools"');
    expect(page).toContain('href="/skill-learning"');
    expect(page).toContain("home-product-preview backdrop-blur-xl backdrop-saturate-150");
    expect(page).not.toContain("HeroLogoMark");
    expect(page).not.toContain("enhe-orbital-system");
    expect(page).not.toContain("enhe-circuit-line");
    expect(page).not.toContain("enhe-signal");
    expect(page).not.toContain("home-hero-scroll-cue");

    expect(header).toContain("t.nav.home");
    expect(header).toContain("t.nav.login");
    expect(header).toContain("{t.nav.user}");

    expect(i18n).toContain('titleSecondLine: "重塑你的人生"');
    expect(i18n).toContain('metricsTools: "精选工具与课程"');
    expect(i18n).toContain('metricsOutcome: "把想法变成看得见的成果"');
    expect(i18n).toContain('featuredContentTitle: "精选内容"');
    expect(i18n).toContain('featuredContentIntro: "从软件、账号服务、教程到AI前沿资讯，一站式进入 AI 工作流。"');
    expect(i18n).toContain('titleSecondLine: "Reshape Your Life"');
    expect(i18n).toContain('featuredContentTitle: "Featured Content"');

    expect(css).toContain("color-scheme: dark");
    expect(css).toContain("--marketing-bg: #22242a");
    expect(css).not.toContain("color-scheme: light");
    expect(css).not.toContain("--marketing-bg: #ffffff");
    expect(css).not.toContain(".site-brand-logo-light");
    expect(css).toContain("--marketing-accent: #f05a35");
    expect(css).toContain("Microsoft YaHei UI");
    expect(css).toContain("MiSans");
    expect(css).toContain("HarmonyOS Sans SC");
    expect(css).toContain(".home-hero-centered");
    expect(css).toContain(".home-hero-metrics");
    expect(css).toContain("white-space: pre-line");
    expect(css).toContain(".home-product-preview");
    expect(css).not.toContain(".enhe-orbital-system");
    expect(css).not.toContain(".home-hero-scroll-cue");
  });
});
