import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("site header logo source", () => {
  it("uses the same flat brand lockup as the hero mark", () => {
    const component = readFileSync(new URL("../components/site-header.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

    expect(component).toContain("site-brand");
    expect(component).toContain("site-brand-mark");
    expect(component).toContain("site-brand-wordmark");
    expect(component).toContain("FlatEnheLogoSvg");
    expect(component).toContain("site-header-transparent");
    expect(css).toContain(".site-brand");
    expect(css).toContain(".site-header-transparent");
    expect(css).toContain(".site-brand-wordmark");
    expect(css).toContain("letter-spacing: 0;");
    expect(css).toContain("transform: translateY(0.16rem);");
    expect(css).toContain("line-height: 1.08;");
    expect(component).not.toContain("next/image");
  });
});
