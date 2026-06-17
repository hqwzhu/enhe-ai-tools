import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("homepage SaaS redesign source", () => {
  it("implements the accepted night-only minimalist homepage direction", () => {
    const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
    const header = readFileSync(new URL("../components/site-header.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

    expect(page).toContain("home-hero-shell");
    expect(page).toContain("home-hero-centered");
    expect(page).toContain("Symbiosis · Awakening · Creation");
    expect(page).not.toContain("ENHE AI Tools");
    expect(page).toContain('const defaultHeroTitle = "ENHE AI";');
    expect(page).toContain('const defaultHeroTitleSecondLine = "重塑你的人生";');
    expect(page).toContain("与 AI 共生，在时代中觉醒，用创造定义未来。");
    expect(page).not.toContain("我们都想变得更好，只是常常被重复工作、琐碎流程和生活难题占满时间。");
    expect(page).not.toContain("让 AI 成为你的智能助手，帮你减少消耗、提升效率，把更多精力留给成长、创造和真正想做的事。");
    expect(page).not.toContain("AI工具");
    expect(page).not.toContain("即刻可用");
    expect(page).not.toContain("用精选软件、账号服务和技能课程，把重复工作交给 AI 自动化");
    expect(page).toContain("const heroLines = [defaultHeroTitle, defaultHeroTitleSecondLine];");
    expect(page).not.toContain("configuredHeroTitle");
    expect(page).toContain("30+");
    expect(page).toContain("精选工具与课程");
    expect(page).toContain("灵感落地");
    expect(page).toContain("把想法变成看得见的成果");
    expect(page).not.toContain("自动解锁");
    expect(page).not.toContain("支付后开通权益");
    expect(page).toContain('href="/software"');
    expect(page).toContain('href="/skill-learning"');
    expect(page).toContain("home-product-preview backdrop-blur-xl backdrop-saturate-150");
    expect(page).toContain("recommendedTools");
    expect(page).toContain("isHomeRecommended: true");
    expect(page).toContain("take: 40");
    expect(page).not.toContain("HeroLogoMark");
    expect(page).not.toContain("enhe-orbital-system");
    expect(page).not.toContain("enhe-circuit-line");
    expect(page).not.toContain("enhe-signal");
    expect(page).not.toContain("home-hero-scroll-cue");

    expect(header).toContain("用户中心");
    expect(header).not.toContain("查看工具");
    expect(header).not.toContain("帮助支持");

    expect(css).toContain("color-scheme: dark");
    expect(css).toContain("--marketing-bg: #22242a");
    expect(css).not.toContain("color-scheme: light");
    expect(css).not.toContain("--marketing-bg: #ffffff");
    expect(css).not.toContain(".site-brand-logo-light");
    expect(css).toContain("--marketing-bg: #22242a");
    expect(css).toContain("--marketing-accent: #f05a35");
    expect(css).toContain("Microsoft YaHei UI");
    expect(css).toContain("MiSans");
    expect(css).toContain("HarmonyOS Sans SC");
    expect(css).toContain(".home-hero-centered");
    expect(css).toContain(".home-hero-metrics");
    expect(css).toMatch(
      /\.site-user-center-cta \{[\s\S]*min-width: 0;[\s\S]*min-height: 32px;[\s\S]*font-size: 12px;[\s\S]*padding: 0 13px;/
    );
    expect(css).toMatch(
      /\.home-hero-metrics strong \{[\s\S]*font-size: clamp\(1\.4rem, 2\.8vw, 2\.2rem\);/
    );
    expect(css).toContain("white-space: pre-line");
    expect(css).toContain(".home-product-preview");
    expect(css).toContain("backdrop-filter: blur(28px) saturate(160%)");
    expect(css).toContain("-webkit-backdrop-filter: blur(28px) saturate(160%)");
    expect(css).toContain("background-color: rgba(35, 38, 47, 0.54)");
    expect(css).toContain("background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.095), rgba(255, 255, 255, 0.035))");
    expect(css).toContain("radial-gradient(circle at 8% 0%, rgba(255, 255, 255, 0.075), transparent 34%)");
    expect(css).toContain("linear-gradient(90deg, rgba(255, 255, 255, 0.035), transparent 48%)");
    expect(css).not.toContain(".enhe-orbital-system");
    expect(css).not.toContain(".home-hero-scroll-cue");
  });
});
