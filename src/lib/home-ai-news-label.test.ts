import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { dictionaries } from "@/lib/i18n";

describe("home AI news label contracts", () => {
  it("uses the AI frontier news naming on Chinese public surfaces", () => {
    expect(dictionaries.zh.nav.aiNews).toBe("AI前沿资讯");
    expect(dictionaries.zh.home.aiNewsButton).toBe("AI前沿资讯");
    expect(dictionaries.zh.aiNews.title).toBe("AI前沿资讯与趋势洞察");
  });

  it("keeps the home hero wired to the AI news route with alternating black and orange button styles", () => {
    const page = readFileSync(new URL("../app/page-shell.tsx", import.meta.url), "utf8");

    expect(page).toContain("t.home.aiNewsButton");
    expect(page).toContain('href={forceLocale === "en" ? "/en/ai-news" : "/ai-news"}');
    expect(page).toContain('{t.home.aiNewsButton}');
    expect(page.indexOf("{t.home.aiNewsButton}")).toBeLessThan(page.indexOf("{t.home.softwareButton}"));
    expect(page).toContain('href={forceLocale === "en" ? "/en/ai-news" : "/ai-news"} className="home-hero-cta home-hero-cta-primary"');
    expect(page).toContain('href={forceLocale === "en" ? "/en/software" : "/software"} className="home-hero-cta home-hero-cta-accent"');
    expect(page).toContain('href={forceLocale === "en" ? "/en/account-services" : "/account-services"} className="home-hero-cta home-hero-cta-primary"');
    expect(page).toContain('href={forceLocale === "en" ? "/en/skill-learning" : "/skill-learning"} className="home-hero-cta home-hero-cta-accent"');
  });
});
