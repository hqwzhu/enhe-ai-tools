import { existsSync, readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

function readSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8").replace(/\r\n/g, "\n");
}

describe("homepage FlowingMenu source contract", () => {
  it("replaces the old demand cards with four localized internal routes", () => {
    const page = readSource("../app/page-shell.tsx");
    const dictionaries = readSource("../lib/dictionaries.ts");

    expect(page).toContain("<FlowingMenu");
    expect(page).not.toContain("Choose by need");
    expect(page).not.toContain("按需求选择");
    expect(page).not.toContain("home-product-path-grid");

    for (const path of [
      'href: "/product-paths/work-efficiency"',
      'href: "/product-paths/media-generation"',
      'href: "/skill-learning"',
      'href: "/ai-news"',
    ]) {
      expect(page).toContain(path);
    }

    for (const label of [
      'label: "工作效率"',
      'label: "内容创作"',
      'label: "AI 教程"',
      'label: "AI 资讯"',
      'label: "Productivity"',
      'label: "Content Creation"',
      'label: "AI Tutorials"',
      'label: "AI News"',
    ]) {
      expect(dictionaries).toContain(label);
    }
  });

  it("keeps GSAP interaction local, cancellable, keyboard accessible, and motion aware", () => {
    const component = readSource("../components/home/flowing-menu.client.tsx");

    expect(component).toContain('"use client"');
    expect(component).toContain('import Link from "next/link"');
    expect(component).toContain("loopTweenRef.current?.kill()");
    expect(component).toContain("revealTimelineRef.current?.kill()");
    expect(component).toContain("observer.disconnect()");
    expect(component).toContain('window.matchMedia("(prefers-reduced-motion: reduce)")');
    expect(component).toContain('window.matchMedia("(hover: hover) and (pointer: fine)")');
    expect(component).toContain("onFocus={() => setMarqueeVisibility(true, \"bottom\")}");
    expect(component).toContain("onBlur={() => setMarqueeVisibility(false, \"bottom\")}");
    expect(component).toContain("const labelRef = useRef<HTMLSpanElement>(null)");
    expect(component).toContain(".set(label, { opacity: 0 }, 0)");
    expect(component).toContain("gsap.set(label, { opacity: 1 })");
    expect(component).toContain("<span ref={labelRef}>{text}</span>");
    expect(component).toContain('aria-hidden="true"');
    expect(component).not.toContain("setTimeout(");
  });

  it("scopes styles and retains touch and reduced-motion fallbacks", () => {
    const css = readSource("../components/home/flowing-menu.module.css");

    expect(css).toContain(".enhe-flowing-menu {");
    expect(css).toContain(".enhe-flowing-menu__marquee {");
    expect(css).toContain("@media (hover: none), (pointer: coarse)");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain(".enhe-flowing-menu__static-image");
    expect(css).not.toMatch(/(^|\n)\.menu(?:\s|\{|__)/);
    expect(css).not.toMatch(/(^|\n)\.marquee(?:\s|\{|__)/);
  });

  it("uses compact transparent rows and 95-percent white internal dividers", () => {
    const page = readSource("../app/page-shell.tsx");
    const css = readSource("../components/home/flowing-menu.module.css");
    const globalCss = readSource("../app/globals.css");

    expect(page).toContain('bgColor="transparent"');
    expect(page).toContain('marqueeBgColor="transparent"');
    expect(page).toContain('marqueeTextColor="#f7fbff"');
    expect(page).toContain('borderColor="rgba(255, 255, 255, 0.95)"');
    expect(css).not.toContain("border-block:");
    expect(css).toContain("border-top: 1px solid var(--enhe-flowing-border);");
    expect(css).toContain("height: 260px;");
    expect(css).toContain("height: 230px;");
    expect(css).toContain("height: 208px;");
    expect(css).toContain("height: 192px;");
    expect(css).not.toContain("height: 520px;");
    expect(css).not.toContain("height: 460px;");
    expect(css).not.toContain("height: 416px;");
    expect(css).not.toContain("height: 384px;");
    expect(css).not.toContain("background: rgba(86, 191, 208, 0.12);");
    expect(globalCss).toContain(".home-flowing-menu-container {");
    expect(globalCss).toContain("max-width: 1280px !important;");
    expect(globalCss).not.toContain("max-width: 1480px !important;");
    expect(globalCss).toContain("font-size: 17px !important;");
    expect(css.match(/font-size: 17px;/g)).toHaveLength(7);
    expect(css).toContain("font-size: 18.2px;");
    expect(css).toContain("html[lang='en-US'] .enhe-flowing-menu__link");
    expect(css).toContain("html[lang='en-US'] .enhe-flowing-menu__marquee-text");
    expect(css).toContain("font-weight: 300;");
    expect(css.match(/font-size: clamp\(12\.4px, 3\.2vw, 13\.4px\);/g)).toHaveLength(1);
  });

  it("uses four compressed local WebP assets with recorded Pexels sources", () => {
    const assetNames = ["productivity", "content-creation", "ai-learning", "ai-news"];
    const sourceRecord = readSource("../../docs/asset-sources/home-flowing-menu.md");

    for (const assetName of assetNames) {
      const assetUrl = new URL(
        `../../public/images/home/flowing-menu/${assetName}.webp`,
        import.meta.url,
      );
      expect(existsSync(assetUrl)).toBe(true);
      expect(statSync(assetUrl).size).toBeLessThan(150_000);
      expect(sourceRecord).toContain(`flowing-menu/${assetName}.webp`);
    }

    expect(sourceRecord).toContain("https://www.pexels.com/license/");
  });
});
