import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

function source(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8").replace(/\r\n/g, "\n");
}

describe("homepage ASCII hero title source", () => {
  it("keeps a semantic h1 while rendering one visual ASCII title", () => {
    const page = source("../app/page-shell.tsx");
    const wrapperUrl = new URL("../components/home/ascii-hero-title.tsx", import.meta.url);

    expect(existsSync(fileURLToPath(wrapperUrl))).toBe(true);

    const wrapper = source("../components/home/ascii-hero-title.tsx");
    expect(page).toContain('import { ASCIIHeroTitle } from "@/components/home/ascii-hero-title";');
    expect(page).toContain('<h1 className="sr-only">{heroTitle}</h1>');
    expect(page).toContain('<ASCIIHeroTitle text={heroTitle} />');
    expect(page).toContain("<HomeParticlesBackground />");
    expect(page).not.toContain('<h1 className="home-hero-title home-hero-title-simple">{heroTitle}</h1>');
    expect(wrapper).toContain('dynamic(() => import("@/components/home/ascii-text.client")');
    expect(wrapper).toContain("ssr: false");
    expect(wrapper).toContain("loading: () => null");
    expect(wrapper).toContain('window.matchMedia("(prefers-reduced-motion: reduce)")');
    expect(wrapper).toContain('window.matchMedia("(max-width: 767px)")');
    expect(wrapper).toContain('type RenderMode = "pending" | "static" | "mobile" | "tablet" | "desktop";');
    expect(wrapper).toContain('useState<RenderMode>("pending")');
    expect(wrapper).toContain("const TITLE_SCALE = 1.9;");
    expect(wrapper).toContain('setRenderMode("mobile")');
    expect(wrapper).not.toContain("reducedMotionQuery.matches || mobileQuery.matches");
    expect(wrapper).toContain('textFontSize={(renderMode === "desktop" ? 220 : 180) * TITLE_SCALE}');
    expect(wrapper).toContain('planeBaseHeight={(renderMode === "desktop" ? 8 : 7) * TITLE_SCALE}');
    expect(wrapper).toContain("navigator.webdriver");
    expect(wrapper).toContain("WebGLRenderingContext");
    expect(wrapper).toContain('text="ENHE AI"');
  });

  it("scopes the ASCII renderer and releases every browser resource", () => {
    const componentUrl = new URL("../components/home/ascii-text.client.tsx", import.meta.url);
    const stylesUrl = new URL("../components/home/ascii-text.module.css", import.meta.url);

    expect(existsSync(fileURLToPath(componentUrl))).toBe(true);
    expect(existsSync(fileURLToPath(stylesUrl))).toBe(true);

    const component = source("../components/home/ascii-text.client.tsx");
    const styles = source("../components/home/ascii-text.module.css");
    expect(component).toContain('"use client"');
    expect(component).toContain('import * as THREE from "three";');
    expect(component).toContain("requestAnimationFrame");
    expect(component).toContain("cancelAnimationFrame");
    expect(component).toContain("new ResizeObserver");
    expect(component).toContain("new IntersectionObserver");
    expect(component).toContain("resizeObserver.disconnect()");
    expect(component).toContain("visibilityObserver.disconnect()");
    expect(component).toContain("this.texture.dispose()");
    expect(component).toContain("this.material.dispose()");
    expect(component).toContain("this.geometry.dispose()");
    expect(component).toContain("this.renderer.dispose()");
    expect(component).toContain("this.renderer.forceContextLoss()");
    expect(component).toContain("this.pre.textContent = output");
    expect(component).toContain('type RenderStatus = "loading" | "ready" | "failed";');
    expect(component).toContain('setRenderStatus("failed")');
    expect(component).toContain("data-status={renderStatus}");
    expect(component).not.toContain("fonts.googleapis.com");
    expect(styles).toContain(".asciiTextContainer");
    expect(styles).toContain(".asciiTextContainer canvas");
    expect(styles).toContain(".staticWordmark");
    expect(styles).toContain(".staticOnly .staticWordmark");
    expect(styles).toContain('.asciiTextContainer[data-status="failed"] .staticWordmark');
    expect(styles).toContain("transform: translateY(12px)");
    expect(styles).not.toContain("filter: drop-shadow");
    expect(styles).toContain("@media (max-width: 767px)");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).not.toContain("#ff6188");
    expect(styles).not.toContain("#fc9867");
    expect(styles).not.toContain("#ffd866");
  });
});
