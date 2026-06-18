import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("site header navigation", () => {
  it("adds the homepage nav item first and keeps the update log item on the homepage instead of exposing tutorials", () => {
    const source = readFileSync(new URL("../components/site-header.tsx", import.meta.url), "utf8");

    expect(source).toContain("nav.home");
    expect(source).toContain("nav.software");
    expect(source).toContain("nav.onlineTools");
    expect(source).toContain("nav.skillLearning");
    expect(source).toContain("nav.aiNews");
    expect(source).toContain('href: buildLocalePath("/ai-news", locale)');
    expect(source).toContain("t.nav.login");
    expect(source).not.toContain('"/tutorials"');
    expect(source).not.toContain("t.nav.tutorials");
    expect(source).toContain('href: buildLocalePath("/#updates", locale)');
  });
});
