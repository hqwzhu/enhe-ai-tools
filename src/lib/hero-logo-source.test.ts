import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("hero logo source", () => {
  it("uses layered 3D glass treatments for the homepage mark", () => {
    const component = readFileSync(new URL("../components/hero-logo-mark.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

    expect(component).toContain("heroDepthFill");
    expect(component).toContain("heroLogoGlassHighlight");
    expect(component).toContain("enhe-logo-depth");
    expect(component).toContain("enhe-logo-highlight");
    expect(component).toContain("enhe-logo-takeoff-front");
    expect(component).toContain("enhe-logo-takeoff-tail");
    expect(component).toContain("enhe-logo-takeoff-front enhe-logo-slat-top");
    expect(component).toContain("enhe-logo-takeoff-tail enhe-logo-metal");
    expect(css).toContain("perspective:");
    expect(css).toContain(".enhe-logo-depth");
    expect(css).toContain(".enhe-logo-highlight");
    expect(css).toContain("rotateZ(5.6deg)");
  });
});
