import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("hero logo source", () => {
  it("keeps the homepage mark flat, level, and animated without 3D depth", () => {
    const component = readFileSync(new URL("../components/hero-logo-mark.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

    expect(component).toContain("flatHeroLogoFill");
    expect(component).toContain("enhe-flat-logo-slat");
    expect(component).toContain("enhe-flat-logo-stem");
    expect(component).toContain("enhe-flat-logo-scan");
    expect(component).not.toContain("heroLogoDepthFill");
    expect(component).not.toContain("enhe-logo-depth");
    expect(css).toContain(".enhe-flat-logo-slat");
    expect(css).toContain("flat-logo-assemble");
    expect(css).toContain("flat-logo-scan");
    expect(css).not.toContain("perspective:");
    expect(css).not.toContain("rotateX(");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("animation: none !important;");
  });
});
