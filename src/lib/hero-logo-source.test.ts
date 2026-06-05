import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("hero logo source", () => {
  it("keeps the homepage mark crisp and stable inside the hero", () => {
    const component = readFileSync(new URL("../components/hero-logo-mark.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

    expect(component).toContain("heroLogoPrecisionFill");
    expect(component).toContain("heroLogoEdgeBloom");
    expect(component).toContain("enhe-logo-depth");
    expect(component).toContain("enhe-logo-highlight");
    expect(component).toContain("enhe-logo-ground");
    expect(component).toContain("enhe-logo-precision-line");
    expect(component).toContain("enhe-logo-balance-line");
    expect(component).toContain("enhe-logo-takeoff-front");
    expect(component).toContain("enhe-logo-takeoff-tail");
    expect(css).toContain("perspective:");
    expect(css).toContain(".enhe-logo-depth");
    expect(css).toContain(".enhe-logo-highlight");
    expect(css).toContain("rotateZ(2.4deg)");
    expect(css).not.toContain("rotateZ(5.6deg)");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("animation: none !important;");
  });
});
