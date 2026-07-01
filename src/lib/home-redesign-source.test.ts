import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("homepage SaaS redesign source", () => {
  it("uses a simplified product-first homepage while keeping recommended tools and SEO support links", () => {
    const page = readFileSync(new URL("../app/page-shell.tsx", import.meta.url), "utf8");
    const header = readFileSync(new URL("../components/site-header.tsx", import.meta.url), "utf8");
    const dictionaries = readFileSync(new URL("../lib/dictionaries.ts", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8").replace(/\r\n/g, "\n");

    expect(page).toContain('className="home-page-shell"');
    expect(page).toContain("home-hero-shell");
    expect(page).toContain("HomeParticlesBackground");
    expect(page).toContain('className="home-hero-liquid-layer"');
    expect(page).toContain('aria-hidden="true"');
    expect(page).toContain("home-hero-stage");
    expect(page).toContain("home-hero-centered");
    expect(page).not.toContain('className="home-hero-intro"');
    expect(page).not.toContain("home-hero-background");
    expect(page).not.toContain("home-hero-unicorn-remix");
    expect(page).toContain('id="updates" className="home-featured-shell"');
    expect(page.indexOf("home-featured-shell")).toBeGreaterThan(page.indexOf("home-outcome-shell"));
    expect(page).toContain("const heroTitle =");
    expect(page).toContain("ENHE AI");
    expect(page).toContain("探索 AI 智能体、AI 工具与AI 技能，让 AI 成为你的效率伙伴，重塑你的未来。");
    expect(page).toContain("Explore AI agents, AI tools, and AI skills. Make AI your productivity partner and reshape your future.");
    expect(page).toContain("const heroIntro =");
    expect(page).not.toContain("home-hero-metrics");
    expect(page).not.toContain("t.home.metricsExploreTitle");
    expect(page).not.toContain("t.home.metricsExplore");
    expect(page).not.toContain("t.home.metricsOutcome");
    expect(page).toContain("t.home.softwareButton");
    expect(page).toContain("t.home.onlineButton");
    expect(page).toContain("t.home.aiNewsButton");
    expect(page).toContain("t.home.skillLearningButton");
    expect(page).not.toContain("HomeGooeyNav");
    expect(page).not.toContain("const heroCtaItems = [");
    expect(page).toContain('className="home-hero-actions"');
    expect(page).toContain('className="home-hero-cta home-hero-cta-primary"');
    expect(page).toContain('className="home-hero-cta home-hero-cta-accent"');
    expect(page).toContain('href={buildLocalePath("/software", forceLocale)}');
    expect(page).toContain('href={buildLocalePath("/ai-news", forceLocale)}');
    expect(page).toContain('forceLocale === "en" ? "View news" : "查看资讯"');
    expect(page).toContain("const homeProductPaths = {");
    expect(page).toContain("const homeSupportLinks = {");
    expect(page).not.toContain("const creatorOutcomeCards = {");
    expect(page).not.toContain("const creatorWorkflowSteps = {");
    expect(page).not.toContain("const buildYourOwnXSpotlight = {");
    expect(page).toContain('href: "/build-your-own-x"');
    expect(page).toContain('className="home-outcome-shell"');
    expect(page).toContain('className="home-outcome-grid home-product-path-grid"');
    expect(page).not.toContain("先从软件、课程或账号服务进入，再对比价格、交付方式和购买说明。");
    expect(page).not.toContain("Start with software, courses, or account services, then compare pricing and delivery details before purchase.");
    expect(page).toContain('className="home-support-shell"');
    expect(page).toContain('className="home-seo-disclosure"');
    expect(page).not.toContain('className="home-workflow-shell"');
    expect(page).not.toContain('className="home-byox-spotlight"');
    expect(page).toContain("t.home.featuredContentTitle");
    expect(page).not.toContain("t.home.featuredContentIntro");
    expect(page).not.toContain("take: 40");
    expect(page).not.toContain("recommendedTools.slice(previewTools.length)");
    expect(page).toContain("getHomeRecommendedTools");
    expect(page).toContain("getEffectiveLocalizedHomeHeroIntro(settings, forceLocale, t.home.intro)");
    expect(page).not.toContain('href="/account-services" variant="ghost" className="home-preview-link"');
    expect(page).toContain('href: "/software"');
    expect(page).toContain('href: "/account-services"');
    expect(page).toContain('href: "/ai-news"');
    expect(page).toContain('href: "/ai-trends"');
    expect(page).toContain('href: "/ai-topics"');
    expect(page).toContain('href: "/skill-learning"');
    expect(page).toContain("home-product-preview backdrop-blur-xl backdrop-saturate-150");
    expect(page).not.toContain("HeroLogoMark");
    expect(page).not.toContain("enhe-orbital-system");
    expect(page).not.toContain("enhe-circuit-line");
    expect(page).not.toContain("enhe-signal");
    expect(page).not.toContain("home-hero-scroll-cue");

    expect(header).toContain("t.nav.home");
    expect(header).toContain("t.nav.login");
    expect(header).toContain("{t.nav.user}");

    expect(dictionaries).toContain('titleSecondLine: "与 AI 共生，在变化中觉醒，用创造重塑未来"');
    expect(dictionaries).toContain('titleSecondLineEn: "Coexist with AI. Awaken through change. Create the future"');
    expect(dictionaries).toContain('metricsExploreTitle: "Explore Freely"');
    expect(dictionaries).toContain('metricsExplore: "Open More Possibilities with AI"');
    expect(dictionaries).toContain('featuredContentTitle: "Featured Content"');

    expect(css).toContain("color-scheme: dark");
    expect(css).toContain("--marketing-bg: #101821");
    expect(css).not.toContain("color-scheme: light");
    expect(css).not.toContain("--marketing-bg: #ffffff");
    expect(css).not.toContain(".site-brand-logo-light");
    expect(css).toContain("--marketing-accent: #41c5db");
    expect(css).toContain("--font-sans: 'Montserrat', 'Microsoft YaHei', 'Microsoft YaHei UI'");
    expect(css).toContain("--font-heading-zh: 'Montserrat', 'Microsoft YaHei', 'Microsoft YaHei UI'");
    expect(css).toContain(".home-page-shell");
    expect(css).toContain(".home-hero-liquid-layer");
    expect(css).toContain(".particles-container");
    expect(css).toContain(".home-particles-fallback");
    expect(css).toContain(".home-hero-stage");
    expect(css).toContain(".home-hero-centered");
    expect(css).toContain(".home-hero-title-simple");
    expect(css).not.toContain(".home-hero-metrics");
    expect(css).toContain(".home-featured-shell");
    expect(css).toContain(".home-outcome-shell");
    expect(css).toContain(".home-outcome-grid");
    expect(css).toContain(".home-product-path-grid");
    expect(css).toContain(".home-support-shell");
    expect(css).toContain(".home-seo-disclosure");
    expect(css).toContain("overflow-x: clip");
    expect(css).toContain("scroll-margin-top: 96px");
    expect(css).toContain(".home-hero-actions {\n  display: flex;");
    expect(css).toContain(".home-hero-actions {\n    width: 100%;\n    flex-wrap: wrap;");
    expect(css).toContain(".home-hero-cta {\n    flex: 1 1 calc(50% - 10px);");
    expect(css).not.toContain(".home-gooey-nav-list");
    expect(css).toContain("white-space: pre-line");
    expect(css).toContain(".home-product-preview {\n  width: min(100%, 1280px);\n  margin: 0 auto;");
    expect(css).not.toContain(".enhe-orbital-system");
    expect(css).not.toContain(".home-hero-scroll-cue");
  });

  it("uses a product-first sales hero instead of marquee-heavy bilingual motion", () => {
    const page = readFileSync(new URL("../app/page-shell.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8").replace(/\r\n/g, "\n");

    expect(page).not.toContain('import { ScrollVelocity } from "@/components/scroll-velocity";');
    expect(page).not.toContain("const heroVelocityTexts =");
    expect(page).not.toContain("texts={heroVelocityTexts}");
    expect(page).toContain('import { HomeParticlesBackground } from "@/components/home/home-particles-background";');
    expect(page).toContain('import DecryptedText from "@/components/home/decrypted-text";');
    expect(page).not.toContain('import TextPressure from "@/components/home/text-pressure";');
    expect(page).not.toContain('<p className="home-hero-brand">ENHE AI</p>');
    expect(page).toContain('<h1 className="home-hero-title home-hero-title-simple">{heroTitle}</h1>');
    expect(page).toContain('<p className="home-hero-positioning">');
    expect(page).toContain("text={heroIntro}");
    expect(page).toContain('animateOn="view"');
    expect(page).toContain("useOriginalCharsOnly");
    expect(page).toContain("home-hero-decrypted-text");
    expect(css).not.toContain(".home-hero-brand");
    expect(css).toContain(".home-hero-title-simple");
    expect(css).not.toContain("Roboto Flex ENHE");
    expect(css).not.toContain(".home-hero-title-pressure");
    expect(css).not.toContain(".text-pressure-title");
    expect(css).toContain(".home-hero-decrypted-text");
    expect(css).toContain(".home-hero-encrypted-letter");
    expect(css).toContain("font-size: clamp(4.05rem, 11.1vw, 9.15rem)");
    expect(css).toContain(".site-brand-logo-dark {\n  opacity: 1;\n  filter: brightness(0) invert(1)");
  });

  it("keeps the homepage hero title as static DOM text after removing TextPressure", () => {
    const page = readFileSync(new URL("../app/page-shell.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8").replace(/\r\n/g, "\n");

    expect(page).toContain('<h1 className="home-hero-title home-hero-title-simple">{heroTitle}</h1>');
    expect(page).not.toContain("TextPressure");
    expect(css).not.toContain("text-pressure");
    expect(css).not.toContain("Roboto Flex ENHE");
  });

  it("uses the React Bits Particles hero background with reduced-motion fallback", () => {
    const page = readFileSync(new URL("../app/page-shell.tsx", import.meta.url), "utf8");
    const background = readFileSync(new URL("../components/home/home-particles-background.tsx", import.meta.url), "utf8");
    const component = readFileSync(new URL("../components/home/particles.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8").replace(/\r\n/g, "\n");

    expect(page).toContain('import { HomeParticlesBackground } from "@/components/home/home-particles-background";');
    expect(page).toContain("<HomeParticlesBackground />");
    expect(background).toContain('window.matchMedia("(prefers-reduced-motion: reduce)")');
    expect(background).toContain("navigator.webdriver");
    expect(background).toContain('return <div className="home-particles-fallback" />;');
    expect(background).toContain('const HERO_PARTICLE_COLORS = ["#13c4e2"];');
    expect(background).toContain("particleColors={HERO_PARTICLE_COLORS}");
    expect(background).toContain("particleCount={200}");
    expect(background).toContain("particleSpread={10}");
    expect(background).toContain("speed={0.1}");
    expect(background).toContain("particleBaseSize={100}");
    expect(background).toContain("moveParticlesOnHover");
    expect(background).toContain("alphaParticles={false}");
    expect(background).toContain("disableRotation={false}");
    expect(background).toContain("pixelRatio={1}");
    expect(component).toContain('import { Camera, Geometry, Mesh, Program, Renderer } from "ogl";');
    expect(component).toContain("Adapted from React Bits Particles");
    expect(component).toContain("requestAnimationFrame(update)");
    expect(component).toContain("cancelAnimationFrame(animationFrameId)");
    expect(component).toContain('container.addEventListener("mousemove", handleMouseMove)');
    expect(css).toContain(".particles-container");
    expect(css).toContain(".home-particles-canvas");
    expect(css).toContain(".home-particles-fallback");
  });

  it("uses DecryptedText as a visual-only hero slogan upgrade with reduced-motion fallback", () => {
    const component = readFileSync(new URL("../components/home/decrypted-text.tsx", import.meta.url), "utf8");

    expect(component).toContain('import { motion, useReducedMotion } from "motion/react";');
    expect(component).toContain("const shouldReduceMotion = useReducedMotion();");
    expect(component).toContain("<span style={styles.srOnly}>{text}</span>");
    expect(component).toContain("if (shouldReduceMotion) {");
    expect(component).toContain("{text}");
    expect(component).toContain("Adapted from React Bits DecryptedText");
  });

  it("uses simplified product cards in the homepage featured preview without changing the full card contract", () => {
    const page = readFileSync(new URL("../app/page-shell.tsx", import.meta.url), "utf8");
    const toolCard = readFileSync(new URL("../components/tool-card.tsx", import.meta.url), "utf8");

    expect(page).toContain('<ToolCard key={tool.id} tool={tool} locale={forceLocale} variant="homeFeatured" />');
    expect(toolCard).toContain('variant?: "default" | "homeFeatured"');
    expect(toolCard).toContain('variant = "default"');
    expect(toolCard).toContain('const showMarketingMeta = variant !== "homeFeatured"');
    expect(toolCard).toContain("{showMarketingMeta ? (");
    expect(toolCard).toContain("t.toolCard.audienceLabel");
    expect(toolCard).toContain("buildCardHighlights");
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
    expect(css).toContain(".home-hero-velocity-copy");
    expect(css).not.toContain(".home-hero-metrics strong");
    expect(css).not.toContain(".home-hero-metrics span");
    expect(css).toContain(".home-hero-cta");
    expect(css).toContain("font-family: var(--font-heading-zh)");
    expect(css).toContain(".site-nav-link,\n.site-login-link,\n.site-admin-link {\n  min-height: 44px;\n  align-items: center;\n  border-radius: 999px;\n  color: var(--marketing-text);");
    expect(css).toContain(".site-user-center-cta {\n  align-items: center;");
    expect(css).toContain(".site-header-actions > .site-login-link,\n.site-header-actions > .site-user-center-cta,\n.site-header-actions > .site-user-chip {\n  display: none;");
    expect(css).toContain(".site-header-actions > .site-login-link,\n  .site-header-actions > .site-user-center-cta,\n  .site-header-actions > .site-user-chip {\n    display: inline-flex;");
    expect(css).toContain("background: #ffffff;\n  color: #050505;");
    expect(css).toContain(".site-user-center-cta,\n.mobile-nav-user-center {\n  background: #ffffff !important;\n  color: #050505 !important;");
    expect(css).toContain(".site-language-switcher a {");
    expect(css).toContain("min-height: 40px;");
    expect(css).toContain("color: var(--marketing-text);");
    expect(css).toContain(".site-language-switcher a.is-active {\n  background: var(--marketing-button);");
    expect(css).toContain(".site-language-switcher a.is-active {\n  background: #050505;");
  });

  it("keeps the simplified hero scale stable on desktop and mobile", () => {
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8").replace(/\r\n/g, "\n");

    expect(css).toContain(".home-hero-title-simple");
    expect(css).toContain("font-size: clamp(4.05rem, 11.1vw, 9.15rem)");
    expect(css).toContain("font-size: clamp(4.05rem, 22vw, 6.375rem)");
    expect(css).toContain("gap: 0.58em;");
  });

  it("polishes the hero label, CTA contrast, and footer while preserving SEO and GEO source contracts", () => {
    const footer = readFileSync(new URL("../components/site-footer.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8").replace(/\r\n/g, "\n");
    const page = readFileSync(new URL("../app/page-shell.tsx", import.meta.url), "utf8");
    const publicChrome = readFileSync(new URL("../components/public-site-chrome.tsx", import.meta.url), "utf8");

    expect(css).toContain(".home-hero-eyebrow {");
    expect(css).toContain("display: inline-flex;");
    expect(css).toContain("border: 1px solid rgba(255, 255, 255, 0.22)");
    expect(css).toContain("background-color: transparent");
    expect(css).toContain("background-image: none");
    expect(css).toContain("--home-hero-eyebrow-filter: blur(18px) saturate(150%)");
    expect(css).toContain("backdrop-filter: var(--home-hero-eyebrow-filter)");
    expect(css).toContain("min-width: 176px;");
    expect(css).toContain("min-height: 48px;");
    expect(css).toContain("border-radius: 9px !important");
    expect(css).toContain("--home-hero-cta-filter: blur(20px) saturate(165%) contrast(1.04)");
    expect(css).toContain("backdrop-filter: var(--home-hero-cta-filter) !important");
    expect(css).toContain("border: 1px solid rgba(255, 255, 255, 0.18) !important");
    expect(css).toContain("background-color: transparent !important");
    expect(css).toContain("background-image: none !important");
    expect(css).toContain(".home-hero-cta-primary,\n.home-hero-cta-accent {\n  background: transparent");
    expect(css).toContain("color: #ffffff");
    expect(css).toContain(".home-outcome-shell {\n  margin-top: clamp(-6rem, -8vw, -4rem);");
    expect(css).toContain("linear-gradient(180deg, rgba(16, 24, 33, 0) 0%, rgba(16, 24, 33, 0) 54%, rgba(16, 24, 33, 0.32) 72%, rgba(16, 24, 33, 0.82) 91%, #101821 100%)");
    expect(css).toContain("margin-bottom: -1px;");
    expect(css).toContain("top: clamp(-20rem, -24vw, -12rem);");
    expect(css).toContain("background: radial-gradient(ellipse at 50% 54%, rgba(65, 197, 219, 0.08), transparent 34rem)");
    expect(css).toContain(".home-recommended-tool-grid .surface-panel");
    expect(css).toContain(".site-footer-logo {\n  width: 48px;\n  height: 32px;\n  object-fit: contain;\n  filter: brightness(0) invert(1)");
    expect(css).not.toContain(".home-gooey-effect.filter");
    expect(css).not.toContain(".home-gooey-particle");
    expect(css).not.toContain("@keyframes home-gooey-particle");
    expect(css).not.toContain("--home-gooey-filter");
    expect(css).not.toContain("radial-gradient(circle at 18% 0%, rgba(255, 255, 255, 0.24)");
    expect(css).not.toContain(".home-hero-cta-accent {\n  background: var(--marketing-accent)");
    expect(css).not.toContain("background-color: rgba(240, 90, 53, 0.94)");
    expect(page).toContain("<ButtonLink");
    expect(page).not.toContain("home-gooey-nav");

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
