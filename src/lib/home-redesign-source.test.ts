import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("homepage redesign source", () => {
  it("keeps the accepted minimalist hero structure and flat brand treatment", () => {
    const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
    const header = readFileSync(new URL("../components/site-header.tsx", import.meta.url), "utf8");
    const logo = readFileSync(new URL("../components/hero-logo-mark.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

    expect(page).toContain("home-hero-shell");
    expect(page).toContain("min-h-[calc(100dvh-4rem)]");
    expect(page).toContain("heroSubtitle");
    expect(page).toContain("home-feature-sections");

    expect(header).toContain("site-header-transparent");
    expect(header).not.toContain("border-b border-[rgba(210,230,255,0.14)]");
    expect(header).not.toContain("bg-[#070A12]/78");
    expect(header).not.toContain("backdrop-blur-2xl");

    expect(logo).toContain("flatHeroLogoFill");
    expect(logo).toContain("enhe-flat-logo-slat");
    expect(logo).not.toContain("heroLogoDepthFill");
    expect(logo).not.toContain("enhe-logo-depth");

    expect(css).toContain(".home-hero-shell");
    expect(css).toContain(".home-feature-sections");
    expect(css).toContain(".enhe-flat-logo-slat");
    expect(css).not.toContain("perspective: 980px");
    expect(css).not.toContain("rotateX(6deg) rotateY(4deg)");
  });
});
