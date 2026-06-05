import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("site header logo source", () => {
  it("uses a polished brand lockup that matches the hero mark", () => {
    const component = readFileSync(new URL("../components/site-header.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

    expect(component).toContain("site-brand");
    expect(component).toContain("site-brand-mark");
    expect(component).toContain("site-brand-wordmark");
    expect(component).toContain("width={30}");
    expect(component).toContain("height={30}");
    expect(css).toContain(".site-brand");
    expect(css).toContain(".site-brand-mark::after");
    expect(css).toContain(".site-brand-wordmark");
    expect(css).toContain("letter-spacing: 0;");
  });
});
