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
      'label: "AI 学习"',
      'label: "AI 资讯"',
      'label: "Productivity"',
      'label: "Content Creation"',
      'label: "AI Learning"',
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

  it("uses a transparent surface, white internal dividers, and half-size type", () => {
    const page = readSource("../app/page-shell.tsx");
    const css = readSource("../components/home/flowing-menu.module.css");

    expect(page).toContain('bgColor="transparent"');
    expect(page).toContain('borderColor="#ffffff"');
    expect(css).not.toContain("border-block:");
    expect(css).toContain("border-top: 1px solid var(--enhe-flowing-border);");
    expect(css).toMatch(
      /\.enhe-flowing-menu__link \{[^}]*font-size: 2rem;/,
    );
    expect(css).toMatch(
      /\.enhe-flowing-menu__marquee-text \{[^}]*font-size: 1\.75rem;/,
    );

    for (const fontSize of [
      "1.625rem",
      "1.5rem",
      "1.375rem",
      "1.25rem",
      "1rem",
      "0.875rem",
    ]) {
      expect(css).toContain(`font-size: ${fontSize};`);
    }
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
